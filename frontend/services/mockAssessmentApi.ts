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
    // Legacy support
    topic?: string;
    count: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    questionTypes?: QuestionType[];
    // New comprehensive parameters
    assessmentTitle?: string;
    assessmentDescription?: string;
    learningOutcomes?: string;
    uploadedFile?: File | null;
    questionMix?: Record<string, number>;
    questionCounts?: Record<string, number>;
    assessmentType?: AssessmentType;
    timeLimit?: number;
  }): Promise<Omit<Question, 'id'>[]> {
    await this.simulateNetworkDelay();
    
    // Use new params if available, fall back to legacy
    const title = params.assessmentTitle || params.topic || 'Sample Assessment';
    const difficulty = params.difficulty || 'medium';
    const questionMix = params.questionMix || { multiple_choice: 100 };
    const questionCounts = params.questionCounts || { multiple_choice: params.count };
    
    const questions: Omit<Question, 'id'>[] = [];

    // Generate questions based on the mix
    Object.entries(questionCounts).forEach(([type, count]) => {
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const questionType = type === 'scenario_based' ? 'scenario' : type as QuestionType;
          const baseQuestion: Omit<Question, 'id'> = {
            type: questionType,
            prompt: this.generateQuestionPrompt(type, title, params.learningOutcomes, i + 1),
            points: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
            explanation: this.generateExplanation(type, i + 1)
          };

          if (questionType === 'multiple_choice') {
            questions.push({
              ...baseQuestion,
              options: this.generateMCOptions(type, title),
              answer: this.generateMCOptions(type, title)[Math.floor(Math.random() * 4)]
            });
          } else if (questionType === 'true_false') {
            questions.push({
              ...baseQuestion,
              options: ['True', 'False'],
              answer: Math.random() > 0.5 ? 'True' : 'False'
            });
          } else if (questionType === 'short_answer') {
            questions.push({
              ...baseQuestion,
              answer: `Sample answer related to ${title} for question #${i + 1}`
            });
          } else if (questionType === 'scenario') {
            questions.push({
              ...baseQuestion,
              options: this.generateScenarioOptions(title),
              answer: this.generateScenarioOptions(title)[Math.floor(Math.random() * 4)]
            });
          }
        }
      }
    });
    
    return questions;
  }

  private generateQuestionPrompt(type: string, title: string, learningOutcomes?: string, questionNum?: number): string {
    const outcomeContext = learningOutcomes ? ` (aligned with: ${learningOutcomes.slice(0, 50)}...)` : '';
    
    switch (type) {
      case 'multiple_choice':
        return `Which of the following best describes a key concept in ${title}${outcomeContext}?`;
      case 'scenario_based':
        return `Scenario: You are implementing concepts from ${title}. A colleague approaches you with a problem. How would you apply what you've learned to help them${outcomeContext}?`;
      case 'reflective':
        return `Reflect on your understanding of ${title}. How would you explain the main concepts to someone new to this topic${outcomeContext}?`;
      case 'true_false':
        return `The principles discussed in ${title} are universally applicable across all contexts${outcomeContext}.`;
      default:
        return `Question about ${title}${outcomeContext}`;
    }
  }

  private generateMCOptions(type: string, title: string): string[] {
    switch (type) {
      case 'multiple_choice':
        return [
          `Apply the foundational principles of ${title}`,
          `Use a completely different approach`,
          `Ignore the concepts from ${title}`,
          `Refer to outdated methods instead`
        ];
      default:
        return ['Option A', 'Option B', 'Option C', 'Option D'];
    }
  }

  private generateScenarioOptions(title: string): string[] {
    return [
      `Systematically apply the methodology from ${title}`,
      `Use trial and error without structured approach`,
      `Delegate the problem to someone else`,
      `Apply principles selectively based on context`
    ];
  }

  private generateExplanation(type: string, questionNum: number): string {
    switch (type) {
      case 'multiple_choice':
        return `This question tests your understanding of core concepts and their practical application. The correct answer demonstrates proper application of the learned principles.`;
      case 'scenario_based':
        return `This scenario-based question evaluates your ability to transfer learning to real-world situations and make informed decisions.`;
      case 'reflective':
        return `This reflective question assesses your depth of understanding and ability to articulate complex concepts clearly.`;
      case 'true_false':
        return `This statement tests your understanding of the scope and limitations of the concepts covered.`;
      default:
        return `This is a sample explanation for question #${questionNum}`;
    }
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
