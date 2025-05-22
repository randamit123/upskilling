"use client"

import { useState, useRef, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import type { UploadedFile } from "@/store/courseWizardStore"
import { v4 as uuidv4 } from "uuid"
import { File, X, Upload, FileText, FileImage, FileArchive, FilePlus } from "lucide-react"
import { RadialProgress } from "./ui/radial-progress"

interface FileUploaderProps {
  onFilesUploaded: (files: UploadedFile[]) => void
  maxFiles?: number
  acceptedFileTypes?: string[]
}

export function FileUploader({
  onFilesUploaded,
  maxFiles = 10,
  acceptedFileTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/markdown", "text/plain"],
}: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({})
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(
    async (acceptedFiles: File[]) => {
      if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
        toast({
          title: "Too many files",
          description: `You can only upload a maximum of ${maxFiles} files.`,
          variant: "destructive",
        })
        return
      }

      setUploading(true)

      // Simulate file upload with progress
      const newFiles: UploadedFile[] = []
      const newProgress: Record<string, number> = { ...fileProgress }

      for (const file of acceptedFiles) {
        const fileId = uuidv4()
        newProgress[fileId] = 0
        setFileProgress(newProgress)

        // Simulate upload progress
        const simulateProgress = () => {
          return new Promise<void>((resolve) => {
            let progress = 0
            const interval = setInterval(() => {
              progress += Math.random() * 10
              if (progress > 100) progress = 100

              setFileProgress((prev) => ({
                ...prev,
                [fileId]: progress,
              }))

              if (progress === 100) {
                clearInterval(interval)
                resolve()
              }
            }, 200)
          })
        }

        await simulateProgress()

        // Create uploaded file object
        const uploadedFile: UploadedFile = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
        }

        newFiles.push(uploadedFile)
      }

      setUploadedFiles((prev) => [...prev, ...newFiles])
      onFilesUploaded(newFiles)
      setUploading(false)
    },
    [uploadedFiles, maxFiles, fileProgress, onFilesUploaded],
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      handleFileUpload(acceptedFiles)
      setIsDragActive(false)
    },
    [handleFileUpload],
  )

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
      'text/plain': ['.txt']
    },
    maxFiles,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  })

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
    // Note: In a real app, you would also need to notify the parent component
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileText className="h-6 w-6 text-red-500" />
    if (fileType.includes("image")) return <FileImage className="h-6 w-6 text-blue-500" />
    if (fileType.includes("zip") || fileType.includes("archive"))
      return <FileArchive className="h-6 w-6 text-yellow-500" />
    if (fileType.includes("word") || fileType.includes("document"))
      return <FileText className="h-6 w-6 text-blue-500" />
    return <File className="h-6 w-6 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive ? "border-primary bg-primary/5 animate-pulse" : "border-muted-foreground/20"}
          ${isDragReject ? "border-destructive bg-destructive/5" : ""}
          hover:border-primary/60 hover:bg-primary/5
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Drag & drop files here</h3>
            <p className="text-sm text-muted-foreground">
              or <span className="text-primary font-medium">browse</span> to upload
            </p>
          </div>
          <div className="text-xs text-muted-foreground">Accepted file types: {acceptedFileTypes.join(", ")}</div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="overflow-hidden">
                <CardContent className="p-4 flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {fileProgress[file.id] < 100 ? (
                      <RadialProgress progress={fileProgress[file.id] || 0} />
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="truncate pr-2">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {uploadedFiles.length < maxFiles && (
              <Card
                className="overflow-hidden border-dashed cursor-pointer hover:border-primary/60 hover:bg-primary/5"
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="p-4 flex items-center justify-center h-full">
                  <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                    <FilePlus className="h-6 w-6" />
                    <span className="text-sm">Add more files</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
