'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  Settings,
  Sparkles,
  Target,
  BookOpen
} from 'lucide-react';

interface GeneratedQuestion {
  id: string;
  type: 'multiple_choice' | 'scenario' | 'reflective' | 'true_false';
  prompt: string;
  options?: string[];
  answer: string | string[];
  points: number;
  explanation: string;
  learningOutcome: string;
  difficulty: 'easy' | 'medium' | 'hard';
  bloomsLevel: string;
}

interface AIQuestionGeneratorProps {
  onQuestionsGenerated: (questions: GeneratedQuestion[]) => void;
  assessmentTitle?: string;
}

export function AIQuestionGenerator({ onQuestionsGenerated, assessmentTitle }: AIQuestionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'mixed' | 'easy' | 'medium' | 'hard'>('mixed');
  const [questionTypes, setQuestionTypes] = useState({
    multiple_choice: 40,
    scenario: 30,
    reflective: 20,
    true_false: 10
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!uploadedFile && !learningOutcomes) {
      alert('Please upload content or specify learning outcomes');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate AI generation process
      const steps = [
        'Analyzing uploaded content...',
        'Extracting key concepts...',
        'Mapping to learning outcomes...',
        'Generating questions...',
        'Aligning with Bloom\'s taxonomy...',
        'Finalizing assessment...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setGenerationProgress(((i + 1) / steps.length) * 100);
      }

      // Generate mock questions
      const mockQuestions: GeneratedQuestion[] = [
        {
          id: 'mcq-1',
          type: 'multiple_choice',
          prompt: `Based on the uploaded content, which of the following best describes the main concept of ${assessmentTitle || 'the material'}?`,
          options: [
            'It primarily focuses on theoretical foundations',
            'It emphasizes practical application and implementation',
            'It combines both theoretical and practical elements',
            'It is mainly concerned with historical context'
          ],
          answer: 'It combines both theoretical and practical elements',
          points: 2,
          explanation: 'The content demonstrates a balanced approach integrating theory with practical applications.',
          learningOutcome: 'Understand key concepts and their applications',
          difficulty: 'medium',
          bloomsLevel: 'Understanding'
        },
        {
          id: 'scenario-1',
          type: 'scenario',
          prompt: `You are working on a project where you need to apply the concepts from ${uploadedFile?.name || 'the course material'}. A team member asks for your guidance on implementation. How would you approach this situation?`,
          options: [
            'Start with a thorough analysis of requirements and constraints',
            'Jump directly into implementation to save time',
            'Delegate the task to someone with more experience',
            'Research similar projects and adapt their solutions'
          ],
          answer: 'Start with a thorough analysis of requirements and constraints',
          points: 5,
          explanation: 'A systematic approach ensures all factors are considered before implementation.',
          learningOutcome: 'Apply knowledge in practical scenarios',
          difficulty: 'medium',
          bloomsLevel: 'Application'
        },
        {
          id: 'reflective-1',
          type: 'reflective',
          prompt: `Reflect on how the concepts you've learned could be applied in your current role or future career. Provide specific examples and explain your reasoning.`,
          answer: 'Sample answer: The concepts of systematic analysis and implementation planning can be directly applied to project management in my role...',
          points: 8,
          explanation: 'Reflective questions help consolidate learning and connect theory to personal experience.',
          learningOutcome: 'Synthesize and reflect on learning',
          difficulty: 'hard',
          bloomsLevel: 'Synthesis'
        }
      ];

      onQuestionsGenerated(mockQuestions);
      
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Question Generator
          <Badge variant="secondary" className="ml-2">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </CardTitle>
        <CardDescription>
          Upload content and generate assessments automatically aligned with learning outcomes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Upload Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <Label className="text-sm font-medium">Upload Learning Content</Label>
          </div>
          
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center">
              {uploadedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setUploadedFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => document.getElementById('ai-file-upload')?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Content
                    </Button>
                    <input
                      id="ai-file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                      onChange={handleFileUpload}
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Upload PDF, Word docs, PowerPoint, or text files
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Learning Outcomes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <Label htmlFor="learning-outcomes">Learning Outcomes</Label>
          </div>
          <Textarea
            id="learning-outcomes"
            value={learningOutcomes}
            onChange={(e) => setLearningOutcomes(e.target.value)}
            placeholder={`Enter learning outcomes (one per line):
• Students will be able to analyze complex problems
• Students will demonstrate practical application skills
• Students will synthesize information from multiple sources`}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Define specific, measurable learning outcomes that align with Bloom's taxonomy
          </p>
        </div>

        {/* Generation Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question-count">Number of Questions</Label>
              <Input
                id="question-count"
                type="number"
                min="5"
                max="50"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Mixed Difficulty</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question Type Distribution</Label>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Multiple Choice</span>
                    <span>{questionTypes.multiple_choice}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${questionTypes.multiple_choice}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Scenario-Based</span>
                    <span>{questionTypes.scenario}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ width: `${questionTypes.scenario}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Reflective</span>
                    <span>{questionTypes.reflective}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500" 
                      style={{ width: `${questionTypes.reflective}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>True/False</span>
                    <span>{questionTypes.true_false}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500" 
                      style={{ width: `${questionTypes.true_false}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Generating Questions...</span>
            </div>
            <Progress value={generationProgress} className="w-full" />
            <p className="text-xs text-muted-foreground text-center">
              AI is analyzing content and creating assessment questions
            </p>
          </div>
        )}

        {/* Generate Button */}
        <Button 
          onClick={handleGenerateQuestions}
          disabled={isGenerating || (!uploadedFile && !learningOutcomes)}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Settings className="mr-2 h-4 w-4 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Generate AI Assessment
            </>
          )}
        </Button>
        
        {(!uploadedFile && !learningOutcomes) && (
          <p className="text-center text-sm text-muted-foreground">
            Upload content or specify learning outcomes to get started
          </p>
        )}
      </CardContent>
    </Card>
  );
} 