import { v4 as uuidv4 } from 'uuid';

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'scenario';
export type AssessmentType = 'quiz' | 'test' | 'scenario';

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  answer?: string | string[];
  explanation?: string;
  points: number;
  metadata?: Record<string, any>;
}

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  type: AssessmentType;
  timeLimit: number; // in seconds
  maxAttempts: number;
  questions: Question[];
  settings: {
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
    showFeedback: boolean;
    proctoringEnabled: boolean;
    proctoringUrl?: string;
  };
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentAnalytics {
  stats: {
    avgScore: number;
    completionRate: number;
    timeAvg: number; // in seconds
    totalAttempts: number;
    questionStats: Array<{
      questionId: string;
      correctRate: number;
      avgTime: number;
    }>;
  };
}

class MockAssessmentApi {
  private baseUrl = '/api/mock';
  private assessments: Record<string, Assessment> = {};
  private analytics: Record<string, AssessmentAnalytics> = {};

  constructor() {
    // Initialize with some mock data
    const mockAssessment = this.createMockAssessment();
    this.assessments[mockAssessment.id] = mockAssessment;
    this.analytics[mockAssessment.id] = this.generateMockAnalytics(mockAssessment.id);
  }

  private createMockAssessment(overrides: Partial<Assessment> = {}): Assessment {
    const defaultAssessment: Assessment = {
      id: `assessment-${uuidv4()}`,
      title: 'Module 1 Quiz',
      description: 'Assessment for Module 1 content',
      type: 'quiz',
      timeLimit: 1800, // 30 minutes
      maxAttempts: 3,
      questions: [
        {
          id: `q-${uuidv4()}`,
          type: 'multiple_choice',
          prompt: 'What is the capital of France?',
          options: ['London', 'Paris', 'Berlin', 'Madrid'],
          answer: 'Paris',
          points: 1,
          explanation: 'Paris is the capital of France.'
        },
        {
          id: `q-${uuidv4()}`,
          type: 'true_false',
          prompt: 'The Earth is flat.',
          options: ['True', 'False'],
          answer: 'False',
          points: 1,
          explanation: 'The Earth is an oblate spheroid.'
        }
      ],
      settings: {
        randomizeQuestions: false,
        randomizeOptions: false,
        showFeedback: true,
        proctoringEnabled: false
      },
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    };

    return defaultAssessment;
  }

  private generateMockAnalytics(assessmentId: string): AssessmentAnalytics {
    return {
      stats: {
        avgScore: Math.floor(Math.random() * 30) + 70, // 70-100%
        completionRate: Math.floor(Math.random() * 30) + 60, // 60-90%
        timeAvg: Math.floor(Math.random() * 1200) + 600, // 10-50 minutes
        totalAttempts: Math.floor(Math.random() * 50) + 10, // 10-60 attempts
        questionStats: Array(5).fill(0).map((_, i) => ({
          questionId: `q-${i + 1}`,
          correctRate: Math.floor(Math.random() * 40) + 50, // 50-90%
          avgTime: Math.floor(Math.random() * 120) + 30 // 30-150 seconds
        }))
      }
    };
  }

  private async simulateNetworkDelay(min = 300, max = 800): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // API Methods
  async getAssessmentTypes(): Promise<string[]> {
    await this.simulateNetworkDelay();
    return ['quiz', 'test', 'scenario'];
  }

  async createAssessment(payload: Partial<Assessment>): Promise<Assessment> {
    await this.simulateNetworkDelay();
    const newAssessment = this.createMockAssessment({
      ...payload,
      id: `assessment-${uuidv4()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    this.assessments[newAssessment.id] = newAssessment;
    this.analytics[newAssessment.id] = this.generateMockAnalytics(newAssessment.id);
    
    return newAssessment;
  }

  async getAssessment(id: string): Promise<Assessment> {
    await this.simulateNetworkDelay();
    const assessment = this.assessments[id];
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    return assessment;
  }

  async updateAssessment(id: string, updates: Partial<Assessment>): Promise<Assessment> {
    await this.simulateNetworkDelay();
    
    if (!this.assessments[id]) {
      throw new Error('Assessment not found');
    }

    const updatedAssessment = {
      ...this.assessments[id],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.assessments[id] = updatedAssessment;
    return updatedAssessment;
  }

  async addQuestion(assessmentId: string, question: Omit<Question, 'id'>): Promise<Question> {
    await this.simulateNetworkDelay();
    
    if (!this.assessments[assessmentId]) {
      throw new Error('Assessment not found');
    }

    const newQuestion: Question = {
      ...question,
      id: `q-${uuidv4()}`
    };

    this.assessments[assessmentId].questions.push(newQuestion);
    return newQuestion;
  }

  async updateQuestion(questionId: string, updates: Partial<Question>): Promise<Question> {
    await this.simulateNetworkDelay();
    
    for (const assessmentId in this.assessments) {
      const questionIndex = this.assessments[assessmentId].questions.findIndex(q => q.id === questionId);
      if (questionIndex !== -1) {
        const updatedQuestion = {
          ...this.assessments[assessmentId].questions[questionIndex],
          ...updates
        };
        
        this.assessments[assessmentId].questions[questionIndex] = updatedQuestion;
        this.assessments[assessmentId].updatedAt = new Date().toISOString();
        
        return updatedQuestion;
      }
    }

    throw new Error('Question not found');
  }

  async deleteQuestion(questionId: string): Promise<void> {
    await this.simulateNetworkDelay();
    
    for (const assessmentId in this.assessments) {
      const questionIndex = this.assessments[assessmentId].questions.findIndex(q => q.id === questionId);
      if (questionIndex !== -1) {
        this.assessments[assessmentId].questions.splice(questionIndex, 1);
        this.assessments[assessmentId].updatedAt = new Date().toISOString();
        return;
      }
    }

    throw new Error('Question not found');
  }

  async generateQuestionBank(params: {
    topic: string;
    count: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    questionTypes?: QuestionType[];
  }): Promise<Omit<Question, 'id'>[]> {
    await this.simulateNetworkDelay();
    
    // Generate mock questions based on parameters
    const questionTypes = params.questionTypes || ['multiple_choice', 'true_false'];
    const difficulty = params.difficulty || 'medium';
    
    return Array(params.count).fill(0).map((_, i) => {
      const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      const baseQuestion: Omit<Question, 'id'> = {
        type,
        prompt: `Sample question about ${params.topic} (${difficulty} difficulty) #${i + 1}`,
        points: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
        explanation: `This is a sample explanation for question #${i + 1}`
      };

      if (type === 'multiple_choice') {
        return {
          ...baseQuestion,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: 'Option ' + String.fromCharCode(65 + Math.floor(Math.random() * 4))
        };
      } else if (type === 'true_false') {
        return {
          ...baseQuestion,
          options: ['True', 'False'],
          answer: Math.random() > 0.5 ? 'True' : 'False'
        };
      } else if (type === 'short_answer') {
        return {
          ...baseQuestion,
          answer: `Sample answer for question #${i + 1}`
        };
      } else { // scenario
        return {
          ...baseQuestion,
          prompt: `Scenario: You are in a situation related to ${params.topic}. What would you do?`,
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          answer: 'Option ' + (Math.floor(Math.random() * 4) + 1)
        };
      }
    });
  }

  async getAssessmentAnalytics(assessmentId: string): Promise<AssessmentAnalytics> {
    await this.simulateNetworkDelay();
    
    if (!this.assessments[assessmentId]) {
      throw new Error('Assessment not found');
    }

    if (!this.analytics[assessmentId]) {
      this.analytics[assessmentId] = this.generateMockAnalytics(assessmentId);
    }

    return this.analytics[assessmentId];
  }

  async enableProctoring(assessmentId: string): Promise<{ proctoringUrl: string }> {
    await this.simulateNetworkDelay();
    
    if (!this.assessments[assessmentId]) {
      throw new Error('Assessment not found');
    }

    const proctoringUrl = `https://proctoring.example.com/session/${assessmentId}`;
    
    this.assessments[assessmentId] = {
      ...this.assessments[assessmentId],
      settings: {
        ...this.assessments[assessmentId].settings,
        proctoringEnabled: true,
        proctoringUrl
      }
    };

    return { proctoringUrl };
  }

  async uploadFile(file: File): Promise<{ fileId: string; filename: string; size: number; type: string }> {
    await this.simulateNetworkDelay();
    
    return {
      fileId: `file-${uuidv4()}`,
      filename: file.name,
      size: file.size,
      type: file.type
    };
  }
}

export const mockAssessmentApi = new MockAssessmentApi();
export type { Assessment, Question, AssessmentAnalytics };
