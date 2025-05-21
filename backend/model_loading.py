import os
import sys
import logging
import traceback
from typing import Optional, Union, Dict, Any

# Import torch first to check MPS availability
try:
    import torch
    import time  # For model warm-up timing
    
    # Check hardware acceleration options
    MPS_AVAILABLE = hasattr(torch.backends, 'mps') and torch.backends.mps.is_available()
    CUDA_AVAILABLE = torch.cuda.is_available()
    if MPS_AVAILABLE:
        logger = logging.getLogger(__name__)
        logger.info("MPS acceleration is available")
    elif CUDA_AVAILABLE:
        logger = logging.getLogger(__name__)
        logger.info("CUDA acceleration is available")
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
        
        # Extremely optimized parameters for minimum latency
        model_params = {
            'model_path': validated_path,
            'n_ctx': 256,            # Minimal context window for fastest processing
            'n_threads': 8,          # Optimal thread count for Mac
            'n_gpu_layers': n_gpu_layers,  # Set based on hardware detection
            'n_batch': 512,          # Balanced batch size (too large can cause issues)
            'use_mlock': True,       # Lock memory to prevent swapping
            'f16_kv': True,          # Use 16-bit key/value cache
            'seed': 42,              # Fixed seed for reproducibility
            'verbose': False,        # Disable verbose output
            'temperature': 0.1,      # Lower temperature for faster, more deterministic responses
            'top_p': 0.1,            # Very focused sampling
            'top_k': 10,             # Highly restrictive sampling
            'max_tokens': 128,       # Very short responses for maximum speed
            'repeat_penalty': 1.3,   # Strong repetition penalty
            'stop': ["\nHuman:", "\n###", "\nH:", "\nUser:"]  # Stop sequences
        }
        
        # Use more compatible MPS optimizations
        if MPS_AVAILABLE:
            # Keep only parameters officially supported by LlamaCpp
            model_params.update({
                'n_gpu_layers': 1,     # Use GPU for at least one layer
                'n_threads': 2,        # Minimal CPU threads
                'n_batch': 512,        # Smaller batch for GPU
                'f16_kv': True,        # 16-bit key/value cache
                'use_mmap': False,     # Don't use memory mapping
                'use_mlock': True      # Lock memory to prevent swapping
            })
            
            # Set Metal-specific environment variables
            os.environ["GGML_METAL_PATH_RESOURCES"] = ""
            os.environ["GGML_METAL_FULL_MEM"] = "1"
            os.environ["METAL_DEVICE_WRAPPER_TYPE"] = "1"
        
        # Update with any user-provided kwargs (allowing overrides)
        model_params.update(kwargs)
        
        try:
            logger.info(f"Initializing LlamaCpp with params: { {k: v for k, v in model_params.items() if k != 'model_path' and not k.startswith('_')} }")
            
            # Initialize the model
            model = LlamaCpp(**model_params)
            
            # Metal acceleration is handled automatically when n_gpu_layers > 0
            if MPS_AVAILABLE:
                logger.info("Running with Metal acceleration")
            else:
                logger.info("Running on CPU")
            
            # Advanced pre-warming with multiple queries to fully initialize the model
            if model is not None:
                try:
                    logger.info("Pre-warming model cache...")
                    start_time = time.time()
                    
                    # First warm-up: very short
                    _ = model.invoke("Hi", max_tokens=5)
                    
                    # Second warm-up: slightly longer but still fast
                    _ = model.invoke("Tell me about AI", max_tokens=10)
                    
                    elapsed = time.time() - start_time
                    logger.info(f"Model warm-up completed in {elapsed:.2f}s")
                    
                    # Log expected performance
                    tokens_per_second = 15 / elapsed if elapsed > 0 else 0
                    logger.info(f"Estimated performance: {tokens_per_second:.1f} tokens/second")
                except Exception as e:
                    logger.warning(f"Model warm-up failed: {e}")
            
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