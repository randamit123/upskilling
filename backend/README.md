# Leidos Upskilling Hub - Backend

Python FastAPI backend with LangChain integration for the Leidos Upskilling Hub AI Assistant.

## Features

- 🤖 **LangChain Integration** - Advanced conversation management with memory
- 📁 **File Processing** - Support for PDF, text, and document uploads  
- 💾 **Conversation Memory** - Maintains context across chat sessions
- 🔗 **OpenAI Integration** - Uses GPT-4 for intelligent responses
- 📚 **Educational Focus** - Specialized for learning and development content
- 🚀 **FastAPI** - High-performance async API with automatic documentation
- 🗄️ **ChromaDB** - Vector database for document embeddings and retrieval

## Quick Start

### 1. Install Dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Set up Environment Variables

Create a `.env` file in this directory:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO
```

### 3. Start the Server

```bash
# Using the startup script (recommended)
python start.py

# Or directly with uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/

## API Endpoints

### Chat Endpoint
```http
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "attachments": [
    {"id": "1", "name": "document.pdf", "size": 1024, "type": "application/pdf"}
  ]
}
```

### File Upload Endpoint
```http
POST /api/upload
Content-Type: multipart/form-data

file: <binary_file_data>
```

## Architecture

```
Frontend (Next.js) → Next.js API Proxy → Python FastAPI → LangChain → OpenAI
                                                        → ChromaDB
```

### Key Components

- **ChatService**: Main service class handling LangChain conversation chains
- **ConversationMemory**: Maintains chat history per session
- **File Processing**: Extracts and chunks document content with ChromaDB
- **Custom Prompts**: Specialized for educational content creation

## Development

### Project Structure

```
backend/
├── main.py              # FastAPI application
├── start.py             # Startup script
├── requirements.txt     # Dependencies
├── chromatest.py        # ChromaDB test script
├── README.md           # This file
└── .env                # Environment variables (create this)
```

### Testing ChromaDB

```bash
python chromatest.py
```

### Starting the API Server

```bash
python start.py
```

## Integration with Frontend

The Next.js frontend automatically proxies requests to this backend. Ensure:

1. Backend is running on port 8000
2. Frontend API route points to `http://localhost:8000`
3. CORS is configured for your frontend domain

## Environment Variables

| Variable         | Description               | Default   |
| ---------------- | ------------------------- | --------- |
| `OPENAI_API_KEY` | OpenAI API key (required) | -         |
| `API_HOST`       | Server host               | `0.0.0.0` |
| `API_PORT`       | Server port               | `8000`    |
| `LOG_LEVEL`      | Logging level             | `INFO`    |