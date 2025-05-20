import os
import sys
import logging
import traceback
from typing import Optional, Union, Dict, Any

import torch
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
        
        # Default parameters with overrides from kwargs
        model_params = {
            'model_path': validated_path,
            'n_ctx': 4096,
            'n_threads': max(1, os.cpu_count() // 2),  # Use half the available CPU cores
            'n_gpu_layers': -1 if torch.cuda.is_available() else 0,  # Use all layers on GPU if available
            'verbose': False,  # Disable verbose output from llama.cpp
            'temperature': 0.1,
            'max_tokens': 2000
        }
        
        # Update with any user-provided kwargs
        model_params.update(kwargs)
        
        try:
            logger.info(f"Initializing LlamaCpp with params: { {k: v for k, v in model_params.items() if k != 'model_path'} }")
            model = LlamaCpp(**model_params)
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