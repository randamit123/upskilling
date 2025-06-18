from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
import tempfile
import logging

# LangChain imports
from langchain_openai import ChatOpenAI

from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationChain
from langchain.prompts import PromptTemplate
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings


# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Leidos Upskilling Hub AI Assistant", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class ChatMessage(BaseModel):
    role: str
    content: str


class FileAttachment(BaseModel):
    id: str
    name: str
    size: int
    type: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    attachments: Optional[List[FileAttachment]] = []


class ChatResponse(BaseModel):
    content: str
    usage: Optional[Dict[str, Any]] = None


# In-memory storage for conversation histories (in production, use Redis/DB)
conversation_memories = {}


class ChatService:
    def __init__(self):
        if not os.getenv("OPENAI_API_KEY"):
            raise ValueError("OPENAI_API_KEY environment variable is required")

        self.llm = ChatOpenAI(
            model="gpt-4", temperature=0.7, openai_api_key=os.getenv("OPENAI_API_KEY")
        )

        # Custom prompt template for the Upskilling Hub context
        self.prompt_template = PromptTemplate(
            input_variables=["history", "input"],
            template="""You are an AI assistant integrated into the Leidos Upskilling Hub, a learning management and content creation platform. You specialize in:

- Educational content creation and instructional design
- Course development and curriculum planning  
- Assessment creation and learning objectives
- Skills-based learning and competency mapping
- Training program optimization
- Learning analytics and impact measurement

You should be helpful, professional, and focused on learning and development topics. When users upload files, analyze them and provide specific, actionable insights related to learning and development.

Previous conversation:
{history}

Current request: {input}""",
        )

        # Initialize embeddings for file processing
        self.embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))

        # Text splitter for chunking documents
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    def get_memory(self, session_id: str = "default") -> ConversationBufferWindowMemory:
        """Get or create conversation memory for a session"""
        if session_id not in conversation_memories:
            conversation_memories[session_id] = ConversationBufferWindowMemory(
                k=10,  # Keep last 10 exchanges
                return_messages=True,
            )
        return conversation_memories[session_id]

    async def process_attachments(self, attachments: List[FileAttachment]) -> str:
        """Process uploaded files and extract content"""
        if not attachments:
            return ""

        processed_content = []
        for attachment in attachments:
            try:
                # For now, just acknowledge the file
                # In a real implementation, you'd process the actual file content
                processed_content.append(
                    f"File: {attachment.name} ({attachment.type}, {attachment.size} bytes)"
                )
            except Exception as e:
                logger.error(f"Error processing attachment {attachment.name}: {e}")
                processed_content.append(f"Could not process file: {attachment.name}")

        return "Uploaded files:\n" + "\n".join(processed_content)

    async def chat(
        self,
        messages: List[ChatMessage],
        attachments: List[FileAttachment] = None,
        session_id: str = "default",
    ) -> str:
        """Process chat messages and return AI response"""
        try:
            # Get conversation memory
            memory = self.get_memory(session_id)

            # Create conversation chain
            conversation = ConversationChain(
                llm=self.llm, prompt=self.prompt_template, memory=memory, verbose=True
            )

            # Process the latest user message
            latest_message = messages[-1].content if messages else ""

            # Add attachment context if any
            attachment_context = ""
            if attachments:
                attachment_context = await self.process_attachments(attachments)
                latest_message = f"{latest_message}\n\n{attachment_context}"

            # Get AI response
            response = conversation.predict(input=latest_message)

            return response

        except Exception as e:
            logger.error(f"Error in chat processing: {e}")
            raise HTTPException(
                status_code=500, detail=f"Chat processing failed: {str(e)}"
            )


# Initialize chat service
chat_service = ChatService()


@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Leidos Upskilling Hub AI Assistant"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint"""
    try:
        if not request.messages:
            raise HTTPException(status_code=400, detail="No messages provided")

        # Process the chat
        response_content = await chat_service.chat(
            messages=request.messages, attachments=request.attachments or []
        )

        return ChatResponse(
            content=response_content, usage={"model": "gpt-4", "provider": "openai"}
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """File upload endpoint for processing documents"""
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=f"_{file.filename}"
        ) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name

        # Process based on file type
        documents = []
        if file.content_type == "application/pdf":
            loader = PyPDFLoader(tmp_path)
            documents = loader.load()
        elif file.content_type == "text/plain":
            loader = TextLoader(tmp_path)
            documents = loader.load()

        # Clean up temp file
        os.unlink(tmp_path)

        # Split documents into chunks
        if documents:
            texts = chat_service.text_splitter.split_documents(documents)
            return {
                "filename": file.filename,
                "chunks": len(texts),
                "content_preview": texts[0].page_content[:200]
                if texts
                else "No content extracted",
            }
        else:
            return {
                "filename": file.filename,
                "chunks": 0,
                "content_preview": "File type not supported for text extraction",
            }

    except Exception as e:
        logger.error(f"Error processing uploaded file: {e}")
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
