"use client"

import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/layout/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, X, PencilLine, FileText, BookOpen, ArrowRight, Layers, BarChart } from "lucide-react"
import { useUserProfileStore } from "@/store/userProfileStore"

interface SkillItem {
  name: string;
  level: number;
}

interface Course {
  id: string;
  title: string;
  status: string;
  lastUpdated: string;
}

interface ContentMetrics {
  coursesCreated: number;
  modulesDrafted: number;
  assessmentsDesigned: number;
  totalLearners: number;
}

export default function ProfilePage() {
  const { profile, addContentGoal, removeContentGoal, addTopicOfInterest, removeTopicOfInterest } = useUserProfileStore();
  const [newGoal, setNewGoal] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  
  // Sample content metrics
  const contentMetrics: ContentMetrics = {
    coursesCreated: Array.isArray(profile.createdCourses) ? profile.createdCourses.length : 0,
    modulesDrafted: Array.isArray(profile.draftCourses) ? profile.draftCourses.length : 0,
    assessmentsDesigned: 12, // Sample data
    totalLearners: 348 // Sample data
  };
  
  // Default content creation skills
  const defaultSkills: SkillItem[] = [
    { name: "Instructional Design", level: 4 },
    { name: "Assessment Creation", level: 3 },
    { name: "Learning Objectives", level: 4 },
    { name: "Microlearning", level: 3 },
  ];
  
  // Content creation skills - ensure it's an array
  const contentSkills: SkillItem[] = Array.isArray(profile.contentExpertise) 
    ? profile.contentExpertise 
    : defaultSkills;
  
  // Handler for adding a new content goal
  const handleAddGoal = () => {
    if (newGoal.trim()) {
      addContentGoal(newGoal.trim());
      setNewGoal('');
      setIsAddingGoal(false);
    }
  };
  
  // Handler for adding a new topic of interest
  const handleAddTopic = () => {
    if (newTopic.trim()) {
      addTopicOfInterest(newTopic.trim());
      setNewTopic('');
      setIsAddingTopic(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Content Creator Profile"
        text="Manage your profile, content creation skills, and expertise areas"
      />

      <div className="grid gap-6 md:grid-cols-7 lg:gap-10">
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage alt={profile.name || "User"} src={profile.avatar || ""} />
                  <AvatarFallback>{profile.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{profile.name || "User Name"}</CardTitle>
                  <CardDescription>{profile.role || "Content Creator"}</CardDescription>
                  <Badge variant="outline" className="mt-1">
                    {profile.department || "Learning & Development"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Content Creation Skills</h3>
                <div className="space-y-3">
                  {contentSkills.map((skill: SkillItem, index: number) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">{skill.level}/5</span>
                      </div>
                      <Progress value={skill.level * 20} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">Topics of Interest</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsAddingTopic(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {isAddingTopic ? (
                  <div className="flex items-center space-x-2 mb-2">
                    <Input
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="New topic..."
                      className="h-8"
                    />
                    <Button size="sm" onClick={handleAddTopic}>Add</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsAddingTopic(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(profile.topicsOfInterest) && profile.topicsOfInterest.map((topic: string, i: number) => (
                    <Badge key={i} variant="secondary" className="px-2 py-1">
                      {topic}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0"
                        onClick={() => removeTopicOfInterest(topic)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">Content Goals</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsAddingGoal(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {isAddingGoal ? (
                  <div className="flex items-center space-x-2 mb-2">
                    <Input
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="New goal..."
                      className="h-8"
                    />
                    <Button size="sm" onClick={handleAddGoal}>Add</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsAddingGoal(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
                <ScrollArea className="h-[180px] rounded-md border p-3">
                  <div className="space-y-3">
                    {Array.isArray(profile.contentGoals) && profile.contentGoals.map((goal: string, i: number) => (
                      <div key={i} className="flex items-start justify-between gap-2 rounded-md border p-2">
                        <span className="text-sm">{goal}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => removeContentGoal(goal)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4">
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analytics">
                <BarChart className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="courses">
                <BookOpen className="mr-2 h-4 w-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="content">
                <FileText className="mr-2 h-4 w-4" />
                Content
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="analytics" className="space-y-4 pt-4">
              <h2 className="text-xl font-semibold mb-4">Content Creation Analytics</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Courses Created</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{contentMetrics.coursesCreated}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      +3 in the last 30 days
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Modules Drafted</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{contentMetrics.modulesDrafted}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      +8 in the last 30 days
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Assessments Designed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{contentMetrics.assessmentsDesigned}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      +5 in the last 30 days
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Total Learners</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{contentMetrics.totalLearners}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      +42 in the last 30 days
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Content Performance</CardTitle>
                  <CardDescription>
                    Engagement metrics for your created content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Content performance chart will appear here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="courses" className="space-y-4 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Courses</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Course
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Created Courses</CardTitle>
                  <CardDescription>
                    Courses you've developed for learners
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {Array.isArray(profile.createdCourses) && profile.createdCourses.length > 0 ? (
                    <div className="divide-y">
                      {profile.createdCourses.map((course: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4">
                          <div>
                            <h3 className="font-medium">{course.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Last updated: {course.lastUpdated}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Badge>{course.status}</Badge>
                            <Button variant="ghost" size="sm" className="ml-2">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      You haven't created any courses yet
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Draft Courses</CardTitle>
                  <CardDescription>
                    Courses you're currently working on
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {Array.isArray(profile.draftCourses) && profile.draftCourses.length > 0 ? (
                    <div className="divide-y">
                      {profile.draftCourses.map((course: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4">
                          <div>
                            <h3 className="font-medium">{course.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Last updated: {course.lastUpdated}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Badge variant="outline">Draft</Badge>
                            <Button variant="ghost" size="sm" className="ml-2">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      You don't have any draft courses
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Authored Content</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Content
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Content</CardTitle>
                  <CardDescription>
                    Individual learning modules and assessments you've created
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {Array.isArray(profile.authoredContent) && profile.authoredContent.length > 0 ? (
                    <div className="divide-y">
                      {profile.authoredContent.map((content: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4">
                          <div>
                            <h3 className="font-medium">{content.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {content.type} • Created: {content.created}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Badge variant={content.published ? "default" : "outline"}>
                              {content.published ? "Published" : "Draft"}
                            </Badge>
                            <Button variant="ghost" size="sm" className="ml-2">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      You haven't authored any content yet
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Content Ideas</CardTitle>
                  <CardDescription>
                    Your saved content ideas and inspiration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-4">
                      {Array.isArray(profile.contentIdeas) && profile.contentIdeas.length > 0 ? (
                        profile.contentIdeas.map((idea: string, index: number) => (
                          <div key={index} className="rounded-md border p-3">
                            <p className="text-sm">{idea}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground">
                          No content ideas saved yet
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
