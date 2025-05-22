"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Module, LearningObjective, Skill, LearningObject } from "@/store/courseWizardStore"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Tag,
  LayoutDashboard,
  CheckCircle,
  Loader2,
} from "lucide-react"

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
  const [publishComplete, setPublishComplete] = useState(false)

  const handlePublish = async () => {
    setIsPublishing(true)

    try {
      await onPublish()
      setPublishComplete(true)
    } catch (error) {
      console.error("Publish error:", error)
    } finally {
      setIsPublishing(false)
    }
  }

  // Calculate completion status
  const hasTitle = !!courseTitle
  const hasSummary = !!courseSummary
  const hasModules = modules.length > 0
  const hasObjectives = learningObjectives.length > 0
  const hasSkills = skills.length > 0
  const hasLearningObjects = learningObjects.length > 0

  // Check if each module has at least one learning object
  const modulesWithContent = new Set(learningObjects.map((obj) => obj.moduleId))
  const allModulesHaveContent = modules.every((module) => modulesWithContent.has(module.id))

  // Overall completion status
  const isComplete =
    hasTitle && hasSummary && hasModules && hasObjectives && hasSkills && hasLearningObjects && allModulesHaveContent

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Review & Publish</h2>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="bg-[#582873] hover:bg-[#582873]/90"
                disabled={!isComplete || isPublishing || publishComplete}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : publishComplete ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Published
                  </>
                ) : (
                  "Publish Course"
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will publish your course and make it available to learners. You can still make edits after
                  publishing.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handlePublish} className="bg-[#582873] hover:bg-[#582873]/90">
                  Publish
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completion Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Course Title</span>
                {hasTitle ? (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Course Summary</span>
                {hasSummary ? (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Modules</span>
                {hasModules ? (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {modules.length} Modules
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Learning Objectives</span>
                {hasObjectives ? (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {learningObjectives.length} Objectives
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Skills</span>
                {hasSkills ? (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {skills.length} Skills
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Learning Content</span>
                {hasLearningObjects ? (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {learningObjects.length} Items
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">All Modules Have Content</span>
                {allModulesHaveContent ? (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Incomplete
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              Course Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Title</h3>
                <p className="text-muted-foreground">{courseTitle || "No title provided"}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-1">Summary</h3>
                <p className="text-muted-foreground">{courseSummary || "No summary provided"}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-1">Modules ({modules.length})</h3>
                {modules.length > 0 ? (
                  <ul className="space-y-2">
                    {modules.map((module, index) => (
                      <li key={module.id} className="text-sm">
                        <span className="font-medium">Module {index + 1}:</span>{" "}
                        <span className="text-muted-foreground">{module.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No modules defined</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-primary" />
              Learning Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Learning Objectives ({learningObjectives.length})</h3>
                {learningObjectives.length > 0 ? (
                  <ul className="space-y-2">
                    {learningObjectives.map((objective, index) => (
                      <li key={objective.id} className="text-sm flex">
                        <span className="font-medium mr-2">{index + 1}.</span>
                        <span className="text-muted-foreground">{objective.description}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No learning objectives defined</p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-1">Skills ({skills.length})</h3>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill.id} variant="outline" className="bg-primary/10 text-primary">
                        <Tag className="h-3 w-3 mr-1" />
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No skills defined</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <LayoutDashboard className="h-5 w-5 mr-2 text-primary" />
              Learning Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            {learningObjects.length > 0 ? (
              <div className="space-y-4">
                {modules.map((module) => {
                  const moduleObjects = learningObjects
                    .filter((obj) => obj.moduleId === module.id)
                    .sort((a, b) => a.position - b.position)

                  if (moduleObjects.length === 0) return null

                  return (
                    <div key={module.id}>
                      <h3 className="text-sm font-medium mb-2">{module.title}</h3>
                      <ul className="space-y-1 pl-4">
                        {moduleObjects.map((object, index) => (
                          <li key={object.id} className="text-sm flex items-center">
                            <span className="font-medium mr-2">{index + 1}.</span>
                            <span className="text-muted-foreground capitalize">
                              {object.type}: {object.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Separator className="mt-4" />
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No learning content defined</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
