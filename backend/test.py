import os
import sys
import logging
import traceback
from typing import Optional, Dict, Any, List, Tuple
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# LangSmith configuration (using variables from .env)
LANGCHAIN_TRACING_V2 = os.getenv("LANGSMITH_TRACING_V2", "false").lower() == "true"
LANGCHAIN_ENDPOINT = os.getenv("LANGSMITH_ENDPOINT")
LANGCHAIN_API_KEY = os.getenv("LANGSMITH_API_KEY")
LANGCHAIN_PROJECT = os.getenv("LANGSMITH_PROJECT")

if LANGCHAIN_TRACING_V2 and not LANGCHAIN_API_KEY:
    logger.warning("LangSmith tracing is enabled but LANGCHAIN_API_KEY is not set")

class ChatSession:
    """Manages chat session with LangChain integration"""
    
    def __init__(self, model):
        self.model = model
        self.setup_chains()
        self.chat_history: List[Tuple[str, str]] = []
    
    def setup_chains(self):
        """Initialize LangChain components"""
        from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder, HumanMessagePromptTemplate
        from langchain_core.output_parsers import StrOutputParser
        from langchain_core.runnables import RunnablePassthrough
        
        # Define the prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a helpful AI assistant. Use the following chat history to inform your responses.
            If you don't know the answer, say you don't know. Keep responses concise and accurate."""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{question}")
        ])
        
        # Set up the chain
        self.chain = (
            {
                "question": lambda x: x["question"],
                "chat_history": lambda x: x["chat_history"]
            }
            | self.prompt
            | self.model
            | StrOutputParser()
        )
    
    def process_message(self, user_input: str) -> str:
        """Process a single user message and return the AI's response"""
        try:
            # Log that we're starting to generate a response
            logger.info(f"Generating response for: {user_input[:50]}...")
            
            # For better performance, use direct model invocation instead of complex chains
            # This reverts to the simpler, faster approach while keeping chat history
            formatted_prompt = self._format_prompt_with_history(user_input)
            
            # Print the AI prefix
            print("\nAI: ", end="", flush=True)
            
            # Get response from model
            try:
                logger.info(f"Generating response...")
                # Use the direct model access for faster response
                response = self.model.invoke(formatted_prompt)
                logger.info(f"Response generated: {response}")
                # Print the response
                #print(response, end="", flush=True)
                print()  # Add a newline after the response
                
                # Update chat history
                self.chat_history.extend([
                    ("human", user_input),
                    ("ai", response)
                ])
                
                # Keep chat history manageable
                self.chat_history = self.chat_history[-10:]  # Keep last 5 exchanges
                
                return response
                
            except Exception as e:
                logger.error(f"Model invocation failed: {e}")
                fallback_response = "I encountered an error processing your request. Please try again."
                print(fallback_response, flush=True)
                return fallback_response
                
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            logger.debug(f"Traceback: {traceback.format_exc()}")
            fallback_msg = "I encountered an error processing your request. Please try again."
            print(fallback_msg)
            return fallback_msg
            
    def _format_prompt_with_history(self, user_input: str) -> str:
        """Format the prompt with chat history for direct model invocation"""
        # Simple prompt formatting with history
        system_prompt = "You are a helpful AI assistant. Keep responses concise and accurate."
        
        # Build the prompt with history
        formatted_prompt = f"{system_prompt}\n\n"
        
        # Add chat history (last few exchanges)
        for role, content in self.chat_history[-6:]:  # Include last 3 exchanges (6 messages)
            if role == "human":
                formatted_prompt += f"Human: {content}\n"
            else:
                formatted_prompt += f"AI: {content}\n\n"
        
        # Add the current query
        formatted_prompt += f"Human: {user_input}\n\nAI:"
        return formatted_prompt

def setup_langsmith():
    """Configure LangSmith if API key is available"""
    if LANGCHAIN_TRACING_V2 and LANGCHAIN_API_KEY:
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_ENDPOINT"] = LANGCHAIN_ENDPOINT
        os.environ["LANGCHAIN_API_KEY"] = LANGCHAIN_API_KEY
        os.environ["LANGCHAIN_PROJECT"] = LANGCHAIN_PROJECT
        logger.info("LangSmith tracing is enabled")
    else:
        logger.info("LangSmith tracing is disabled. Set LANGCHAIN_API_KEY to enable.")

def main() -> int:
    """Main function to run the chat interface."""
    model_path = os.path.expanduser("../models/llama2/llama-2-7b-chat.Q3_K_M.gguf")
    
    try:
        setup_langsmith()
        
        # Initialize model using your existing function
        logger.info(f"Loading model from: {model_path}")
        from model_loading import load_cpp_inference_model, ModelLoadingError
        
        try:
            llm = load_cpp_inference_model(model_path)
            logger.info("Model loaded successfully!")
        except ModelLoadingError as e:
            logger.error(f"Failed to load model: {e}")
            print(f"\nError: Could not load model from {model_path}")
            print("Please check that the model file exists and is accessible.")
            return 1
        
        # Initialize chat session
        chat = ChatSession(llm)
        
        # Chat interface
        print("\n" + "="*50)
        print("Local Llama 2 Chat Interface")
        print("Type 'exit' to quit")
        print("="*50 + "\n")
        
        while True:
            try:
                user_input = input("\nYou: ").strip()
                if user_input.lower() in ('exit', 'quit'):
                    break
                    
                if not user_input:
                    continue
                    
                # Note: process_message now handles printing the response
                response = chat.process_message(user_input)
                
            except KeyboardInterrupt:
                print("\nExiting...")
                break
                
            except Exception as e:
                logger.error(f"Error in chat loop: {e}")
                logger.debug(f"Traceback: {traceback.format_exc()}")
                print("\nSorry, I encountered an error. Please try again.")
        
        return 0
        
    except Exception as e:
        logger.critical(f"Unexpected error: {e}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        print("\nA critical error occurred. Please check the logs for more details.")
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