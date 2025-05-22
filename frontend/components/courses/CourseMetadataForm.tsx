"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HelpCircle,
  BookOpen,
  GraduationCap,
  BarChart3,
} from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { ComprehensivenessLevel, CourseLength, SkillLevel } from "@/store/courseWizardStore"

// Define the validation schema
const formSchema = z.object({
  customPrompt: z.string().min(10, {
    message: "Course instructions must be at least 10 characters.",
  }),
  comprehensivenessLevel: z.enum(["brief", "balanced", "comprehensive"], {
    required_error: "Please select a comprehensiveness level.",
  }),
  courseLength: z.enum(["short", "medium", "long"], {
    required_error: "Please select a course length.",
  }),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select a skill level.",
  }),
})

export type CourseMetadataFormValues = z.infer<typeof formSchema>

interface CourseMetadataFormProps {
  defaultValues: {
    customPrompt: string
    comprehensivenessLevel: ComprehensivenessLevel
    courseLength: CourseLength
    skillLevel: SkillLevel
  }
  onSubmit: (values: CourseMetadataFormValues) => void
  onChange?: (values: Partial<CourseMetadataFormValues>) => void
}

export function CourseMetadataForm({
  defaultValues,
  onSubmit,
  onChange,
}: CourseMetadataFormProps) {
  const form = useForm<CourseMetadataFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  })

  // This will call onChange whenever any field changes
  const handleFieldChange = (field: keyof CourseMetadataFormValues, value: any) => {
    if (onChange) {
      form.setValue(field, value)
      const formValues = form.getValues()
      onChange({ [field]: value })
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          Course Generation Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            <FormField
              control={form.control}
              name="customPrompt"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Course Generation Instructions</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            Describe exactly what you want this course to cover. Include specific topics,
                            technologies, methodologies, or approaches you want to include.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe exactly what you want this course to cover..."
                      className="min-h-[120px]"
                      onChange={(e) => {
                        field.onChange(e)
                        handleFieldChange("customPrompt", e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="comprehensivenessLevel"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Comprehensiveness Level</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Controls how detailed the generated course content will be.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value: ComprehensivenessLevel) => {
                          field.onChange(value)
                          handleFieldChange("comprehensivenessLevel", value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brief">Brief (overview-focused)</SelectItem>
                          <SelectItem value="balanced">Balanced (recommended)</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive (deep-dive)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courseLength"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Desired Course Length</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Controls approximately how many units the course will contain.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value: CourseLength) => {
                          field.onChange(value)
                          handleFieldChange("courseLength", value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short (1–3 units)</SelectItem>
                          <SelectItem value="medium">Medium (4–6 units)</SelectItem>
                          <SelectItem value="long">Long (7+ units)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skillLevel"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Skill Level</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Target audience expertise level for the course content.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value: SkillLevel) => {
                          field.onChange(value)
                          handleFieldChange("skillLevel", value)
                        }}
                        className="flex justify-between space-x-2"
                      >
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="beginner" id="beginner" />
                          </FormControl>
                          <FormLabel htmlFor="beginner" className="font-normal cursor-pointer">
                            Beginner
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="intermediate" id="intermediate" />
                          </FormControl>
                          <FormLabel htmlFor="intermediate" className="font-normal cursor-pointer">
                            Intermediate
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="advanced" id="advanced" />
                          </FormControl>
                          <FormLabel htmlFor="advanced" className="font-normal cursor-pointer">
                            Advanced
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
