# Assessment Generation Module

This module provides functionality for creating, managing, and analyzing assessments within the Leidos Upskilling Hub.

## Features

- **Assessment Creation**: Create new assessments with customizable settings
- **Question Management**: Add, edit, and delete questions of various types
- **Question Bank**: Generate and manage reusable question banks
- **Analytics**: View performance metrics and insights for assessments
- **Proctoring**: Enable secure online proctoring for assessments

## Components

- `page.tsx`: Main assessments listing page
- `new/page.tsx`: Create and edit assessments
- `[id]/page.tsx`: View and manage a specific assessment (future implementation)

## API Integration

The module uses the following mock API endpoints:

- `GET /api/mock/assessment-types`: Get available assessment types
- `POST /api/mock/assessments`: Create a new assessment
- `GET /api/mock/assessments/:id`: Get assessment details
- `PUT /api/mock/assessments/:id`: Update an assessment
- `POST /api/mock/assessments/:id/questions`: Add a question to an assessment
- `PUT /api/mock/questions/:id`: Update a question
- `DELETE /api/mock/questions/:id`: Delete a question
- `POST /api/mock/generate-question-bank`: Generate a question bank
- `POST /api/mock/assessments/:id/enable-proctoring`: Enable proctoring for an assessment

## Usage

1. Navigate to the assessments page
2. Click "New Assessment" to create a new assessment
3. Configure the assessment settings (title, type, time limit, etc.)
4. Add questions manually or generate a question bank
5. Save the assessment
6. View analytics and performance metrics

## Development

### Adding New Question Types

1. Update the `QuestionType` type in `mockAssessmentApi.ts`
2. Add support for the new type in the question editor modal
3. Update the question rendering logic in the assessment view

### Styling

This module uses Tailwind CSS for styling. Custom styles can be added to the appropriate component files.

## Future Enhancements

- Support for more question types (matching, ordering, etc.)
- Bulk import/export of questions
- Advanced assessment settings (prerequisites, availability windows, etc.)
- Integration with learning management system (LMS) standards (SCORM, xAPI)
