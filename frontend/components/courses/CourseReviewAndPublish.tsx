"use client"

import { useState } from "react"
import { Check, FileText, ArrowRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Module, LearningObjective, Skill, LearningObject } from "@/store/courseWizardStore"

interface CourseReviewAndPublishProps {
  courseTitle: string
  courseSummary: string
  modules: Module[]
  learningObjectives: LearningObjective[]
  skills: Skill[]
  learningObjects: LearningObject[]
  onPublish: () => void
}

export function CourseReviewAndPublish({
  courseTitle,
  courseSummary,
  modules,
  learningObjectives,
  skills,
  learningObjects,
  onPublish,
}: CourseReviewAndPublishProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  
  const handlePublish = async () => {
    setIsPublishing(true)
    
    try {
      // Simulate API call to publish course
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Call the onPublish callback
      onPublish()
      
      setIsPublished(true)
      
      toast({
        title: "Course published successfully",
        description: "Your course has been published to the Upskilling platform.",
      })
    } catch (error) {
      toast({
        title: "Failed to publish course",
        description: "There was an error publishing your course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }
  
  const getLearningObjectTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "Video"
      case "quiz":
        return "Quiz"
      case "reading":
        return "Reading"
      case "reflection":
        return "Reflection"
      case "scenario":
        return "Scenario"
      default:
        return "Content"
    }
  }
  
  // Count learning objects by type
  const countByType = learningObjects.reduce((acc, obj) => {
    acc[obj.type] = (acc[obj.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Course Review</CardTitle>
          <CardDescription>
            Review your course details before publishing to the Upskilling platform.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Course Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Title</p>
                <p className="font-medium">{courseTitle || "Untitled Course"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Modules</p>
                <p className="font-medium">{modules.length}</p>
              </div>
              
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">Summary</p>
                <p className="text-sm">{courseSummary || "No summary provided."}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Learning Objectives</h3>
            {learningObjectives.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No learning objectives defined.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {learningObjectives.map((objective) => (
                  <li key={objective.id} className="text-sm">
                    {objective.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Skills</h3>
            {skills.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No skills defined.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Storyboard Structure</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(countByType).map(([type, count]) => (
                <Card key={type} className="text-center">
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getLearningObjectTypeLabel(type)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Detailed Syllabus</h3>
            <Accordion type="single" collapsible className="w-full">
              {modules.map((module, index) => (
                <AccordionItem key={module.id} value={module.id} className="border rounded-md px-2 mb-3">
                  <AccordionTrigger className="hover:no-underline py-3 px-2">
                    <div className="flex items-center text-left">
                      <span className="font-medium">{`Module ${index + 1}: ${module.title}`}</span>
                      <Badge variant="outline" className="ml-2">
                        {module.units.length} units
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent>
                    <div className="pt-2 pb-4 px-2 space-y-4">
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Units</h4>
                        
                        {module.units.map((unit, unitIndex) => (
                          <div key={unit.id} className="border rounded-md p-3">
                            <h5 className="font-medium text-sm">Unit {unitIndex + 1}: {unit.title}</h5>
                            <p className="text-xs text-muted-foreground mt-1">{unit.description}</p>
                          </div>
                        ))}
                        
                        <h4 className="text-sm font-medium">Learning Objects</h4>
                        
                        {learningObjects.filter(obj => obj.moduleId === module.id).length === 0 ? (
                          <p className="text-sm text-muted-foreground">No learning objects in this module.</p>
                        ) : (
                          <div className="space-y-2">
                            {learningObjects
                              .filter(obj => obj.moduleId === module.id)
                              .sort((a, b) => a.position - b.position)
                              .map((obj) => (
                                <div key={obj.id} className="border rounded-md p-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-xs font-medium bg-muted px-1.5 py-0.5 rounded">
                                          {getLearningObjectTypeLabel(obj.type)}
                                        </span>
                                      </div>
                                      
                                      <h5 className="font-medium text-sm">{obj.title}</h5>
                                      <p className="text-xs text-muted-foreground mt-1">{obj.description}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={handlePublish} 
            disabled={isPublishing || isPublished} 
            className="w-full"
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : isPublished ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Published
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Publish Course
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {isPublished && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium">Course Published Successfully</h3>
                <p className="text-sm text-muted-foreground">
                  Your course is now available on the Upskilling platform.
                </p>
              </div>
            </div>
            <Button>
              View Course
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
