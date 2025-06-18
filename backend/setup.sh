#!/bin/bash

echo "🚀 Setting up Leidos Upskilling Hub AI Assistant Backend"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
REQUIRED_VERSION="3.8"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Python $PYTHON_VERSION is installed, but Python $REQUIRED_VERSION or higher is required."
    exit 1
fi

echo "✅ Python $PYTHON_VERSION detected"

# Create virtual environment
echo "📦 Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "📝 Please create a .env file with your OpenAI API key:"
    echo ""
    echo "OPENAI_API_KEY=your_openai_api_key_here"
    echo ""
    echo "You can copy .env.example to .env and edit it:"
    echo "cp .env.example .env"
else
    echo "✅ .env file found"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Ensure your .env file contains your OpenAI API key"
echo "2. Start the server: python start.py"
echo "3. The API will be available at http://localhost:8000"
echo "4. API documentation: http://localhost:8000/docs"
echo ""
echo "To activate the virtual environment manually:"
echo "source venv/bin/activate" 