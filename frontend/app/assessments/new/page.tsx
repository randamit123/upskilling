'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Save, Upload, Settings, BarChart, FileText, Trash2, Pencil, Eye, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockAssessmentApi, type Assessment, type Question, type QuestionType } from '@/services/mockAssessmentApi';
import { AIQuestionGenerator } from '@/components/assessments/AIQuestionGenerator';

export default function NewAssessmentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settings');
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<Partial<Assessment>>({
    title: '',
    description: '',
    type: 'quiz',
    timeLimit: 1800,
    maxAttempts: 3,
    questions: [],
    settings: {
      randomizeQuestions: false,
      randomizeOptions: false,
      showFeedback: true,
      proctoringEnabled: false
    }
  });
  const [questionBanks, setQuestionBanks] = useState<any[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [questionMix, setQuestionMix] = useState({
    multiple_choice: 40,
    scenario_based: 30,
    reflective: 20,
    true_false: 10
  });

  useEffect(() => {
    // Load assessment types or other initial data
    const loadData = async () => {
      try {
        const types = await mockAssessmentApi.getAssessmentTypes();
        // Can be used for type selection if needed
      } catch (error) {
        console.error('Failed to load assessment types:', error);
      }
    };
    
    loadData();
  }, []);

  const handleSaveAssessment = async () => {
    if (!assessment.title) {
      alert('Please enter a title for the assessment');
      return;
    }

    setIsLoading(true);
    try {
      let savedAssessment: Assessment;
      
      if (assessment.id) {
        savedAssessment = await mockAssessmentApi.updateAssessment(assessment.id, assessment);
      } else {
        savedAssessment = await mockAssessmentApi.createAssessment(assessment);
      }
      
      setAssessment(savedAssessment);
      alert('Assessment saved successfully!');
      
      // If this is a new assessment, redirect to edit page with the new ID
      if (!assessment.id && savedAssessment.id) {
        router.push(`/assessments/${savedAssessment.id}`);
      }
    } catch (error) {
      console.error('Failed to save assessment:', error);
      alert('Failed to save assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (question: Omit<Question, 'id'>) => {
    if (!assessment.id) {
      alert('Please save the assessment before adding questions');
      return;
    }

    try {
      if (editingQuestion) {
        await mockAssessmentApi.updateQuestion(editingQuestion.id, question);
      } else {
        await mockAssessmentApi.addQuestion(assessment.id, question);
      }
      
      // Refresh assessment data
      const updated = await mockAssessmentApi.getAssessment(assessment.id);
      setAssessment(updated);
      setIsQuestionModalOpen(false);
    } catch (error) {
      console.error('Failed to save question:', error);
      alert('Failed to save question. Please try again.');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await mockAssessmentApi.deleteQuestion(questionId);
      
      if (assessment.id) {
        const updated = await mockAssessmentApi.getAssessment(assessment.id);
        setAssessment(updated);
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question. Please try again.');
    }
  };

  const handleGenerateQuestionBank = async () => {
    if (!assessment.title) {
      alert('Please enter a title for the assessment first');
      return;
    }

    // Calculate question count based on percentages
    const totalQuestions = 10; // Default total questions
    const questionCounts = {
      multiple_choice: Math.round((questionMix.multiple_choice / 100) * totalQuestions),
      scenario_based: Math.round((questionMix.scenario_based / 100) * totalQuestions),
      reflective: Math.round((questionMix.reflective / 100) * totalQuestions),
      true_false: Math.round((questionMix.true_false / 100) * totalQuestions)
    };

    try {
      const questions = await mockAssessmentApi.generateQuestionBank({
        assessmentTitle: assessment.title,
        assessmentDescription: assessment.description || '',
        learningOutcomes: learningOutcomes,
        uploadedFile: uploadedFile,
        questionMix: questionMix,
        questionCounts: questionCounts,
        assessmentType: assessment.type,
        timeLimit: assessment.timeLimit,
        count: totalQuestions,
        difficulty: 'medium'
      });
      
      setQuestionBanks(prev => [...prev, {
        id: `bank-${Date.now()}`,
        name: `AI Generated - ${new Date().toLocaleString()}`,
        questions,
        isAIGenerated: true
      }]);
    } catch (error) {
      console.error('Failed to generate question bank:', error);
      alert('Failed to generate question bank. Please try again.');
    }
  };

  const handleAddQuestionsFromBank = (questions: Omit<Question, 'id'>[]) => {
    if (!assessment.id) {
      alert('Please save the assessment before adding questions');
      return;
    }

    // Add each question from the bank
    const addQuestions = async () => {
      try {
        for (const question of questions) {
          await mockAssessmentApi.addQuestion(assessment.id!, question);
        }
        
        // Refresh assessment data
        const updated = await mockAssessmentApi.getAssessment(assessment.id!);
        setAssessment(updated);
      } catch (error) {
        console.error('Failed to add questions from bank:', error);
        throw error;
      }
    };

    addQuestions().catch(() => {
      alert('Failed to add some questions from the bank. Please try again.');
    });
  };

  const handleAIQuestionsGenerated = (aiQuestions: any[]) => {
    // Convert AI questions to the format expected by the assessment
    const convertedQuestions = aiQuestions.map(q => ({
      type: q.type,
      prompt: q.prompt,
      options: q.options,
      answer: q.answer,
      points: q.points,
      explanation: q.explanation
    }));
    
    // Add to the current question bank
    setQuestionBanks(prev => [...prev, {
      id: `ai-bank-${Date.now()}`,
      name: `AI Generated Questions - ${new Date().toLocaleString()}`,
      questions: convertedQuestions
    }]);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {assessment.id ? 'Edit Assessment' : 'Create New Assessment'}
          </h1>
          <p className="text-muted-foreground">
            {assessment.id 
              ? `Edit your assessment details and questions` 
              : 'Set up a new assessment with questions and settings'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/assessments')}>
            Cancel
          </Button>
          <Button onClick={handleSaveAssessment} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Assessment'}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="questions" disabled={!assessment.id}>
            <FileText className="mr-2 h-4 w-4" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="analytics" disabled={!assessment.id}>
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Upload</CardTitle>
              <CardDescription>
                Upload learning materials to automatically generate questions aligned with learning outcomes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Content
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedFile(file);
                          console.log('File selected:', file.name);
                        }
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Upload PDF, Word documents, PowerPoint, or text files
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum file size: 10MB
                  </p>
                </div>
              </div>
              
              {uploadedFile && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {uploadedFile.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFile(null)}
                    className="ml-auto h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="learning-outcomes">Learning Outcomes</Label>
                  <Textarea
                    id="learning-outcomes"
                    placeholder="Enter the learning outcomes this assessment should measure..."
                    rows={4}
                    value={learningOutcomes}
                    onChange={(e) => setLearningOutcomes(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Define what learners should be able to do after completing the associated content
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-mix">Question Type Mix (%)</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Label className="w-32 text-sm">Multiple Choice</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={questionMix.multiple_choice}
                          onChange={(e) => setQuestionMix({
                            ...questionMix,
                            multiple_choice: parseInt(e.target.value) || 0
                          })}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="w-32 text-sm">Scenario-Based</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={questionMix.scenario_based}
                          onChange={(e) => setQuestionMix({
                            ...questionMix,
                            scenario_based: parseInt(e.target.value) || 0
                          })}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="w-32 text-sm">Reflective</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={questionMix.reflective}
                          onChange={(e) => setQuestionMix({
                            ...questionMix,
                            reflective: parseInt(e.target.value) || 0
                          })}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="w-32 text-sm">True/False</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={questionMix.true_false}
                          onChange={(e) => setQuestionMix({
                            ...questionMix,
                            true_false: parseInt(e.target.value) || 0
                          })}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total: {Object.values(questionMix).reduce((sum, val) => sum + val, 0)}%
                        {Object.values(questionMix).reduce((sum, val) => sum + val, 0) !== 100 && (
                          <span className="text-destructive ml-2">
                            (Should total 100%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleGenerateQuestionBank}
                    disabled={!assessment.title || Object.values(questionMix).reduce((sum, val) => sum + val, 0) !== 100}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Generate AI Questions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Set the basic details for your assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Assessment Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter assessment title"
                    value={assessment.title}
                    onChange={(e) => setAssessment({...assessment, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Assessment Type</Label>
                  <Select
                    value={assessment.type}
                    onValueChange={(value) => setAssessment({...assessment, type: value as Assessment['type']})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="test">Test</SelectItem>
                      <SelectItem value="scenario">Scenario-based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter a description for this assessment"
                  value={assessment.description || ''}
                  onChange={(e) => setAssessment({...assessment, description: e.target.value})}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timing & Attempts</CardTitle>
              <CardDescription>
                Configure time limits and number of attempts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    value={assessment.timeLimit ? Math.floor(assessment.timeLimit / 60) : 30}
                    onChange={(e) => setAssessment({
                      ...assessment, 
                      timeLimit: parseInt(e.target.value) * 60
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min="1"
                    value={assessment.maxAttempts || 1}
                    onChange={(e) => setAssessment({
                      ...assessment, 
                      maxAttempts: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessment Settings</CardTitle>
              <CardDescription>
                Configure additional settings for this assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="randomize-questions">Randomize Questions</Label>
                  <p className="text-sm text-muted-foreground">
                    Display questions in a different order for each student
                  </p>
                </div>
                <Switch
                  id="randomize-questions"
                  checked={assessment.settings?.randomizeQuestions || false}
                  onCheckedChange={(checked) => setAssessment({
                    ...assessment,
                    settings: {
                      randomizeQuestions: checked,
                      randomizeOptions: assessment.settings?.randomizeOptions || false,
                      showFeedback: assessment.settings?.showFeedback !== false,
                      proctoringEnabled: assessment.settings?.proctoringEnabled || false,
                      ...(assessment.settings?.proctoringUrl ? { proctoringUrl: assessment.settings.proctoringUrl } : {})
                    }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="randomize-options">Randomize Answer Options</Label>
                  <p className="text-sm text-muted-foreground">
                    Shuffle the order of multiple choice options for each attempt
                  </p>
                </div>
                <Switch
                  id="randomize-options"
                  checked={assessment.settings?.randomizeOptions || false}
                  onCheckedChange={(checked) => setAssessment({
                    ...assessment,
                    settings: {
                      randomizeQuestions: assessment.settings?.randomizeQuestions || false,
                      randomizeOptions: checked,
                      showFeedback: assessment.settings?.showFeedback !== false,
                      proctoringEnabled: assessment.settings?.proctoringEnabled || false,
                      ...(assessment.settings?.proctoringUrl ? { proctoringUrl: assessment.settings.proctoringUrl } : {})
                    }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-feedback">Show Feedback</Label>
                  <p className="text-sm text-muted-foreground">
                    Display feedback after each question is answered
                  </p>
                </div>
                <Switch
                  id="show-feedback"
                  checked={assessment.settings?.showFeedback !== false}
                  onCheckedChange={(checked) => setAssessment({
                    ...assessment,
                    settings: {
                      randomizeQuestions: assessment.settings?.randomizeQuestions || false,
                      randomizeOptions: assessment.settings?.randomizeOptions || false,
                      showFeedback: checked,
                      proctoringEnabled: assessment.settings?.proctoringEnabled || false,
                      ...(assessment.settings?.proctoringUrl ? { proctoringUrl: assessment.settings.proctoringUrl } : {})
                    }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="proctoring-enabled">Enable Proctoring</Label>
                  <p className="text-sm text-muted-foreground">
                    Use AI-based proctoring to detect potential cheating
                  </p>
                </div>
                <Switch
                  id="proctoring-enabled"
                  checked={assessment.settings?.proctoringEnabled || false}
                  onCheckedChange={async (checked) => {
                    try {
                      let proctoringUrl = assessment.settings?.proctoringUrl;
                      
                      if (checked && assessment.id) {
                        // If enabling proctoring and assessment is saved, get proctoring URL
                        const result = await mockAssessmentApi.enableProctoring(assessment.id);
                        proctoringUrl = result.proctoringUrl;
                      }
                      
                      setAssessment({
                        ...assessment,
                        settings: {
                          randomizeQuestions: assessment.settings?.randomizeQuestions || false,
                          randomizeOptions: assessment.settings?.randomizeOptions || false,
                          showFeedback: assessment.settings?.showFeedback !== false,
                          proctoringEnabled: checked,
                          ...(proctoringUrl ? { proctoringUrl } : {})
                        }
                      });
                    } catch (error) {
                      console.error('Failed to configure proctoring:', error);
                      alert('Failed to configure proctoring. Please try again.');
                    }
                  }}
                />
              </div>
              
              {assessment.settings?.proctoringUrl && (
                <div className="p-4 bg-muted/50 rounded-md text-sm">
                  <p className="font-medium">Proctoring is enabled for this assessment</p>
                  <p className="text-muted-foreground">
                    Proctoring URL: {assessment.settings.proctoringUrl}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Questions</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGenerateQuestionBank}>
                <Plus className="mr-2 h-4 w-4" />
                Generate Question Bank
              </Button>
              <Button onClick={handleAddQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
          </div>

          {questionBanks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Question Banks</CardTitle>
                <CardDescription>
                  Review and edit AI-generated questions before adding them to your assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {questionBanks.map((bank) => (
                    <div key={bank.id} className="border rounded-md">
                      <div className="flex justify-between items-center p-4 border-b bg-muted/50">
                        <div>
                          <h4 className="font-medium">{bank.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {bank.questions.length} questions • Click questions below to review and edit
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAddQuestionsFromBank(bank.questions)}
                          >
                            Add All to Assessment
                          </Button>
                        </div>
                      </div>
                      
                      {bank.isAIGenerated && (
                        <QuestionReviewSection 
                          questions={bank.questions}
                          onQuestionEdit={(questionIndex, updatedQuestion) => {
                            const updatedQuestions = [...bank.questions];
                            updatedQuestions[questionIndex] = updatedQuestion;
                            setQuestionBanks(prev => prev.map(b => 
                              b.id === bank.id 
                                ? { ...b, questions: updatedQuestions }
                                : b
                            ));
                          }}
                          onAddQuestion={(question) => {
                            if (assessment.id) {
                              handleSaveQuestion(question);
                            } else {
                              alert('Please save the assessment first before adding questions');
                            }
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-0">
              {assessment.questions && assessment.questions.length > 0 ? (
                <div className="divide-y">
                  {assessment.questions.map((question, index) => (
                    <div key={question.id} className="p-4 hover:bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Q{index + 1}.</span>
                            <p>{question.prompt}</p>
                          </div>
                          <div className="ml-6 mt-2 text-sm text-muted-foreground">
                            <span className="capitalize">{question.type.replace('_', ' ')}</span>
                            <span className="mx-2">•</span>
                            <span>{question.points} point{question.points !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No questions yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get started by adding a new question or generating a question bank.
                  </p>
                  <div className="mt-6">
                    <Button onClick={handleAddQuestion}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Question
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Analytics</CardTitle>
              <CardDescription>
                View performance metrics and insights for this assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assessment.id ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold">
                          {Math.floor(Math.random() * 30) + 70}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Average Score
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold">
                          {Math.floor(Math.random() * 30) + 60}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Completion Rate
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold">
                          {Math.floor(Math.random() * 20) + 10}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Total Attempts
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Question Performance</CardTitle>
                      <CardDescription>
                        How learners performed on each question
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {assessment.questions?.map((question, index) => (
                          <div key={question.id} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">Q{index + 1}. {question.prompt}</span>
                              <span className="text-sm text-muted-foreground">
                                {Math.floor(Math.random() * 40) + 50}% correct
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${Math.floor(Math.random() * 40) + 50}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Save the assessment to view analytics
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Question Editor Modal */}
      {isQuestionModalOpen && (
        <QuestionEditorModal
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onClose={() => setIsQuestionModalOpen(false)}
        />
      )}
    </div>
  );
}

// Question Review Section Component
function QuestionReviewSection({
  questions,
  onQuestionEdit,
  onAddQuestion
}: {
  questions: Omit<Question, 'id'>[];
  onQuestionEdit: (questionIndex: number, updatedQuestion: Omit<Question, 'id'>) => void;
  onAddQuestion: (question: Omit<Question, 'id'>) => void;
}) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [questionEdits, setQuestionEdits] = useState<Record<number, Omit<Question, 'id'>>>({});

  const handleEditQuestion = (questionIndex: number) => {
    setEditingQuestion(questionIndex);
    setQuestionEdits(prev => ({
      ...prev,
      [questionIndex]: { ...questions[questionIndex] }
    }));
  };

  const handleSaveEdit = (questionIndex: number) => {
    const editedQuestion = questionEdits[questionIndex];
    if (editedQuestion) {
      onQuestionEdit(questionIndex, editedQuestion);
      setEditingQuestion(null);
      setQuestionEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits[questionIndex];
        return newEdits;
      });
    }
  };

  const handleCancelEdit = (questionIndex: number) => {
    setEditingQuestion(null);
    setQuestionEdits(prev => {
      const newEdits = { ...prev };
      delete newEdits[questionIndex];
      return newEdits;
    });
  };

  const updateQuestionEdit = (questionIndex: number, field: string, value: any) => {
    setQuestionEdits(prev => ({
      ...prev,
      [questionIndex]: {
        ...prev[questionIndex],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-3">
      {questions.map((question, index) => {
        const isEditing = editingQuestion === index;
        const isExpanded = expandedQuestion === index;
        const currentQuestion = isEditing ? (questionEdits[index] || question) : question;

        return (
          <div key={index} className="border-b last:border-b-0 p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm">Q{index + 1}.</span>
                  <Badge variant="outline" className="text-xs">
                    {currentQuestion.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <Textarea
                      value={currentQuestion.prompt}
                      onChange={(e) => updateQuestionEdit(index, 'prompt', e.target.value)}
                      className="min-h-[60px]"
                    />
                    
                    {currentQuestion.options && (
                      <div className="space-y-2">
                        <Label className="text-sm">Options:</Label>
                        {currentQuestion.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`question-${index}-answer`}
                              checked={currentQuestion.answer === option}
                              onChange={() => updateQuestionEdit(index, 'answer', option)}
                              className="h-4 w-4"
                            />
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...currentQuestion.options!];
                                newOptions[optIndex] = e.target.value;
                                updateQuestionEdit(index, 'options', newOptions);
                                // Update answer if this was the selected option
                                if (currentQuestion.answer === option) {
                                  updateQuestionEdit(index, 'answer', e.target.value);
                                }
                              }}
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">Points</Label>
                        <Input
                          type="number"
                          min="1"
                          value={currentQuestion.points}
                          onChange={(e) => updateQuestionEdit(index, 'points', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm">Explanation</Label>
                      <Textarea
                        value={currentQuestion.explanation || ''}
                        onChange={(e) => updateQuestionEdit(index, 'explanation', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm mb-2">{currentQuestion.prompt}</p>
                    
                    {isExpanded && currentQuestion.options && (
                      <div className="space-y-1 mb-3">
                        {currentQuestion.options.map((option, optIndex) => (
                          <div 
                            key={optIndex} 
                            className={`text-sm p-2 rounded ${
                              option === currentQuestion.answer 
                                ? 'bg-green-50 border-green-200 border' 
                                : 'bg-muted/30'
                            }`}
                          >
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            {option}
                            {option === currentQuestion.answer && (
                              <CheckCircle className="inline ml-2 h-4 w-4 text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {isExpanded && currentQuestion.explanation && (
                      <div className="bg-yellow-50 border-yellow-200 border p-3 rounded mt-3">
                        <p className="text-sm">
                          <span className="font-medium">Explanation: </span>
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-1">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={() => handleSaveEdit(index)}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCancelEdit(index)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedQuestion(isExpanded ? null : index)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditQuestion(index)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onAddQuestion(currentQuestion)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Question Editor Modal Component
function QuestionEditorModal({
  question,
  onSave,
  onClose
}: {
  question: Question | null;
  onSave: (question: Omit<Question, 'id'>) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<QuestionType>(question?.type || 'multiple_choice');
  const [prompt, setPrompt] = useState(question?.prompt || '');
  const [options, setOptions] = useState<string[]>(question?.options || ['', '', '', '']);
  const [answer, setAnswer] = useState<string | string[]>(question?.answer || '');
  const [points, setPoints] = useState(question?.points || 1);
  const [explanation, setExplanation] = useState(question?.explanation || '');

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    
    // If the answer was one of the removed options, clear it
    if (typeof answer === 'string' && answer === options[index]) {
      setAnswer('');
    } else if (Array.isArray(answer) && answer.includes(options[index])) {
      setAnswer(answer.filter(a => a !== options[index]));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      alert('Please enter a question prompt');
      return;
    }
    
    if ((type === 'multiple_choice' || type === 'true_false') && options.some(opt => !opt.trim())) {
      alert('Please fill in all options');
      return;
    }
    
    if (type === 'multiple_choice' && !answer) {
      alert('Please select the correct answer');
      return;
    }
    
    if (type === 'true_false' && !answer) {
      alert('Please select True or False');
      return;
    }
    
    if (type === 'short_answer' && !answer) {
      alert('Please provide a sample answer');
      return;
    }
    
    onSave({
      type,
      prompt,
      options: type !== 'short_answer' ? options : undefined,
      answer,
      points,
      explanation
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {question ? 'Edit Question' : 'Add New Question'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              &times;
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="question-type">Question Type</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as QuestionType)}
                disabled={!!question}
              >
                <SelectTrigger id="question-type" className="mt-1">
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="prompt">Question Prompt *</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your question here"
                className="mt-1"
                rows={3}
                required
              />
            </div>
            
            {(type === 'multiple_choice' || type === 'true_false') && (
              <div>
                <Label>Options *</Label>
                <div className="space-y-2 mt-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {type === 'multiple_choice' ? (
                        <input
                          type="radio"
                          name="correct-answer"
                          checked={answer === option}
                          onChange={() => setAnswer(option)}
                          className="h-4 w-4"
                        />
                      ) : (
                        <input
                          type="radio"
                          name="true-false"
                          checked={answer === option}
                          onChange={() => setAnswer(option)}
                          className="h-4 w-4"
                        />
                      )}
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                      {type === 'multiple_choice' && options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {type === 'multiple_choice' && options.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Option
                    </Button>
                  )}
                </div>
              </div>
            )}

            {type === 'short_answer' && (
              <div>
                <Label htmlFor="sample-answer">Sample Answer *</Label>
                <Textarea
                  id="sample-answer"
                  value={typeof answer === 'string' ? answer : ''}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter a sample correct answer"
                  className="mt-1"
                  rows={3}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="points">Points *</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="explanation">Explanation (Optional)</Label>
              <Textarea
                id="explanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Provide an explanation for the correct answer"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {question ? 'Update Question' : 'Add Question'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}