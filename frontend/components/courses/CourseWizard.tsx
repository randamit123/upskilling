"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { ArrowLeft, ArrowRight, Upload, Clipboard, GraduationCap, LayoutDashboard, FileText, CheckCircle, BookOpen, Check } from "lucide-react"
import { FileUploader } from "./FileUploader"
import { CourseOutlineEditor } from "./CourseOutlineEditor"
import { LearningObjectivesSkillsEditor } from "./LearningObjectivesSkillsEditor"
import { CourseReviewAndPublish } from "./CourseReviewAndPublish"
import { CourseMetadataForm, type CourseMetadataFormValues } from "./CourseMetadataForm"
import { CourseSummary } from "./CourseSummary"
import { InteractiveCoursePreview } from "./InteractiveCoursePreview"
import { toast } from "@/components/ui/use-toast"
import { useCourseWizardStore, type UploadedFile } from "@/store/courseWizardStore"
import {
  uploadContent,
  generateCourseOutline,
  generateObjectivesAndSkills,
  generateCourse,
  generateInteractiveElements,
  saveStoryboard,
  publishCourse,
} from "@/utils/courseApi"
import { WizardProgress } from "./ui/wizard-progress"

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
    id: "course-summary",
    label: "Review Course Summary",
    description: "Review and generate course",
    icon: FileText,
  },
  {
    id: "interactive-preview",
    label: "Interactive Course Preview",
    description: "Customize & arrange content",
    icon: LayoutDashboard,
  },
  {
    id: "review-publish",
    label: "Review & Publish",
    description: "Finalize your course",
    icon: CheckCircle,
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
    customPrompt,
    comprehensivenessLevel,
    courseLength,
    skillLevel,
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
    setCustomPrompt,
    setComprehensivenessLevel,
    setCourseLength,
    setSkillLevel,
    setModules,
    setLearningObjectives,
    setSkills,
    setLearningObjects,
    setIsGenerating,
    setGenerationProgress,
    reset,
  } = useCourseWizardStore()

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Ensure we restore from persisted storage on mount
    return () => {
      // Cleanup if needed
    }
  }, [])

  const handleNext = async () => {
    // Perform validations based on the current step
    if (activeStep === 0) {
      if (uploadedFiles.length === 0) {
        toast({
          title: "No files uploaded",
          description: "Please upload at least one file to continue.",
          variant: "destructive",
        })
        return
      }
      
      if (!customPrompt) {
        toast({
          title: "Instructions required",
          description: "Please provide course generation instructions to continue.",
          variant: "destructive",
        })
        return
      }
    }

    if (activeStep === 1 && !courseTitle) {
      toast({
        title: "Title required",
        description: "Please set a course title before continuing.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

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
      } else if (activeStep === 2) {
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
      } else if (activeStep === 3) {
        // Generate full course
        setIsGenerating(true)
        
        try {
          await generateCourse({
            courseTitle,
            courseSummary,
            customPrompt,
            comprehensivenessLevel,
            courseLength,
            skillLevel,
            modules,
            learningObjectives,
            skills
          })
        } finally {
          setIsGenerating(false)
        }
      } else if (activeStep === 5) {
        // Generate interactive elements
        setIsGenerating(true)
        
        try {
          await generateInteractiveElements({
            learningObjects
          })
        } finally {
          setIsGenerating(false)
        }
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleStepClick = (value: string) => {
    const stepIndex = steps.findIndex((step) => step.id === value)

    // Only allow clicking on completed steps
    if (stepIndex <= activeStep) {
      setActiveStep(stepIndex)
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
          <div className="space-y-6">
            <FileUploader
              onFilesUploaded={handleFilesUploaded}
              maxFiles={10}
              acceptedFileTypes={[".pdf", ".docx", ".md", ".txt"]}
            />
            
            <CourseMetadataForm
              defaultValues={{
                customPrompt,
                comprehensivenessLevel,
                courseLength,
                skillLevel
              }}
              onSubmit={() => {}}
              onChange={(values) => {
                if (values.customPrompt !== undefined) setCustomPrompt(values.customPrompt)
                if (values.comprehensivenessLevel !== undefined) setComprehensivenessLevel(values.comprehensivenessLevel)
                if (values.courseLength !== undefined) setCourseLength(values.courseLength)
                if (values.skillLevel !== undefined) setSkillLevel(values.skillLevel)
              }}
            />
          </div>
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
          <CourseSummary
            courseTitle={courseTitle}
            courseSummary={courseSummary}
            customPrompt={customPrompt}
            comprehensivenessLevel={comprehensivenessLevel}
            courseLength={courseLength}
            skillLevel={skillLevel}
            modules={modules}
            learningObjectives={learningObjectives}
            skills={skills}
            isLoading={isGenerating}
            onGenerateCourse={() => handleNext()}
          />
        )
      case 4:
        return (
          <InteractiveCoursePreview
            courseTitle={courseTitle}
            courseSummary={courseSummary}
            modules={modules}
            learningObjectives={learningObjectives}
            skills={skills}
            learningObjects={learningObjects}
            onLearningObjectsChange={setLearningObjects}
            onProceed={() => handleNext()}
            onRegenerate={() => {
              // Reset to previous step and regenerate
              setActiveStep(3)
              handleNext()
            }}
            isLoading={isGenerating}
          />
        )
      case 5:
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
    <div className="pb-24">

      <div className="max-w-5xl mx-auto">
        {/* Only show the tabs for step navigation, no extra text */}
        <Tabs value={steps[activeStep].id} onValueChange={handleStepClick} className="mb-8">
          <TabsList className="w-full p-0 h-auto bg-transparent justify-between overflow-x-auto snap-x snap-mandatory">
            {steps.map((step, index) => {
              const isCompleted = index < activeStep
              const isCurrent = index === activeStep
              const isDisabled = index > activeStep

              return (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  disabled={isDisabled}
                  className={`
                    flex-1 min-w-[120px] flex-col gap-1 py-3 px-2 snap-start
                    data-[state=active]:bg-transparent data-[state=active]:shadow-none
                    ${isDisabled ? "opacity-40" : ""}
                  `}
                >
                  <div className="relative">
                    <div
                      className={`
                      w-10 h-10 rounded-full flex items-center justify-center mx-auto
                      ${
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                      }
                    `}
                    >
                      <step.icon className="h-5 w-5" />
                      {isCompleted && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <span
                      className={`
                      mt-2 block text-xs font-medium
                      ${isCurrent ? "text-primary" : "text-muted-foreground"}
                    `}
                    >
                      {step.label}
                    </span>
                  </div>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <WizardProgress currentStep={activeStep} totalSteps={steps.length} />

          <TabsContent value={steps[activeStep].id} className="mt-6">
            <Card className="border bg-card shadow-sm rounded-lg">
              <div className="p-6">{renderStepContent()}</div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed bottom-0 left-0 right-0 py-4 px-6 bg-card/80 backdrop-blur border-t z-10">
        <div className="max-w-5xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={activeStep === 0 || isGenerating || isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {activeStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={isGenerating || isSubmitting}
              className="bg-[#582873] hover:bg-[#582873]/90"
            >
              {isGenerating || isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isGenerating ? "Generating..." : "Processing..."}
                </span>
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
    </div>
  )
}
