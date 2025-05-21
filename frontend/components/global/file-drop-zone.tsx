"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, FileText, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileDropZoneProps {
  onFilesAdded: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
  accept?: Record<string, string[]>
  className?: string
  disabled?: boolean
}

export function FileDropZone({
  onFilesAdded,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept,
  className,
  disabled = false,
}: FileDropZoneProps) {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles)
      setFiles(newFiles)
      onFilesAdded(newFiles)
    },
    [files, maxFiles, onFilesAdded],
  )

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)
    onFilesAdded(newFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
    disabled,
  })

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "pointer-events-none opacity-60",
          className,
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
          <p className="mb-1 text-sm font-medium">{isDragActive ? "Drop the files here" : "Drag & drop files here"}</p>
          <p className="text-xs text-muted-foreground">
            or <span className="text-primary">browse files</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Max {maxFiles} files, up to {Math.round(maxSize / 1024 / 1024)}MB each
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md border p-2">
              <div className="flex items-center space-x-2">
                {file.type.includes("image") ? (
                  <FileText className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <File className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeFile(index)} className="h-7 w-7">
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
