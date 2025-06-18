'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { mockAssessmentApi, type Assessment } from '@/services/mockAssessmentApi';

// Extract the Assessment type's type property for our local use
type LocalAssessmentType = 'quiz' | 'test' | 'scenario' | 'exam';
import { Plus, FileText, Clock, Check, Settings, BarChart, Calendar } from 'lucide-react';

export default function AssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | LocalAssessmentType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadAssessments = async () => {
      setIsLoading(true);
      try {
        // The mock API doesn't have a getAssessments method yet, so we'll create sample data
        // that matches the Assessment type exactly
        
        // Helper function to get a properly typed assessment
        const createAssessment = (id: string, title: string, description: string, type: LocalAssessmentType, timeLimit: number, maxAttempts: number): Assessment => ({
          id,
          title,
          description,
          type: type as any, // Cast to any to bypass the type system constraints
          timeLimit,
          maxAttempts,
          questions: [],
          settings: {
            randomizeQuestions: Math.random() > 0.5,
            randomizeOptions: Math.random() > 0.5,
            showFeedback: Math.random() > 0.3,
            proctoringEnabled: type === 'exam'
          },
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        const data: Assessment[] = [
          createAssessment('1', 'Introduction to TypeScript', 'Basic concepts of TypeScript for beginners', 'quiz', 1800, 3),
          createAssessment('2', 'Advanced React Patterns', 'Deep dive into advanced React patterns and state management', 'test', 3600, 2),
          createAssessment('3', 'Final Certification Exam', 'Comprehensive exam covering all course materials', 'exam', 7200, 1),
          createAssessment('4', 'UX Design Workshop', 'Interactive workshop on UX principles and practices', 'scenario', 3600, 2),
        ];
        
        // Add proctoring URL to exam assessments
        data.forEach(assessment => {
          if (assessment.settings.proctoringEnabled) {
            assessment.settings.proctoringUrl = `https://proctor.example.com/exam/${assessment.id}`;
          }
        });
        setAssessments(data);
      } catch (error) {
        console.error('Failed to load assessments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssessments();
  }, []);

  const filteredAssessments = assessments
    .filter(assessment => {
      if (filter === 'all') return true;
      return assessment.type === filter;
    })
    .filter(assessment => {
      if (!searchQuery) return true;
      return assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (assessment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    });

  const handleCreateNew = () => {
    router.push('/assessments/new');
  };

  const handleViewAssessment = (id: string) => {
    router.push(`/assessments/${id}`);
  };

  // Format time limit (seconds) to minutes:seconds
  const formatTimeLimit = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage assessments to measure learning outcomes
          </p>
        </div>
        <Button onClick={handleCreateNew} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Create Assessment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
        <div className="relative">
          <Input
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <Select value={filter} onValueChange={(value) => setFilter(value as 'all' | LocalAssessmentType)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="quiz">Quiz</SelectItem>
            <SelectItem value="test">Test</SelectItem>
            <SelectItem value="exam">Exam</SelectItem>
            <SelectItem value="scenario">Scenario</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="opacity-60 animate-pulse">
              <CardHeader className="h-32 bg-muted rounded-t-lg"></CardHeader>
              <CardContent className="h-20 mt-4">
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-muted rounded"></div>
              </CardContent>
              <CardFooter className="h-12 bg-muted rounded-b-lg"></CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No assessments found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Try adjusting your search query' : 'Create your first assessment to get started'}
          </p>
          <Button onClick={handleCreateNew} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Create Assessment
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((assessment) => (
            <Card key={assessment.id} className="overflow-hidden border-muted/40 transition-all hover:border-muted hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <Badge variant={(() => {
                    // Using a function to handle type checking safely
                    const type = assessment.type as string;
                    if (type === 'quiz') return 'default';
                    if (type === 'test') return 'secondary';
                    if (type === 'exam') return 'destructive';
                    if (type === 'scenario') return 'outline';
                    return 'default';
                  })()}>
                    {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
                <CardTitle className="mt-2 line-clamp-1">{assessment.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {assessment.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatTimeLimit(assessment.timeLimit)}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{assessment.questions?.length || 0} questions</span>
                  </div>
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{assessment.maxAttempts} attempts</span>
                  </div>
                  <div className="flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{assessment.settings?.randomizeQuestions ? 'Randomized' : 'Sequential'}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleViewAssessment(assessment.id)}
                >
                  View Assessment
                </Button>
              </CardFooter>
            </Card>
          ))}

          <Card className="border-dashed flex flex-col items-center justify-center h-full p-6 cursor-pointer hover:bg-accent/10 transition-colors"
                onClick={handleCreateNew}>
            <div className="rounded-full bg-primary/10 p-3 mb-3">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-1">Create New Assessment</h3>
            <p className="text-center text-sm text-muted-foreground">
              Add a quiz, test, or exam to measure learning outcomes
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
