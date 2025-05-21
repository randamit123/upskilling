"use client"

import { CourseWizard } from "@/components/courses/CourseWizard"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateCoursePage() {
  const router = useRouter()

  return (
    <>
      <PageHeader
        title="Create Course"
        description="Design a comprehensive learning experience with our AI-assisted course builder"
        actions={
          <Button variant="outline" onClick={() => router.push("/courses")}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        }
      />
      
      <CourseWizard />
    </>
  )
}
