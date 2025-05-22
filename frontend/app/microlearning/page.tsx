"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Search, Plus, FileUp, Edit, Trash2, Play, Pause, X, Check, Upload, FileText, File, FileImage } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";

// Mock API Service
import MockApiService, { MicroModule, Quiz } from "@/services/mockApiService";

export default function MicrolearningPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for microlearning modules
  const [modules, setModules] = useState<MicroModule[]>([]);
  const [filteredModules, setFilteredModules] = useState<MicroModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<MicroModule | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("modules");

  // State for module creation
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [templates, setTemplates] = useState<{id: string; name: string; description: string}[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  
  // State for module editing
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Load modules on mount
  useEffect(() => {
    fetchModules();
    fetchTemplates();
  }, []);

  // Filter modules when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredModules(modules);
      return;
    }
    
    handleSearch();
  }, [searchQuery]);

  // Fetch all modules
  const fetchModules = async () => {
    setIsLoading(true);
    try {
      // STUBBED API CALL: Replace with real endpoint when backend is ready
      const data = await MockApiService.microlearning.getAllModules();
      setModules(data);
      setFilteredModules(data);
    } catch (error) {
      toast({
        title: "Error fetching modules",
        description: "Failed to load microlearning modules",
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
      const data = await MockApiService.microlearning.getTemplates();
      setTemplates(data);
    } catch (error) {
      toast({
        title: "Error fetching templates",
        description: "Failed to load microlearning templates",
        variant: "destructive",
      });
    }
  };

  // Handle module generation
  const handleGenerateModule = async (e: FormEvent) => {
    e.preventDefault();
    
    if (prompt.trim() === "") {
      toast({
        title: "Empty prompt",
        description: "Please provide details about the module you want to create",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      // STUBBED API CALL: Replace with real endpoint when backend is ready
      const result = await MockApiService.microlearning.generateModule(prompt, uploadedFiles);
      
      // Add new module to the list
      setModules(prev => [...result.modules, ...prev]);
      setFilteredModules(prev => [...result.modules, ...prev]);
      
      // Clear form
      setPrompt("");
      setUploadedFiles([]);
      setActiveTab("modules");
      
      toast({
        title: "Module created",
        description: `Successfully generated "${result.modules[0].title}"`
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate microlearning module",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      setFilteredModules(modules);
      return;
    }
    
    setIsSearching(true);
    try {
      // STUBBED API CALL: Replace with real endpoint when backend is ready
      const results = await MockApiService.microlearning.searchModules(searchQuery);
      setFilteredModules(results);
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search microlearning modules",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle module selection for viewing
  const handleSelectModule = (module: MicroModule) => {
    setSelectedModule(module);
    
    // Initialize edit form with module data
    setEditTitle(module.title);
    setEditContent(module.content);
    setEditTags([...module.tags]);
  };

  // Handle module update
  const handleUpdateModule = async () => {
    if (!selectedModule) return;
    
    try {
      // STUBBED API CALL: Replace with real endpoint when backend is ready
      const updatedModule = await MockApiService.microlearning.updateModule(selectedModule.id, {
        title: editTitle,
        content: editContent,
        tags: editTags,
      });
      
      // Update module in state
      setModules(prev => 
        prev.map(m => m.id === updatedModule.id ? updatedModule : m)
      );
      setFilteredModules(prev => 
        prev.map(m => m.id === updatedModule.id ? updatedModule : m)
      );
      setSelectedModule(updatedModule);
      setIsEditing(false);
      
      toast({
        title: "Module updated",
        description: "Successfully updated module",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update microlearning module",
        variant: "destructive",
      });
    }
  };

  // Handle adding a tag
  const handleAddTag = () => {
    if (newTag.trim() !== "" && !editTags.includes(newTag.trim())) {
      setEditTags(prev => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tag: string) => {
    setEditTags(prev => prev.filter(t => t !== tag));
  };

  // File upload icon mapping
  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'ppt':
      case 'pptx':
        return <File className="h-4 w-4" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileImage className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Render module list
  const renderModuleList = () => {
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
              <CardFooter>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredModules.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No modules found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setActiveTab("create")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create new module
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredModules.map(module => (
          <Card 
            key={module.id} 
            className={`cursor-pointer hover:bg-muted/50 ${selectedModule?.id === module.id ? 'border-primary' : ''}`}
            onClick={() => handleSelectModule(module)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{module.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{module.duration}</span>
                <span>•</span>
                <span>{new Date(module.updatedAt).toLocaleDateString()}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-sm">{module.content}</p>
            </CardContent>
            <CardFooter>
              <div className="flex flex-wrap gap-2">
                {module.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  // Render module viewer
  const renderModuleViewer = () => {
    if (!selectedModule) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Select a module to view</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {isEditing ? (
          // Edit mode
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="Add new tag"
                  onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                />
                <Button size="sm" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateModule}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          // View mode
          <>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{selectedModule.title}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span>{selectedModule.duration}</span>
                  <span>•</span>
                  <span>Updated {new Date(selectedModule.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedModule.tags.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
            
            {selectedModule.mediaUrl && (
              <div className="rounded-md overflow-hidden aspect-video">
                <iframe
                  src={selectedModule.mediaUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            
            <div className="prose dark:prose-invert max-w-none">
              <p>{selectedModule.content}</p>
            </div>
            
            {selectedModule.quizzes && selectedModule.quizzes.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Knowledge Check</h3>
                <Accordion type="single" collapsible className="w-full">
                  {selectedModule.quizzes.map((quiz, index) => (
                    <AccordionItem key={quiz.id} value={quiz.id}>
                      <AccordionTrigger>
                        <span className="text-left">
                          {index + 1}. {quiz.prompt}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        {renderQuizContent(quiz)}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Render quiz content based on type
  const renderQuizContent = (quiz: Quiz) => {
    switch (quiz.type) {
      case 'true_false':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                True
              </Button>
              <Button variant="outline" size="sm">
                False
              </Button>
            </div>
            <div className="p-3 bg-muted rounded-md mt-4">
              <p className="text-sm font-medium">Answer: {quiz.correctAnswer === 'true' ? 'True' : 'False'}</p>
            </div>
          </div>
        );
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {quiz.options?.map(option => (
              <div key={option} className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="justify-start w-full">
                  {option}
                </Button>
                {option === quiz.correctAnswer && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
            ))}
          </div>
        );
      default:
        return <p>Interactive quiz content</p>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-2">Microlearning</h1>
      <p className="text-muted-foreground mb-6">Create bite-sized learning modules for focused skill development</p>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel - Module List */}
        <div className="lg:w-1/3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="modules">Browse Modules</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>
            
            <TabsContent value="modules" className="mt-0">
              <div className="mb-4 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search modules..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)]">
                {renderModuleList()}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="create" className="mt-0">
              <form onSubmit={handleGenerateModule} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">What would you like to create?</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the module content, learning objectives, and target audience..."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={5}
                    disabled={isGenerating}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Template (Optional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map(template => (
                      <Card 
                        key={template.id}
                        className={`cursor-pointer hover:bg-muted/50 ${selectedTemplate === template.id ? 'border-primary' : ''}`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">{template.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Upload Content (Optional)</Label>
                  <div className="grid gap-2">
                    <div className="flex flex-wrap gap-2">
                      {uploadedFiles.map((file, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {getFileIcon(file)}
                          {file.name}
                          <button 
                            onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      multiple
                      accept=".pdf,.docx,.pptx,.txt,.jpg,.png,.mp4"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isGenerating}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button type="submit" disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>Generate Module</>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right panel - Module Viewer */}
        <div className="lg:w-2/3">
          <Card className="h-[calc(100vh-200px)] overflow-auto">
            <CardContent className="p-6">
              {renderModuleViewer()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
