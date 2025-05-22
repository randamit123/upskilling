"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BookOpen,
  GraduationCap,
  Tag,
  PlayCircle,
  FileText,
  MessageSquare,
  Lightbulb,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react"
import type { Module, LearningObjective, Skill } from "@/store/courseWizardStore"

interface CoursePreviewProps {
  courseTitle: string
  courseSummary: string
  modules: Module[]
  learningObjectives: LearningObjective[]
  skills: Skill[]
  isLoading: boolean
  onProceed: () => void
  onRegenerate: () => void
}

export function CoursePreview({
  courseTitle,
  courseSummary,
  modules,
  learningObjectives,
  skills,
  isLoading,
  onProceed,
  onRegenerate,
}: CoursePreviewProps) {
  // Helper function to get a random lecture type icon
  const getLectureTypeIcon = (seed: number) => {
    // For demonstration - in real implementation, this would be based on actual lecture types
    const icons = [
      <PlayCircle key="video" className="h-4 w-4 text-blue-500" />,
      <FileText key="reading" className="h-4 w-4 text-amber-500" />,
      <MessageSquare key="discussion" className="h-4 w-4 text-purple-500" />,
      <Lightbulb key="activity" className="h-4 w-4 text-rose-500" />,
    ]
    return icons[seed % icons.length]
  }

  // Helper function to get lecture types
  const getLectureType = (seed: number) => {
    const types = ["Video Lecture", "Reading", "Discussion", "Activity"]
    return types[seed % types.length]
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium">Generating Course Preview</h3>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          We're creating a detailed preview of your course with all learning materials...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold flex-1">Generated Course Preview</h2>
          <Badge className="bg-primary/20 text-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Generated
          </Badge>
        </div>
        
        <p className="text-muted-foreground">
          Review the generated course content below. You can proceed to the storyboard editor or regenerate the course.
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="grid gap-6 lg:grid-cols-3 pb-4 pr-4">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Course Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Title</h3>
                  <p className="text-lg font-medium">{courseTitle}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-1">Summary</h3>
                  <p className="text-muted-foreground">{courseSummary}</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Detailed Course Content</h3>
              
              <div className="space-y-6 max-h-[600px] overflow-auto pr-4">
                {modules.map((module, moduleIndex) => (
                  <Card key={module.id} className="border-muted">
                    <CardHeader className="bg-muted/30 pb-2">
                      <CardTitle className="text-base">
                        Module {moduleIndex + 1}: {module.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Units</h4>
                        {module.units.map((unit, unitIndex) => (
                          <div key={unit.id} className="space-y-3">
                            <div className="rounded-md border p-3">
                              <h5 className="font-medium text-sm mb-1">
                                Unit {moduleIndex + 1}.{unitIndex + 1}: {unit.title}
                              </h5>
                              <p className="text-xs text-muted-foreground">{unit.description}</p>
                            </div>
                            
                            {/* Generate 2-4 random lectures per unit */}
                            <div className="pl-4 space-y-2">
                              {Array.from({ length: 2 + (moduleIndex + unitIndex) % 3 }).map((_, lectureIndex) => {
                                const seed = moduleIndex * 100 + unitIndex * 10 + lectureIndex
                                return (
                                  <div 
                                    key={`lecture-${seed}`}
                                    className="flex items-start border-l-2 border-muted pl-3 py-1"
                                  >
                                    <div className="flex-shrink-0 mt-0.5 mr-2">
                                      {getLectureTypeIcon(seed)}
                                    </div>
                                    <div>
                                      <div className="flex items-center">
                                        <span className="text-xs font-medium bg-muted px-1.5 py-0.5 rounded-sm">
                                          {getLectureType(seed)}
                                        </span>
                                      </div>
                                      <h6 className="text-sm font-medium mt-1">
                                        Lecture {moduleIndex + 1}.{unitIndex + 1}.{lectureIndex + 1}: 
                                        {unit.title} - Part {lectureIndex + 1}
                                      </h6>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {getLectureType(seed) === "Video Lecture" 
                                          ? `A comprehensive ${5 + (seed % 10)} minute video explaining ${unit.title.toLowerCase()}.`
                                          : getLectureType(seed) === "Reading" 
                                            ? `Essential reading materials covering ${unit.title.toLowerCase()} concepts.`
                                            : getLectureType(seed) === "Discussion"
                                              ? `Interactive discussion about ${unit.title.toLowerCase()} applications.`
                                              : `Hands-on activity to apply ${unit.title.toLowerCase()} knowledge.`
                                        }
                                      </p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                  Learning Outcomes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Learning Objectives</h3>
                  <ul className="space-y-2">
                    {learningObjectives.map((objective, index) => (
                      <li key={objective.id} className="text-sm flex">
                        <span className="font-medium text-primary mr-2">{index + 1}.</span>
                        <span className="text-muted-foreground">{objective.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill.id} variant="outline" className="bg-primary/10 text-primary">
                        <Tag className="h-3 w-3 mr-1" />
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Course Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Modules:</dt>
                    <dd className="text-sm font-medium">{modules.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Units:</dt>
                    <dd className="text-sm font-medium">
                      {modules.reduce((total, module) => total + module.units.length, 0)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Est. lectures:</dt>
                    <dd className="text-sm font-medium">
                      {modules.reduce((total, module, mIdx) => 
                        total + module.units.reduce((unitTotal, _, uIdx) => 
                          unitTotal + (2 + (mIdx + uIdx) % 3), 0), 0)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Est. completion time:</dt>
                    <dd className="text-sm font-medium">
                      {Math.floor(modules.length * 2.5)} hours
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  You can now proceed to the storyboard editor to customize your course content arrangement, or regenerate this course with different parameters.
                </p>
              </CardContent>
              <CardFooter className="flex gap-3 justify-between">
                <Button 
                  variant="outline" 
                  onClick={onRegenerate}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
                <Button 
                  onClick={onProceed}
                  className="flex-1 bg-[#582873] hover:bg-[#582873]/90"
                >
                  Proceed
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
