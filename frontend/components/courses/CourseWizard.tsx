"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Stepper, StepperContent } from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { ArrowLeft, ArrowRight, Check, Upload, Clipboard, GraduationCap, LayoutDashboard, FileText } from "lucide-react"
import { FileUploader } from "./FileUploader"
import { CourseOutlineEditor } from "./CourseOutlineEditor"
import { LearningObjectivesSkillsEditor } from "./LearningObjectivesSkillsEditor"
import { StoryboardEditor } from "./StoryboardEditor"
import { CourseReviewAndPublish } from "./CourseReviewAndPublish"
import { toast } from "@/components/ui/use-toast"
import { useCourseWizardStore, UploadedFile } from "@/store/courseWizardStore"
import { uploadContent, generateCourseOutline, generateObjectivesAndSkills, saveStoryboard, publishCourse } from "@/utils/courseApi"
import { v4 as uuidv4 } from "uuid"

const steps = [
  {
    id: "content-upload",
    label: "Content Upload",
    description: "Upload SME content files",
    icon: Upload,
  },
  {
    id: "course-outline",
    label: "Course Outline",
    description: "Review the AI-generated outline",
    icon: Clipboard,
  },
  {
    id: "objectives-skills",
    label: "Objectives & Skills",
    description: "Define learning outcomes",
    icon: GraduationCap,
  },
  {
    id: "storyboard",
    label: "Storyboard Editor",
    description: "Arrange learning objects",
    icon: LayoutDashboard,
  },
  {
    id: "review-publish",
    label: "Review & Publish",
    description: "Finalize your course",
    icon: FileText,
  },
]

export function CourseWizard() {
  const router = useRouter()
  
  // Get state from Zustand store
  const {
    activeStep,
    uploadedFiles,
    courseTitle,
    courseSummary,
    modules,
    learningObjectives,
    skills,
    learningObjects,
    isGenerating,
    generationProgress,
    
    // Actions
    setActiveStep,
    addUploadedFile,
    removeUploadedFile,
    setCourseTitle,
    setCourseSummary,
    setModules,
    updateModule,
    setLearningObjectives,
    updateLearningObjective,
    addLearningObjective,
    removeLearningObjective,
    setSkills,
    addSkill,
    removeSkill,
    setLearningObjects,
    addLearningObject,
    updateLearningObject,
    removeLearningObject,
    moveLearningObject,
    setIsGenerating,
    setGenerationProgress,
    reset,
  } = useCourseWizardStore()
  
  useEffect(() => {
    // Ensure we restore from persisted storage on mount
    return () => {
      // Cleanup if needed
    }
  }, [])
  
  const handleNext = async () => {
    // Perform validations based on the current step
    if (activeStep === 0 && uploadedFiles.length === 0) {
      toast({
        title: "Upload required",
        description: "Please upload at least one file to continue.",
        variant: "destructive",
      })
      return
    }
    
    if (activeStep === 1 && !courseTitle) {
      toast({
        title: "Title required",
        description: "Please set a course title before continuing.",
        variant: "destructive",
      })
      return
    }
    
    // Process step transitions with API calls
    try {
      if (activeStep === 0) {
        // Upload content and generate course outline
        setIsGenerating(true)
        
        // Call API to upload content
        await uploadContent(uploadedFiles)
        
        // Generate course outline
        const result = await generateCourseOutline()
        
        setCourseTitle(result.title)
        setCourseSummary(result.summary)
        setModules(result.modules)
        
        setIsGenerating(false)
      } 
      else if (activeStep === 2) {
        // Generate learning objectives and skills
        setIsGenerating(true)
        
        const result = await generateObjectivesAndSkills({
          courseTitle,
          courseSummary,
          modules,
        })
        
        setLearningObjectives(result.objectives)
        setSkills(result.skills)
        
        setIsGenerating(false)
      }
      else if (activeStep === 3) {
        // Save storyboard
        await saveStoryboard({
          learningObjects,
        })
      }
      
      // Advance to next step
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1)
        window.scrollTo(0, 0)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
      window.scrollTo(0, 0)
    }
  }
  
  const handleStepClick = (step: number) => {
    // Only allow clicking on completed steps
    if (step <= activeStep) {
      setActiveStep(step)
      window.scrollTo(0, 0)
    }
  }
  
  const handlePublish = async () => {
    try {
      await publishCourse({
        courseTitle,
        courseSummary,
        modules,
        learningObjectives,
        skills,
        learningObjects,
      })
      
      // After successful publish, can reset or navigate
      setTimeout(() => {
        router.push("/courses")
      }, 3000)
    } catch (error) {
      toast({
        title: "Publish error",
        description: "Failed to publish the course. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  const handleFilesUploaded = (files: UploadedFile[]) => {
    // Clear existing files and add new ones
    files.forEach((file: UploadedFile) => {
      addUploadedFile(file)
    })
  }
  
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <FileUploader
            onFilesUploaded={handleFilesUploaded}
            maxFiles={10}
            acceptedFileTypes={[".pdf", ".docx", ".md", ".txt"]}
          />
        )
      case 1:
        return (
          <CourseOutlineEditor
            courseTitle={courseTitle}
            courseSummary={courseSummary}
            modules={modules}
            onCourseTitleChange={setCourseTitle}
            onCourseSummaryChange={setCourseSummary}
            onModulesChange={setModules}
            isLoading={isGenerating}
          />
        )
      case 2:
        return (
          <LearningObjectivesSkillsEditor
            learningObjectives={learningObjectives}
            skills={skills}
            onLearningObjectivesChange={setLearningObjectives}
            onSkillsChange={setSkills}
            isLoading={isGenerating}
          />
        )
      case 3:
        return (
          <StoryboardEditor
            modules={modules}
            learningObjects={learningObjects}
            onLearningObjectsChange={setLearningObjects}
            isLoading={isGenerating}
          />
        )
      case 4:
        return (
          <CourseReviewAndPublish
            courseTitle={courseTitle}
            courseSummary={courseSummary}
            modules={modules}
            learningObjectives={learningObjectives}
            skills={skills}
            learningObjects={learningObjects}
            onPublish={handlePublish}
          />
        )
      default:
        return null
    }
  }
  
  return (
    <div className="space-y-6 pb-10">
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Create Course</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">{steps[activeStep].label}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <Stepper
        steps={steps}
        activeStep={activeStep}
        onStepClick={handleStepClick}
        className="mb-8"
      />
      
      <Card>
        <CardContent className="pt-6">
          {renderStepContent()}
        </CardContent>
      </Card>
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={handlePrevious} 
          disabled={activeStep === 0 || isGenerating}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        {activeStep < steps.length - 1 ? (
          <Button 
            onClick={handleNext} 
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
