#!/usr/bin/env python3
"""
Startup script for the Leidos Upskilling Hub AI Assistant Backend
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Check for required environment variables
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Error: OPENAI_API_KEY environment variable is required")
        print("Please set your OpenAI API key in a .env file or environment variable")
        exit(1)

    print("🚀 Starting Leidos Upskilling Hub AI Assistant Backend...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📋 API docs will be available at: http://localhost:8000/docs")

    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=True,
        log_level=os.getenv("LOG_LEVEL", "info").lower(),
    )
