'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  FileText, 
  Settings, 
  BarChart, 
  Edit, 
  Play,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { mockAssessmentApi, type Assessment } from '@/services/mockAssessmentApi';

export default function ViewAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadAssessment = async () => {
      if (!params.id || typeof params.id !== 'string') {
        router.push('/assessments');
        return;
      }

      setIsLoading(true);
      try {
        const data = await mockAssessmentApi.getAssessment(params.id);
        setAssessment(data);
      } catch (error) {
        console.error('Failed to load assessment:', error);
        // Create a mock assessment if the API fails
        const mockAssessment: Assessment = {
          id: params.id,
          title: `Sample Assessment ${params.id}`,
          description: 'This is a sample assessment for demonstration purposes.',
          type: 'quiz',
          timeLimit: 1800,
          maxAttempts: 3,
          questions: [
            {
              id: '1',
              type: 'multiple_choice',
              prompt: 'What is the capital of France?',
              options: ['London', 'Berlin', 'Paris', 'Madrid'],
              answer: 'Paris',
              points: 2,
              explanation: 'Paris is the capital and largest city of France.'
            },
            {
              id: '2',
              type: 'true_false',
              prompt: 'The Earth is flat.',
              options: ['True', 'False'],
              answer: 'False',
              points: 1,
              explanation: 'The Earth is spherical, not flat.'
            }
          ],
          settings: {
            randomizeQuestions: false,
            randomizeOptions: true,
            showFeedback: true,
            proctoringEnabled: false
          },
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setAssessment(mockAssessment);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssessment();
  }, [params.id, router]);

  const handleEditAssessment = () => {
    router.push(`/assessments/new`);
  };

  // Format time limit (seconds) to minutes
  const formatTimeLimit = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  // Calculate total points
  const totalPoints = assessment?.questions?.reduce((sum, q) => sum + q.points, 0) || 0;

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="container py-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold mt-4">Assessment Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The assessment you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/assessments')} className="mt-4">
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{assessment.title}</h1>
            <Badge variant={(() => {
              const type = assessment.type as string;
              if (type === 'quiz') return 'default';
              if (type === 'test') return 'secondary';
              if (type === 'exam') return 'destructive';
              if (type === 'scenario') return 'outline';
              return 'default';
            })()}>
              {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {assessment.description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditAssessment}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Assessment
          </Button>
          <Button onClick={() => alert('Preview functionality coming soon!')}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{assessment.questions?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{formatTimeLimit(assessment.timeLimit)}</p>
                <p className="text-sm text-muted-foreground">Time Limit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalPoints}</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{assessment.maxAttempts}</p>
                <p className="text-sm text-muted-foreground">Max Attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <FileText className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="questions">
            <Settings className="mr-2 h-4 w-4" />
            Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium capitalize">{assessment.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time Limit:</span>
                    <p className="font-medium">{formatTimeLimit(assessment.timeLimit)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Questions:</span>
                    <p className="font-medium">{assessment.questions?.length || 0}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Points:</span>
                    <p className="font-medium">{totalPoints}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Question Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assessment.questions && (() => {
                    const typeCounts = assessment.questions.reduce((acc, q) => {
                      acc[q.type] = (acc[q.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);

                    return Object.entries(typeCounts).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="capitalize text-sm">
                          {type.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Questions ({assessment.questions?.length || 0})</CardTitle>
              <CardDescription>
                Review all questions in this assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assessment.questions && assessment.questions.length > 0 ? (
                <div className="space-y-6">
                  {assessment.questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">Q{index + 1}.</span>
                        <Badge variant="outline" className="text-xs">
                          {question.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {question.points} point{question.points !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-3">{question.prompt}</p>
                      
                      {question.options && (
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div 
                              key={optIndex} 
                              className={`text-sm p-2 rounded ${
                                option === question.answer 
                                  ? 'bg-green-50 border-green-200 border' 
                                  : 'bg-muted/30'
                              }`}
                            >
                              <span className="font-medium mr-2">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              {option}
                              {option === question.answer && (
                                <CheckCircle className="inline ml-2 h-4 w-4 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.explanation && (
                        <div className="bg-yellow-50 border-yellow-200 border p-3 rounded mt-3">
                          <p className="text-sm">
                            <span className="font-medium">Explanation: </span>
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium mt-2">No Questions</h3>
                  <p className="text-muted-foreground">
                    This assessment doesn't have any questions yet.
                  </p>
                  <Button onClick={handleEditAssessment} className="mt-4">
                    Add Questions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
