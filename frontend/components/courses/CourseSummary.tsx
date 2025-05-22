"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  BookOpen,
  GraduationCap,
  Tag,
  BarChart3,
  Settings,
  Sparkles,
  Loader2,
} from "lucide-react"
import type {
  Module,
  LearningObjective,
  Skill,
  ComprehensivenessLevel,
  CourseLength,
  SkillLevel,
} from "@/store/courseWizardStore"

interface CourseSummaryProps {
  courseTitle: string
  courseSummary: string
  customPrompt: string
  comprehensivenessLevel: ComprehensivenessLevel
  courseLength: CourseLength
  skillLevel: SkillLevel
  modules: Module[]
  learningObjectives: LearningObjective[]
  skills: Skill[]
  isLoading: boolean
  onGenerateCourse: () => void
}

export function CourseSummary({
  courseTitle,
  courseSummary,
  customPrompt,
  comprehensivenessLevel,
  courseLength,
  skillLevel,
  modules,
  learningObjectives,
  skills,
  isLoading,
  onGenerateCourse,
}: CourseSummaryProps) {
  // Helper function to format level labels
  const getComprehensivenessLabel = (level: ComprehensivenessLevel) => {
    switch (level) {
      case "brief":
        return "Brief (overview-focused)"
      case "balanced":
        return "Balanced (recommended)"
      case "comprehensive":
        return "Comprehensive (deep-dive)"
      default:
        return "Balanced (recommended)"
    }
  }

  const getCourseLengthLabel = (length: CourseLength) => {
    switch (length) {
      case "short":
        return "Short (1–3 units)"
      case "medium":
        return "Medium (4–6 units)"
      case "long":
        return "Long (7+ units)"
      default:
        return "Medium (4–6 units)"
    }
  }

  const getSkillLevelLabel = (level: SkillLevel) => {
    switch (level) {
      case "beginner":
        return "Beginner"
      case "intermediate":
        return "Intermediate"
      case "advanced":
        return "Advanced"
      default:
        return "Intermediate"
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium">Generating Your Course</h3>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          We're analyzing your content and generating a comprehensive course based on your requirements...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Course Summary</h2>
        <p className="text-muted-foreground">
          Review your course information below before generating the complete course.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-primary" />
              Learning Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary" />
              Course Generation Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="text-sm font-medium mb-2">Comprehensiveness Level</h3>
                <Badge variant="secondary" className="text-xs">
                  {getComprehensivenessLabel(comprehensivenessLevel)}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Course Length</h3>
                <Badge variant="secondary" className="text-xs">
                  {getCourseLengthLabel(courseLength)}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Skill Level</h3>
                <Badge variant="secondary" className="text-xs">
                  {getSkillLevelLabel(skillLevel)}
                </Badge>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Course Generation Instructions</h3>
              <div className="border rounded-md p-3 bg-muted/30">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{customPrompt || "No instructions provided"}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 flex justify-end pt-4 pb-4">
            <Button 
              onClick={onGenerateCourse}
              className="bg-[#582873] hover:bg-[#582873]/90"
              disabled={isLoading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Course
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
