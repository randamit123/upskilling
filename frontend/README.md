# Upskilling - Course Development Platform

This project implements a comprehensive Course Development platform that allows Subject Matter Experts (SMEs) to create structured learning courses with AI assistance.

## Features

- **AI-Powered Course Generation**: Upload SME content and automatically generate course outlines, learning objectives, and skills mappings
- **Multi-step Wizard Interface**: Intuitive 5-step workflow for course creation
- **Interactive Storyboard Builder**: Drag-and-drop interface for arranging learning objects
- **Skills Taxonomy Integration**: Map courses to our organization's skills taxonomy
- **Adult Learning Principles**: All generated content follows proven adult learning methodologies

## Tech Stack

- **Frontend**:
  - Next.js 14 (App Router)
  - TypeScript
  - React Server Components
  - Tailwind CSS
  - shadcn/ui component library
  - Zustand for state management
  - React Hook Form + Zod
  - Framer Motion (for transitions)
  - Lucide icons

- **Backend**:
  - LangChain for structured LLM interactions
  - LangSmith for monitoring and tracking
  - Local LLaMA models for content generation

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Python 3.9+ (for backend)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```
   # Create .env file in root directory
   cp .env.example .env
   # Edit .env with your specific configuration
   ```

4. Start the development server:
   ```bash
   # Frontend
   cd frontend
   npm run dev
   
   # Backend
   cd ../backend
   python app.py
   ```

5. Visit `http://localhost:3000/courses` to see the application

## Course Development Workflow

1. **Content Upload**: Upload SME content files (PDF, DOCX, Markdown)
2. **Course Outline**: Review and edit AI-generated course outline
3. **Learning Objectives & Skills**: Define learning outcomes and map to skills
4. **Storyboard Editor**: Arrange learning objects in a drag-and-drop interface
5. **Review & Publish**: Finalize and publish the course

## Accessibility

- Fully keyboard navigable
- WCAG AA compliant color contrast
- Proper aria labels and semantic HTML
- Dark mode support

## API Integration

The course development page integrates with the following backend APIs:

- `POST /api/course/upload-content`: Upload SME content files
- `POST /api/course/generate-outline`: Generate course outline
- `POST /api/course/generate-objectives-skills`: Generate learning objectives and skills
- `POST /api/course/save-storyboard`: Save storyboard state
- `POST /api/course/publish`: Publish completed course
