"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit, Trash2, X, ChevronDown, ChevronUp, MoveVertical, Upload, FileText, BarChart, Download } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

// Mock API Service
import MockApiService, { Survey, SurveyQuestion, SurveyResult } from "@/services/mockApiService";

export default function SurveyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for surveys
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("build");
  const [activeView, setActiveView] = useState<"build" | "preview" | "results">("build");
  
  // State for survey creation
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [templates, setTemplates] = useState<{id: string; name: string; description: string}[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  
  // State for question editing
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [questionPalette, setQuestionPalette] = useState([
    { type: "text", label: "Text Input" },
    { type: "multiple_choice", label: "Multiple Choice" },
    { type: "true_false", label: "True/False" },
    { type: "rating", label: "Rating Scale" },
    { type: "likert", label: "Likert Scale" }
  ]);
  
  // State for conditional logic
  const [showConditions, setShowConditions] = useState(false);
  
  // State for survey results
  const [surveyResults, setSurveyResults] = useState<SurveyResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  
  // Load surveys and templates on mount
  useEffect(() => {
    fetchSurveys();
    fetchTemplates();
  }, []);
  
  // Update questions when selected survey changes
  useEffect(() => {
    if (selectedSurvey) {
      setQuestions(selectedSurvey.questions);
      if (activeView === "results") {
        fetchSurveyResults(selectedSurvey.id);
      }
    } else {
      setQuestions([]);
    }
  }, [selectedSurvey, activeView]);
  
  // Fetch all surveys
  const fetchSurveys = async () => {
    setIsLoading(true);
    try {
      // STUBBED API CALL: Replace with real endpoint when backend is ready
      const data = await MockApiService.survey.getAllSurveys();
      setSurveys(data);
      
      // Select the first survey if available
      if (data.length > 0 && !selectedSurvey) {
        setSelectedSurvey(data[0]);
      }
    } catch (error) {
      toast({
        title: "Error fetching surveys",
        description: "Failed to load surveys",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch templates
  const fetchTemplates = async () => {
    try {
      // STUBBED API CALL: Replace with real endpoint when backend is ready
      const data = await MockApiService.survey.getTemplates();
      setTemplates(data);
    } catch (error) {
      toast({
        title: "Error fetching templates",
        description: "Failed to load survey templates",
        variant: "destructive",
      });
    }
  };
  
  // Create a new survey
  const handleCreateSurvey = async (e: FormEvent) => {
    e.preventDefault();
    
    if (title.trim() === "") {
      toast({
        title: "Empty title",
        description: "Please provide a title for your survey",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    try {
      // STUBBED API CALL: Replace with real endpoint when backend is ready
      const newSurvey = await MockApiService.survey.createSurvey(title, description, selectedTemplate);
      
      // Add new survey to the list
      setSurveys(prev => [newSurvey, ...prev]);
      
      // Select the new survey
      setSelectedSurvey(newSurvey);
      setQuestions(newSurvey.questions);
      
      // Clear form
      setTitle("");
      setDescription("");
      setSelectedTemplate("");
      setActiveTab("build");
      
      toast({
        title: "Survey created",
        description: `Successfully created "${newSurvey.title}"`
      });
    } catch (error) {
      toast({
        title: "Creation failed",
        description: "Failed to create survey",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  // Add a new question
  const handleAddQuestion = (type: string) => {
    const newQuestion: SurveyQuestion = {
      id: `q-${Date.now()}`,
      type: type as any,
      prompt: `New ${type} question`,
      required: false
    };
    
    // Add options for multiple choice questions
    if (type === "multiple_choice") {
      newQuestion.options = ["Option 1", "Option 2", "Option 3"];
    }
    
    // Add options for rating questions
    if (type === "rating") {
      newQuestion.options = ["1", "2", "3", "4", "5"];
    }
    
    setQuestions(prev => [...prev, newQuestion]);
    
    // If we have a selected survey, update it
    if (selectedSurvey) {
      updateSurveyQuestions([...questions, newQuestion]);
    }
  };
  
  // Update a question
  const handleUpdateQuestion = (index: number, updates: Partial<SurveyQuestion>) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    setQuestions(updatedQuestions);
    
    if (selectedSurvey) {
      updateSurveyQuestions(updatedQuestions);
    }
  };
  
  // Remove a question
  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    
    if (selectedSurvey) {
      updateSurveyQuestions(updatedQuestions);
    }
  };
  
  // Move a question up or down
  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) || 
      (direction === "down" && index === questions.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updatedQuestions = [...questions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = 
      [updatedQuestions[newIndex], updatedQuestions[index]];
    
    setQuestions(updatedQuestions);
    
    if (selectedSurvey) {
      updateSurveyQuestions(updatedQuestions);
    }
  };
  
  // Update survey questions
  const updateSurveyQuestions = async (updatedQuestions: SurveyQuestion[]) => {
    if (!selectedSurvey) return;
    
    try {
      // STUBBED API CALL: Replace with real endpoint when backend is ready
      const updatedSurvey = await MockApiService.survey.updateSurvey(selectedSurvey.id, {
        questions: updatedQuestions
      });
      
      // Update survey in state
      setSurveys(prev => 
        prev.map(s => s.id === updatedSurvey.id ? updatedSurvey : s)
      );
      setSelectedSurvey(updatedSurvey);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update survey questions",
        variant: "destructive",
      });
    }
  };
  
  // Add condition to a question
  const handleAddCondition = (questionIndex: number, dependsOnId: string, showIf: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = { 
      ...updatedQuestions[questionIndex],
      condition: { dependsOn: dependsOnId, showIf }
    };
    setQuestions(updatedQuestions);
    
    if (selectedSurvey) {
      updateSurveyQuestions(updatedQuestions);
    }
  };
  
  // Remove condition from a question
  const handleRemoveCondition = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const question = { ...updatedQuestions[questionIndex] };
    delete question.condition;
    updatedQuestions[questionIndex] = question;
    
    setQuestions(updatedQuestions);
    
    if (selectedSurvey) {
      updateSurveyQuestions(updatedQuestions);
    }
  };
  
  // Fetch survey results
  const fetchSurveyResults = async (surveyId: string) => {
    if (!surveyId) return;
    
    setIsLoadingResults(true);
    try {
      // STUBBED API CALL: Replace with real endpoint when backend is ready
      const data = await MockApiService.survey.getSurveyResults(surveyId);
      setSurveyResults(data.results);
    } catch (error) {
      toast({
        title: "Error fetching results",
        description: "Failed to load survey results",
        variant: "destructive",
      });
      setSurveyResults([]);
    } finally {
      setIsLoadingResults(false);
    }
  };
  
  // Export survey results to CSV
  const handleExportResults = () => {
    if (!selectedSurvey || surveyResults.length === 0) return;
    
    // Group results by respondent
    const respondents: Record<string, Record<string, string | string[]>> = {};
    
    surveyResults.forEach(result => {
      const respondentId = result.respondentId || 'anonymous';
      if (!respondents[respondentId]) {
        respondents[respondentId] = {};
      }
      respondents[respondentId][result.questionId] = result.response;
    });
    
    // Create CSV headers - question texts
    const questionMap = new Map(questions.map(q => [q.id, q.prompt]));
    const headers = ['respondent_id', ...questions.map(q => q.prompt)];
    
    // Create CSV rows
    const rows = Object.entries(respondents).map(([respondentId, answers]) => {
      return [
        respondentId,
        ...questions.map(q => {
          const answer = answers[q.id];
          return answer ? (Array.isArray(answer) ? answer.join(', ') : answer) : '';
        })
      ];
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedSurvey.title}_results.csv`);
    link.click();
  };
  
  // Get chart data for a specific question
  const getChartData = (questionId: string) => {
    if (!surveyResults.length) return [];
    
    const questionResults = surveyResults.filter(r => r.questionId === questionId);
    const resultCounts: Record<string, number> = {};
    
    questionResults.forEach(result => {
      const response = Array.isArray(result.response) ? result.response.join(', ') : result.response;
      resultCounts[response] = (resultCounts[response] || 0) + 1;
    });
    
    return Object.entries(resultCounts).map(([label, value]) => ({ label, value }));
  };
  
  // Render survey list
  const renderSurveyList = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="cursor-pointer hover:bg-muted/50">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (surveys.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No surveys found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setActiveTab("create")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create new survey
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {surveys.map(survey => (
          <Card 
            key={survey.id} 
            className={`cursor-pointer hover:bg-muted/50 ${selectedSurvey?.id === survey.id ? 'border-primary' : ''}`}
            onClick={() => setSelectedSurvey(survey)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{survey.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{survey.questions.length} questions</span>
                <span>•</span>
                <span>{new Date(survey.updatedAt).toLocaleDateString()}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-sm">{survey.description}</p>
            </CardContent>
            <CardFooter>
              <Badge variant={survey.published ? "default" : "outline"}>
                {survey.published ? "Published" : "Draft"}
              </Badge>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render question editor
  const renderQuestionEditor = () => {
    if (!selectedSurvey) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Select a survey to edit questions</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{selectedSurvey.title}</h2>
            <p className="text-muted-foreground mt-1">{selectedSurvey.description}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveView("preview")}
            >
              Preview
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveView("results")}
            >
              Results
            </Button>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="w-1/4 border rounded-md p-4">
            <h3 className="font-medium mb-3">Question Types</h3>
            <div className="space-y-2">
              {questionPalette.map(item => (
                <Card 
                  key={item.type} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleAddQuestion(item.type)}
                >
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center">
                      <Plus className="h-3 w-3 mr-2" />
                      {item.label}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
            
            <div className="mt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="show-conditions"
                  checked={showConditions}
                  onCheckedChange={setShowConditions}
                />
                <Label htmlFor="show-conditions">Show Conditions</Label>
              </div>
            </div>
          </div>
          
          <div className="w-3/4">
            {questions.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-md">
                <p className="text-muted-foreground mb-2">No questions yet</p>
                <p className="text-sm text-muted-foreground">Add questions from the palette on the left</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader className="pb-2 flex flex-row items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-normal">
                            {question.type.replace('_', ' ')}
                          </Badge>
                          {question.required && (
                            <Badge>Required</Badge>
                          )}
                          {question.condition && (
                            <Badge variant="secondary">
                              Conditional
                            </Badge>
                          )}
                        </div>
                        
                        <div className="mt-2">
                          <Input
                            value={question.prompt}
                            onChange={(e) => handleUpdateQuestion(index, { prompt: e.target.value })}
                            className="font-medium text-lg border-none p-0 focus-visible:ring-0"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveQuestion(index, "up")}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveQuestion(index, "down")}
                          disabled={index === questions.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveQuestion(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {question.type === "multiple_choice" && (
                        <div className="space-y-2">
                          {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(question.options || [])];
                                  newOptions[optionIndex] = e.target.value;
                                  handleUpdateQuestion(index, { options: newOptions });
                                }}
                                className="flex-1"
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newOptions = (question.options || []).filter((_, i) => i !== optionIndex);
                                  handleUpdateQuestion(index, { options: newOptions });
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
                              handleUpdateQuestion(index, { options: newOptions });
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      )}
                      
                      {question.type === "rating" && (
                        <div>
                          <Label className="mb-2 block">Rating Scale</Label>
                          <div className="flex items-center gap-4">
                            <Input 
                              type="number" 
                              className="w-20" 
                              value={question.options?.[0] || "1"}
                              onChange={(e) => {
                                const min = e.target.value;
                                const max = question.options?.[question.options.length - 1] || "5";
                                const newOptions = [];
                                for (let i = parseInt(min); i <= parseInt(max); i++) {
                                  newOptions.push(i.toString());
                                }
                                handleUpdateQuestion(index, { options: newOptions });
                              }}
                            />
                            <span>to</span>
                            <Input 
                              type="number" 
                              className="w-20" 
                              value={question.options?.[question.options.length - 1] || "5"}
                              onChange={(e) => {
                                const min = question.options?.[0] || "1";
                                const max = e.target.value;
                                const newOptions = [];
                                for (let i = parseInt(min); i <= parseInt(max); i++) {
                                  newOptions.push(i.toString());
                                }
                                handleUpdateQuestion(index, { options: newOptions });
                              }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 mt-4">
                        <Switch
                          id={`required-${question.id}`}
                          checked={question.required}
                          onCheckedChange={(checked) => handleUpdateQuestion(index, { required: checked })}
                        />
                        <Label htmlFor={`required-${question.id}`}>Required question</Label>
                      </div>
                      
                      {showConditions && (
                        <div className="mt-4 p-3 border rounded-md">
                          <Label className="mb-2 block">Conditional Logic</Label>
                          {question.condition ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">Show if question</span>
                                <Select
                                  value={question.condition.dependsOn}
                                  onValueChange={(value) => {
                                    handleAddCondition(index, value, question.condition?.showIf || "");
                                  }}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select question" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {questions.slice(0, index).map((q) => (
                                      <SelectItem key={q.id} value={q.id}>
                                        {q.prompt.substring(0, 20)}{q.prompt.length > 20 ? '...' : ''}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <span className="text-sm">answer is</span>
                                <Input
                                  value={question.condition.showIf}
                                  onChange={(e) => {
                                    handleAddCondition(index, question.condition?.dependsOn || "", e.target.value);
                                  }}
                                  className="w-[180px]"
                                  placeholder="Answer value"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveCondition(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (index > 0) {
                                  handleAddCondition(index, questions[0].id, "");
                                } else {
                                  toast({
                                    title: "Cannot add condition",
                                    description: "This is the first question in the survey",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              disabled={index === 0}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Condition
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Render survey preview
  const renderSurveyPreview = () => {
    if (!selectedSurvey) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Preview: {selectedSurvey.title}</h2>
          <Button variant="outline" size="sm" onClick={() => setActiveView("build")}>
            Back to Editor
          </Button>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{selectedSurvey.title}</CardTitle>
            <CardDescription>{selectedSurvey.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, index) => {
              // Check if this question should be shown based on conditions
              const shouldShow = !question.condition || true; // In a real app, evaluate condition here
              
              if (!shouldShow) return null;
              
              return (
                <div key={question.id} className="space-y-2">
                  <Label className="text-base font-medium">
                    {question.prompt}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  
                  {question.type === "text" && (
                    <Textarea placeholder="Your answer" />
                  )}
                  
                  {question.type === "multiple_choice" && (
                    <RadioGroup>
                      {question.options?.map((option, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${i}`} />
                          <Label htmlFor={`${question.id}-${i}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  
                  {question.type === "true_false" && (
                    <RadioGroup>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id={`${question.id}-true`} />
                        <Label htmlFor={`${question.id}-true`}>True</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id={`${question.id}-false`} />
                        <Label htmlFor={`${question.id}-false`}>False</Label>
                      </div>
                    </RadioGroup>
                  )}
                  
                  {question.type === "rating" && (
                    <div className="py-4">
                      <Slider 
                        defaultValue={[3]} 
                        max={5} 
                        min={1} 
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-2">
                        {question.options?.map((value) => (
                          <span key={value} className="text-sm">{value}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
          <CardFooter>
            <Button className="w-full">Submit Survey</Button>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  // Render survey results
  const renderSurveyResults = () => {
    if (!selectedSurvey) return null;
    
    if (isLoadingResults) {
      return (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      );
    }
    
    if (surveyResults.length === 0) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Results: {selectedSurvey.title}</h2>
            <Button variant="outline" size="sm" onClick={() => setActiveView("build")}>
              Back to Editor
            </Button>
          </div>
          
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No results available for this survey yet.</p>
          </div>
        </div>
      );
    }
    
    // Group results by question
    const resultsByQuestion = new Map<string, SurveyResult[]>();
    questions.forEach(question => {
      resultsByQuestion.set(
        question.id, 
        surveyResults.filter(result => result.questionId === question.id)
      );
    });
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Results: {selectedSurvey.title}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportResults}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveView("build")}>
              Back to Editor
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6">
          {questions.map(question => {
            const results = resultsByQuestion.get(question.id) || [];
            const totalResponses = results.length;
            
            if (totalResponses === 0) return null;
            
            return (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{question.prompt}</CardTitle>
                  <CardDescription>{totalResponses} responses</CardDescription>
                </CardHeader>
                <CardContent>
                  {question.type === "multiple_choice" && (
                    <div className="space-y-4">
                      {getChartData(question.id).map(data => (
                        <div key={data.label} className="space-y-1">
                          <div className="flex justify-between">
                            <span>{data.label}</span>
                            <span>{data.value} responses</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full transition-all"
                              style={{ width: `${(data.value / totalResponses) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === "rating" && (
                    <div className="space-y-4">
                      {getChartData(question.id).map(data => (
                        <div key={data.label} className="space-y-1">
                          <div className="flex justify-between">
                            <span>Rating: {data.label}</span>
                            <span>{data.value} responses</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full transition-all"
                              style={{ width: `${(data.value / totalResponses) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === "text" && (
                    <div className="space-y-2">
                      {results.map((result, i) => (
                        <Card key={i} className="p-3">
                          <p className="text-sm">{result.response as string}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-2">Survey Builder</h1>
      <p className="text-muted-foreground mb-6">Create and deploy customized surveys for feedback and assessments</p>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel - Survey List */}
        <div className="lg:w-1/3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="build">My Surveys</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>
            
            <TabsContent value="build" className="mt-0">
              <div className="mb-4 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search surveys..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)]">
                {renderSurveyList()}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="create" className="mt-0">
              <form onSubmit={handleCreateSurvey} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Survey Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter survey title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose of this survey"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    disabled={isCreating}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Template (Optional)</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {templates.map(template => (
                      <Card 
                        key={template.id}
                        className={`cursor-pointer hover:bg-muted/50 ${selectedTemplate === template.id ? 'border-primary' : ''}`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">{template.name}</CardTitle>
                          <CardDescription className="text-xs">{template.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button type="submit" disabled={isCreating} className="w-full">
                    {isCreating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>Create Survey</>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right panel - Survey Builder/Preview/Results */}
        <div className="lg:w-2/3">
          <Card className="h-[calc(100vh-200px)] overflow-auto">
            <CardContent className="p-6">
              {activeView === "build" && renderQuestionEditor()}
              {activeView === "preview" && renderSurveyPreview()}
              {activeView === "results" && renderSurveyResults()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
