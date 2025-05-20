import os
import sys
import logging
import traceback
from typing import Optional, Union, Dict, Any

# Import torch first to check MPS availability
try:
    import torch
    MPS_AVAILABLE = hasattr(torch.backends, 'mps') and torch.backends.mps.is_available()
    CUDA_AVAILABLE = torch.cuda.is_available()
except ImportError:
    MPS_AVAILABLE = False
    CUDA_AVAILABLE = False
    torch = None

from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline, BitsAndBytesConfig
from langchain_community.llms import LlamaCpp, HuggingFacePipeline
from langchain.chains import RetrievalQA
from langchain.prompts import ChatPromptTemplate

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class ModelLoadingError(Exception):
    """Custom exception for model loading errors"""
    pass

def _validate_model_path(model_path: str) -> str:
    """Validate and expand the model path.
    
    Args:
        model_path: Path to the model file or directory
        
    Returns:
        str: Expanded and validated model path
        
    Raises:
        ModelLoadingError: If the model path is invalid or doesn't exist
    """
    try:
        expanded_path = os.path.expanduser(model_path)
        if not os.path.exists(expanded_path):
            raise ModelLoadingError(f"Model path does not exist: {expanded_path}")
        return expanded_path
    except Exception as e:
        raise ModelLoadingError(f"Error validating model path {model_path}: {str(e)}") from e

###############################
### Model Loading Functions ###
###############################

def load_hf_inference_model(model_path: str) -> HuggingFacePipeline:
    """Loads a HuggingFace model and returns a HuggingFacePipeline for inference.
    
    Args:
        model_path: Path to the HuggingFace model directory or model ID
        
    Returns:
        HuggingFacePipeline: Initialized pipeline for text generation
        
    Raises:
        ModelLoadingError: If there's an error loading the model or tokenizer
    """
    try:
        logger.info(f"Loading HuggingFace model from {model_path}")
        
        # Load tokenizer with error handling
        try:
            tokenizer = AutoTokenizer.from_pretrained(model_path)
        except Exception as e:
            raise ModelLoadingError(f"Failed to load tokenizer: {str(e)}") from e
        
        # Load model with appropriate device settings
        try:
            if torch.cuda.is_available():
                logger.info("CUDA is available, using GPU acceleration")
                model = AutoModelForCausalLM.from_pretrained(
                    model_path, 
                    device_map="auto",
                    attn_implementation="flash_attention_2",
                    torch_dtype=torch.bfloat16,
                    quantization_config=BitsAndBytesConfig(
                        load_in_4bit=True,
                        bnb_4bit_compute_dtype=torch.bfloat16,
                        bnb_4bit_use_double_quant=True,
                        bnb_4bit_quant_type='nf4'
                    )
                )
            else:
                logger.warning("CUDA not available, using CPU (this will be slow for large models)")
                model = AutoModelForCausalLM.from_pretrained(model_path)
        except Exception as e:
            raise ModelLoadingError(f"Failed to load model: {str(e)}") from e

        # Create text generation pipeline
        try:
            logger.info("Creating text generation pipeline")
            text_generation_pipeline = pipeline(
                "text-generation",
                model=model,
                tokenizer=tokenizer,
                temperature=0.1,
                max_new_tokens=2000,
                do_sample=True,
                device=0 if torch.cuda.is_available() else -1  # -1 for CPU
            )
            return HuggingFacePipeline(pipeline=text_generation_pipeline)
            
        except Exception as e:
            raise ModelLoadingError(f"Failed to create text generation pipeline: {str(e)}") from e
            
    except Exception as e:
        logger.error(f"Error in load_hf_inference_model: {str(e)}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        raise

 

def load_cpp_inference_model(model_path: str, **kwargs) -> LlamaCpp:
    """Loads the llama.cpp (GGUF) model and returns the model for inference.
    Optimized for MPS (Metal Performance Shaders) on macOS.
    
    Args:
        model_path: Path to the GGUF model file
        **kwargs: Additional arguments to pass to LlamaCpp
        
    Returns:
        LlamaCpp: Initialized LlamaCpp model
        
    Raises:
        ModelLoadingError: If there's an error loading the model
    """
    try:
        # Validate model path first
        validated_path = _validate_model_path(model_path)
        logger.info(f"Loading GGUF model from {validated_path}")
        
        # Log hardware acceleration status
        logger.info(f"Hardware Acceleration: MPS={MPS_AVAILABLE}, CUDA={CUDA_AVAILABLE}")
        
        # Set GPU layers based on available hardware
        if MPS_AVAILABLE:
            n_gpu_layers = 1  # Start with 1 layer for MPS
        elif CUDA_AVAILABLE:
            n_gpu_layers = -1  # Use all layers for CUDA
        else:
            n_gpu_layers = 0  # CPU only
        
        # Base parameters optimized for MPS/CPU on Mac
        model_params = {
            'model_path': validated_path,
            'n_ctx': 2048,  # Reduced context window for better performance
            'n_threads': min(4, os.cpu_count() if os.cpu_count() else 4),  # Limit threads for better performance
            'n_gpu_layers': n_gpu_layers,  # Set based on hardware detection
            'n_batch': 512,  # Process in smaller batches
            'use_mlock': True,  # Prevent swapping to disk
            'f16_kv': True,  # Use 16-bit key/value cache
            'verbose': False,  # Disable verbose output
            'temperature': 0.7,  # Slightly higher for more diverse responses
            'top_p': 0.9,  # Nucleus sampling
            'top_k': 40,  # Limit to top-k tokens
            'max_tokens': 512,  # Reasonable response length
            'repeat_penalty': 1.1,  # Slightly discourage repetition
            'stop': ["\nHuman:", "\n###", "\n##"]  # Stop sequences
        }
        
        # If MPS is available, set up additional parameters
        if MPS_AVAILABLE:
            model_params.update({
                'main_gpu': 0,  # Use the first GPU
                'tensor_split': [1.0],  # Use full GPU
                'n_threads': 4,  # Reduce CPU threads since we're using GPU
            })
        
        # Update with any user-provided kwargs (allowing overrides)
        model_params.update(kwargs)
        
        try:
            logger.info(f"Initializing LlamaCpp with params: { {k: v for k, v in model_params.items() if k != 'model_path' and not k.startswith('_')} }")
            
            # Initialize the model
            model = LlamaCpp(**model_params)
            
            # Set device to MPS if available
            if MPS_AVAILABLE and torch is not None:
                try:
                    # Use a more compatible approach for MPS
                    model.client.ctx.metal = True
                    logger.info("Enabled Metal acceleration")
                except Exception as e:
                    logger.warning(f"Could not enable Metal acceleration: {e}")
            else:
                logger.info("Running on CPU")
            
            logger.info("Model loaded successfully")
            return model
            
        except Exception as e:
            error_msg = f"Failed to initialize LlamaCpp model: {str(e)}"
            logger.error(error_msg)
            logger.debug(f"Traceback: {traceback.format_exc()}")
            raise ModelLoadingError(error_msg) from e
            
    except ModelLoadingError:
        raise  # Re-raise our custom exceptions
    except Exception as e:
        error_msg = f"Unexpected error in load_cpp_inference_model: {str(e)}"
        logger.error(error_msg)
        logger.debug(f"Traceback: {traceback.format_exc()}")
        raise ModelLoadingError(error_msg) from e