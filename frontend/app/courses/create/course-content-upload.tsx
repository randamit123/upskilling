"use client"

import { useState } from "react"
import { FileDropZone } from "@/components/global/file-drop-zone"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useMockLatency } from "@/lib/hooks/use-mock-latency"
import { LoaderSpinner } from "@/components/global/loader-spinner"

interface CourseContentUploadProps {
  courseData: any
  updateCourseData: (data: any) => void
}

export function CourseContentUpload({ courseData, updateCourseData }: CourseContentUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const { isLoading, simulateRequest } = useMockLatency()

  const handleFilesAdded = async (newFiles: File[]) => {
    setFiles(newFiles)

    if (newFiles.length > 0) {
      // Simulate processing the files
      await simulateRequest(async () => {
        // In a real app, we would process the files here
        // For now, we'll just update the course data with some dummy content
        const dummyContent =
          "# Course Content\n\nThis is automatically extracted content from the uploaded files.\n\n## Section 1\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.\n\n## Section 2\n\nPellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante."

        updateCourseData({
          content: dummyContent,
        })
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Course Details</h2>
        <p className="text-sm text-muted-foreground">Enter the basic information about your course</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Course Title</Label>
          <Input
            id="title"
            placeholder="Enter course title"
            value={courseData.title}
            onChange={(e) => updateCourseData({ title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input id="author" placeholder="Enter author name" defaultValue="Your Name" disabled />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Course Description</Label>
        <Textarea
          id="description"
          placeholder="Enter course description"
          rows={3}
          value={courseData.description}
          onChange={(e) => updateCourseData({ description: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-md font-medium">Content Upload</h3>
          <p className="text-sm text-muted-foreground">
            Upload your course content (Markdown, DOCX, PDF, or PowerPoint)
          </p>
        </div>

        <FileDropZone
          onFilesAdded={handleFilesAdded}
          accept={{
            "text/markdown": [".md"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
          }}
          disabled={isLoading}
        />

        {isLoading && (
          <div className="flex flex-col items-center justify-center p-4">
            <LoaderSpinner />
            <p className="mt-2 text-sm text-muted-foreground">Processing your content...</p>
          </div>
        )}

        {courseData.content && !isLoading && (
          <div className="rounded-md border p-4">
            <h3 className="mb-2 text-sm font-medium">Extracted Content Preview:</h3>
            <div className="max-h-60 overflow-y-auto rounded bg-muted p-2">
              <pre className="text-xs">{courseData.content.substring(0, 500)}...</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
