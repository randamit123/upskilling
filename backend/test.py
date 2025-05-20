import os
import sys
import logging
import traceback
from typing import Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def main() -> int:
    """Main function to load model and generate response.
    
    Returns:
        int: Exit code (0 for success, non-zero for error)
    """
    model_path = os.path.expanduser("../models/llama2/llama-2-7b-chat.Q3_K_M.gguf")
    prompt = "Explain quantum entanglement in simple terms."
    
    try:
        logger.info("Starting model loading process...")
        
        # Import here to catch import errors
        try:
            from model_loading import load_cpp_inference_model, ModelLoadingError
        except ImportError as e:
            logger.error(f"Failed to import required modules: {e}")
            logger.debug(f"Traceback: {traceback.format_exc()}")
            print("\nError: Could not import required modules. Please ensure all dependencies are installed.")
            return 1
        
        # Load the model
        try:
            logger.info(f"Loading model from: {model_path}")
            model = load_cpp_inference_model(model_path)
            logger.info("Model loaded successfully!")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            logger.debug(f"Traceback: {traceback.format_exc()}")
            print(f"\nError: Could not load model from {model_path}")
            print("Please check that the model file exists and is accessible.")
            return 1
        
        # Generate response
        try:
            print("\nGenerating response... (this may take a moment)")
            logger.info(f"Generating response for prompt: {prompt[:100]}...")
            response = model.invoke(prompt)
            
            # Print the response with some formatting
            print("\n" + "="*80)
            print("RESPONSE:")
            print("="*80)
            print(response)
            print("="*80 + "\n")
            
            return 0
            
        except KeyboardInterrupt:
            print("\n\nGeneration interrupted by user.")
            return 130  # Standard exit code for Ctrl+C
            
        except Exception as e:
            logger.error(f"Error during response generation: {e}")
            logger.debug(f"Traceback: {traceback.format_exc()}")
            print("\nError: Failed to generate response. Please try again.")
            return 1
            
    except Exception as e:
        logger.critical(f"Unexpected error: {e}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        print("\nAn unexpected error occurred. Please check the logs for more details.")
        return 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nScript interrupted by user.")
        sys.exit(130)
    except Exception as e:
        logger.critical(f"Unhandled exception: {e}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        print("\nA critical error occurred. Please check the logs for more details.")
        sys.exit(1)