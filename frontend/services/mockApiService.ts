/**
 * MockApiService - A service to handle mock API calls for development and testing
 * 
 * This service returns promises with mock data to simulate API calls.
 * When the real backend is ready, swap base URL from '/api/mock' to '/api'
 */

// Mock Data Version: 1.0.0
// IMPORTANT: When implementing real API, replace all occurrences of BASE_URL with the actual API endpoint

const BASE_URL = '/api/mock';

// Microlearning Module Types
export interface MicroModule {
  id: string;
  title: string;
  duration: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  quizzes?: Quiz[];
  mediaUrl?: string;
}

export interface Quiz {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching';
  prompt: string;
  options?: string[];
  correctAnswer?: string | string[];
}

// Survey Types
export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface SurveyQuestion {
  id: string;
  type: 'multiple_choice' | 'text' | 'rating' | 'true_false' | 'likert';
  prompt: string;
  required: boolean;
  options?: string[];
  condition?: {
    dependsOn: string; // Question ID this depends on
    showIf: string;    // Value that triggers showing this question
  };
}

export interface SurveyResult {
  questionId: string;
  response: string | string[];
  respondentId?: string;
}

// Mock Data
const microModuleTemplates = [
  { id: 'template-1', name: 'Quick Intro', description: 'A 5-minute introduction to a topic' },
  { id: 'template-2', name: 'Detailed Concept', description: 'A 15-minute deep dive into a concept' },
  { id: 'template-3', name: 'Skill Builder', description: 'A 10-minute module with hands-on practice' },
  { id: 'template-4', name: 'Review Module', description: 'A 5-minute refresher on previously learned content' }
];

const mockModules: MicroModule[] = [
  {
    id: '1',
    title: 'Introduction to AI',
    duration: '7m',
    content: 'Artificial Intelligence (AI) refers to the simulation of human intelligence in machines programmed to think and learn like humans. This module covers the basics of AI including its history, types, and applications.',
    tags: ['AI', 'Technology', 'Beginner'],
    createdAt: '2025-05-01T12:00:00Z',
    updatedAt: '2025-05-05T14:30:00Z',
    quizzes: [
      {
        id: 'q1',
        type: 'true_false',
        prompt: 'AI and Machine Learning are exactly the same thing.',
        correctAnswer: 'false'
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        prompt: 'Which of these is a common application of AI?',
        options: ['Virtual assistants', 'Tree planting', 'Manual data entry', 'Physical infrastructure'],
        correctAnswer: 'Virtual assistants'
      }
    ],
    mediaUrl: 'https://www.youtube.com/embed/JvSOhpbpUKE'
  },
  {
    id: '2',
    title: 'Cloud Computing Fundamentals',
    duration: '10m',
    content: 'Cloud computing is the delivery of different services through the Internet, including data storage, servers, databases, networking, and software.',
    tags: ['Cloud', 'Technology', 'Beginner'],
    createdAt: '2025-04-15T10:20:00Z',
    updatedAt: '2025-04-20T11:45:00Z',
    quizzes: [
      {
        id: 'q1',
        type: 'multiple_choice',
        prompt: 'Which is NOT a major cloud service provider?',
        options: ['Amazon Web Services', 'Microsoft Azure', 'Google Cloud Platform', 'IBM Personal Cloud'],
        correctAnswer: 'IBM Personal Cloud'
      }
    ],
    mediaUrl: 'https://www.youtube.com/embed/M988_fsOSWo'
  },
  {
    id: '3',
    title: 'Cybersecurity Basics',
    duration: '12m',
    content: 'Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks aimed at accessing, changing, or destroying sensitive information.',
    tags: ['Security', 'Technology', 'Intermediate'],
    createdAt: '2025-05-10T09:15:00Z',
    updatedAt: '2025-05-12T16:20:00Z',
    quizzes: [
      {
        id: 'q1',
        type: 'true_false',
        prompt: 'Phishing is a cybersecurity attack that uses disguised email as a weapon.',
        correctAnswer: 'true'
      }
    ]
  }
];

const surveyTemplates = [
  { id: 'template-1', name: 'Course Feedback', description: 'Gather learner feedback on course content and delivery' },
  { id: 'template-2', name: 'Learning Needs Assessment', description: 'Assess learning needs and preferences' },
  { id: 'template-3', name: 'Content Evaluation', description: 'Evaluate effectiveness of learning content' }
];

const mockSurveys: Survey[] = [
  {
    id: 's1',
    title: 'Learning Feedback Survey',
    description: 'Help us improve our content by providing your feedback',
    questions: [
      {
        id: 'q1',
        type: 'rating',
        prompt: 'How would you rate the overall quality of the content?',
        required: true,
        options: ['1', '2', '3', '4', '5']
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        prompt: 'Did you find the content engaging?',
        required: true,
        options: ['Yes', 'Somewhat', 'No']
      },
      {
        id: 'q3',
        type: 'text',
        prompt: 'What specific improvements would you suggest?',
        required: false
      },
      {
        id: 'q4',
        type: 'true_false',
        prompt: 'Would you be interested in more advanced content on this topic?',
        required: true
      },
      {
        id: 'q5',
        type: 'multiple_choice',
        prompt: 'Which topics would you like to see next?',
        required: false,
        options: ['AI Ethics', 'Machine Learning Algorithms', 'Natural Language Processing', 'Computer Vision'],
        condition: {
          dependsOn: 'q4',
          showIf: 'true'
        }
      }
    ],
    createdAt: '2025-05-15T08:30:00Z',
    updatedAt: '2025-05-16T10:45:00Z',
    published: true
  }
];

const mockSurveyResults = {
  's1': [
    { questionId: 'q1', response: '4', respondentId: 'user1' },
    { questionId: 'q2', response: 'Yes', respondentId: 'user1' },
    { questionId: 'q3', response: 'Add more practical examples', respondentId: 'user1' },
    { questionId: 'q4', response: 'true', respondentId: 'user1' },
    { questionId: 'q5', response: 'Machine Learning Algorithms', respondentId: 'user1' },
    
    { questionId: 'q1', response: '5', respondentId: 'user2' },
    { questionId: 'q2', response: 'Somewhat', respondentId: 'user2' },
    { questionId: 'q4', response: 'false', respondentId: 'user2' },
    
    { questionId: 'q1', response: '3', respondentId: 'user3' },
    { questionId: 'q2', response: 'No', respondentId: 'user3' },
    { questionId: 'q3', response: 'Content was too theoretical', respondentId: 'user3' },
    { questionId: 'q4', response: 'true', respondentId: 'user3' },
    { questionId: 'q5', response: 'AI Ethics', respondentId: 'user3' }
  ]
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Microlearning API methods
export const microlearningApi = {
  // Get templates for microlearning modules
  getTemplates: async () => {
    await delay(800); // Simulate network delay
    return microModuleTemplates;
  },
  
  // Generate a new microlearning module based on prompt
  generateModule: async (prompt: string, files?: File[]) => {
    await delay(1500); // Simulate processing time
    
    // Mock file handling
    const fileIds = files ? files.map((file, index) => `file-${Date.now()}-${index}`) : [];
    
    // Create a new mock module based on the prompt
    const newModule: MicroModule = {
      id: `module-${Date.now()}`,
      title: prompt.split(' ').slice(0, 5).join(' '),
      duration: `${Math.floor(Math.random() * 10) + 5}m`,
      content: `This module was created based on your prompt: "${prompt}". It contains all the essential information on this topic.`,
      tags: prompt.split(' ').filter(word => word.length > 3).slice(0, 3),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      quizzes: [
        {
          id: `quiz-${Date.now()}`,
          type: 'true_false',
          prompt: 'This content was helpful for understanding the topic.',
          correctAnswer: 'true'
        }
      ]
    };
    
    // Randomly add a video sometimes
    if (Math.random() > 0.5) {
      newModule.mediaUrl = 'https://www.youtube.com/embed/JvSOhpbpUKE';
    }
    
    return { modules: [newModule], fileIds };
  },
  
  // Update an existing module
  updateModule: async (id: string, updates: Partial<MicroModule>) => {
    await delay(800);
    
    const moduleIndex = mockModules.findIndex(m => m.id === id);
    if (moduleIndex === -1) {
      return Promise.reject({ message: "Module not found" });
    }
    
    const updatedModule = {
      ...mockModules[moduleIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Update the mock data (in a real app, this would persist to a database)
    mockModules[moduleIndex] = updatedModule;
    
    return updatedModule;
  },
  
  // Search for modules
  searchModules: async (query: string) => {
    await delay(600);
    
    // Simple search implementation
    const results = mockModules.filter(module => 
      module.title.toLowerCase().includes(query.toLowerCase()) || 
      module.content.toLowerCase().includes(query.toLowerCase()) ||
      module.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    return results;
  },
  
  // Get all modules
  getAllModules: async () => {
    await delay(800);
    return mockModules;
  },
  
  // Get a single module by ID
  getModuleById: async (id: string) => {
    await delay(500);
    const module = mockModules.find(m => m.id === id);
    
    if (!module) {
      return Promise.reject({ message: "Module not found" });
    }
    
    return module;
  }
};

// Survey API methods
export const surveyApi = {
  // Get survey templates
  getTemplates: async () => {
    await delay(800);
    return surveyTemplates;
  },
  
  // Create a new survey
  createSurvey: async (title: string, description: string, templateId?: string) => {
    await delay(1000);
    
    // Create a new survey based on template or default structure
    const newSurvey: Survey = {
      id: `survey-${Date.now()}`,
      title,
      description,
      questions: templateId ? 
        // Use questions from template if specified
        mockSurveys[0].questions.slice(0, 3) : 
        // Otherwise use default questions
        [
          {
            id: `q-${Date.now()}-1`,
            type: 'multiple_choice',
            prompt: 'Sample question 1',
            required: true,
            options: ['Option 1', 'Option 2', 'Option 3']
          },
          {
            id: `q-${Date.now()}-2`,
            type: 'text',
            prompt: 'Sample question 2',
            required: false
          }
        ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: false
    };
    
    // In a real app, this would be saved to a database
    mockSurveys.push(newSurvey);
    
    return newSurvey;
  },
  
  // Update an existing survey
  updateSurvey: async (id: string, updates: Partial<Survey>) => {
    await delay(800);
    
    const surveyIndex = mockSurveys.findIndex(s => s.id === id);
    if (surveyIndex === -1) {
      return Promise.reject({ message: "Survey not found" });
    }
    
    const updatedSurvey = {
      ...mockSurveys[surveyIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Update the mock data
    mockSurveys[surveyIndex] = updatedSurvey;
    
    return updatedSurvey;
  },
  
  // Get survey results
  getSurveyResults: async (id: string) => {
    await delay(1200);
    
    if (!mockSurveyResults[id]) {
      return Promise.reject({ message: "Survey results not found" });
    }
    
    return { results: mockSurveyResults[id] };
  },
  
  // Get all surveys
  getAllSurveys: async () => {
    await delay(800);
    return mockSurveys;
  },
  
  // Get a single survey by ID
  getSurveyById: async (id: string) => {
    await delay(500);
    const survey = mockSurveys.find(s => s.id === id);
    
    if (!survey) {
      return Promise.reject({ message: "Survey not found" });
    }
    
    return survey;
  },
  
  // Add a question to a survey
  addQuestion: async (surveyId: string, question: Omit<SurveyQuestion, 'id'>) => {
    await delay(700);
    
    const surveyIndex = mockSurveys.findIndex(s => s.id === surveyId);
    if (surveyIndex === -1) {
      return Promise.reject({ message: "Survey not found" });
    }
    
    const newQuestion = {
      ...question,
      id: `q-${Date.now()}`
    };
    
    mockSurveys[surveyIndex].questions.push(newQuestion);
    mockSurveys[surveyIndex].updatedAt = new Date().toISOString();
    
    return newQuestion;
  },
  
  // Update a question in a survey
  updateQuestion: async (surveyId: string, questionId: string, updates: Partial<SurveyQuestion>) => {
    await delay(700);
    
    const surveyIndex = mockSurveys.findIndex(s => s.id === surveyId);
    if (surveyIndex === -1) {
      return Promise.reject({ message: "Survey not found" });
    }
    
    const questionIndex = mockSurveys[surveyIndex].questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) {
      return Promise.reject({ message: "Question not found" });
    }
    
    mockSurveys[surveyIndex].questions[questionIndex] = {
      ...mockSurveys[surveyIndex].questions[questionIndex],
      ...updates
    };
    
    mockSurveys[surveyIndex].updatedAt = new Date().toISOString();
    
    return mockSurveys[surveyIndex].questions[questionIndex];
  },
  
  // Delete a question from a survey
  deleteQuestion: async (surveyId: string, questionId: string) => {
    await delay(700);
    
    const surveyIndex = mockSurveys.findIndex(s => s.id === surveyId);
    if (surveyIndex === -1) {
      return Promise.reject({ message: "Survey not found" });
    }
    
    const questionIndex = mockSurveys[surveyIndex].questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) {
      return Promise.reject({ message: "Question not found" });
    }
    
    mockSurveys[surveyIndex].questions.splice(questionIndex, 1);
    mockSurveys[surveyIndex].updatedAt = new Date().toISOString();
    
    return { success: true };
  }
};

// Unified API handler for both services
const MockApiService = {
  microlearning: microlearningApi,
  survey: surveyApi
};

export default MockApiService;
