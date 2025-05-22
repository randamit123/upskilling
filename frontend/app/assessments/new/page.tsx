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
import { Plus, Save, Upload, Settings, BarChart, FileText, Trash2, Pencil } from 'lucide-react';
import { mockAssessmentApi, type Assessment, type Question, type QuestionType } from '@/services/mockAssessmentApi';

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

    try {
      const questions = await mockAssessmentApi.generateQuestionBank({
        topic: assessment.title,
        count: 5,
        difficulty: 'medium',
        questionTypes: ['multiple_choice', 'true_false']
      });
      
      setQuestionBanks(prev => [...prev, {
        id: `bank-${Date.now()}`,
        name: `Generated Bank - ${new Date().toLocaleString()}`,
        questions
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
                <CardTitle>Question Banks</CardTitle>
                <CardDescription>
                  Generated question banks that you can add to your assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questionBanks.map((bank) => (
                    <div key={bank.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{bank.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {bank.questions.length} questions
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddQuestionsFromBank(bank.questions)}
                        >
                          Add to Assessment
                        </Button>
                      </div>
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
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
                      className="mt-2"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add Option
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {type === 'short_answer' && (
              <div>
                <Label htmlFor="answer">Sample Answer *</Label>
                <Textarea
                  id="answer"
                  value={answer as string}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter a sample answer"
                  className="mt-1"
                  rows={2}
                  required
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Input
                  id="explanation"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Add an explanation for the answer"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
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
