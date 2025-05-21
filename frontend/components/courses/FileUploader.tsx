"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { CheckCircle2, X, FileText, File, Upload, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { UploadedFile } from "@/store/courseWizardStore"
import { v4 as uuidv4 } from "uuid"

interface FileUploaderProps {
  onFilesUploaded: (files: UploadedFile[]) => void
  maxFiles?: number
  acceptedFileTypes?: string[]
  className?: string
}

export function FileUploader({
  onFilesUploaded,
  maxFiles = 10,
  acceptedFileTypes = [".pdf", ".docx", ".md", ".txt"],
  className,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      if (files.length + acceptedFiles.length > maxFiles) {
        toast({
          title: "Too many files",
          description: `You can upload a maximum of ${maxFiles} files.`,
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)

      // Simulate uploading files with progress
      const newFiles: UploadedFile[] = []
      const newProgress: Record<string, number> = {}

      for (const file of acceptedFiles) {
        const id = uuidv4()
        newProgress[id] = 0
        setUploadProgress((prev) => ({ ...prev, [id]: 0 }))

        // Simulate file upload progress
        const simulateProgress = () => {
          let progress = 0
          const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5
            if (progress > 100) progress = 100
            setUploadProgress((prev) => ({ ...prev, [id]: progress }))
            if (progress === 100) clearInterval(interval)
          }, 300)
          return interval
        }

        const interval = simulateProgress()

        // Simulate API call to upload file
        await new Promise<void>((resolve) => setTimeout(() => {
          clearInterval(interval)
          setUploadProgress((prev) => ({ ...prev, [id]: 100 }))
          
          newFiles.push({
            id,
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file), // In a real app, this would be the server URL
          })
          
          resolve()
        }, 2000))
      }

      setFiles((prevFiles) => [...prevFiles, ...newFiles])
      onFilesUploaded([...files, ...newFiles])
      setIsUploading(false)

      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${newFiles.length} file(s).`,
      })
    },
    [files, maxFiles, onFilesUploaded]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': acceptedFileTypes.includes('.pdf') ? ['.pdf'] : [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 
        acceptedFileTypes.includes('.docx') ? ['.docx'] : [],
      'text/markdown': acceptedFileTypes.includes('.md') ? ['.md'] : [],
      'text/plain': acceptedFileTypes.includes('.txt') ? ['.txt'] : [],
    },
    maxFiles,
    disabled: isUploading,
  })

  const handleRemoveFile = (id: string) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((file) => file.id !== id)
      onFilesUploaded(updatedFiles)
      return updatedFiles
    })
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />
    if (fileType.includes("word") || fileType.includes("docx")) return <FileText className="h-5 w-5 text-blue-500" />
    if (fileType.includes("markdown") || fileType.includes("md")) return <FileText className="h-5 w-5 text-purple-500" />
    return <File className="h-5 w-5 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} aria-label="File uploader" />
        <Upload className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-1">Drag & drop files here</p>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse (max {maxFiles} files)
        </p>
        <p className="text-xs text-muted-foreground">
          Supported formats: {acceptedFileTypes.join(", ")}
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Uploaded Files ({files.length})</h3>
          <div className="space-y-3">
            {files.map((file) => (
              <Card key={file.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="font-medium truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadProgress[file.id] < 100 ? (
                        <div className="flex items-center gap-2 w-[100px]">
                          <Progress value={uploadProgress[file.id]} className="h-2" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{uploadProgress[file.id]}%</span>
                        </div>
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveFile(file.id)}
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isUploading && files.length === 0 && (
        <div className="mt-4 flex items-center justify-center">
          <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
          <p className="text-sm text-muted-foreground">Uploading files...</p>
        </div>
      )}
    </div>
  )
}
