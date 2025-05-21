"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Video, ImageIcon, FileQuestion, Presentation, Grip, Plus, Pencil, Trash2 } from "lucide-react"
import { generateId } from "@/lib/utils"

interface CourseStoryboardProps {
  courseData: any
  updateCourseData: (data: any) => void
}

interface LessonBlock {
  id: string
  type: "text" | "video" | "image" | "quiz" | "presentation"
  title: string
  content: string
  duration?: number
}

export function CourseStoryboard({ courseData, updateCourseData }: CourseStoryboardProps) {
  const [storyboard, setStoryboard] = useState<LessonBlock[]>([])
  const [editingBlock, setEditingBlock] = useState<LessonBlock | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (courseData.storyboard && courseData.storyboard.length) {
      setStoryboard(courseData.storyboard)
    } else if (courseData.outline && courseData.outline.length) {
      // Initialize storyboard from outline if it doesn't exist
      const initialStoryboard = courseData.outline.map((section: any) => ({
        id: generateId(),
        type: "text",
        title: section.title,
        content: section.content,
        duration: 10,
      }))
      setStoryboard(initialStoryboard)
      updateCourseData({ storyboard: initialStoryboard })
    }
  }, [courseData.outline])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(storyboard)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setStoryboard(items)
    updateCourseData({ storyboard: items })
  }

  const addBlock = (type: LessonBlock["type"]) => {
    const newBlock: LessonBlock = {
      id: generateId(),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Block`,
      content: "",
      duration: 5,
    }

    setEditingBlock(newBlock)
    setIsDialogOpen(true)
  }

  const editBlock = (block: LessonBlock) => {
    setEditingBlock({ ...block })
    setIsDialogOpen(true)
  }

  const deleteBlock = (id: string) => {
    const updatedStoryboard = storyboard.filter((block) => block.id !== id)
    setStoryboard(updatedStoryboard)
    updateCourseData({ storyboard: updatedStoryboard })
  }

  const saveBlock = () => {
    if (!editingBlock) return

    const isNewBlock = !storyboard.some((block) => block.id === editingBlock.id)
    let updatedStoryboard

    if (isNewBlock) {
      updatedStoryboard = [...storyboard, editingBlock]
    } else {
      updatedStoryboard = storyboard.map((block) => (block.id === editingBlock.id ? editingBlock : block))
    }

    setStoryboard(updatedStoryboard)
    updateCourseData({ storyboard: updatedStoryboard })
    setIsDialogOpen(false)
  }

  const getBlockIcon = (type: LessonBlock["type"]) => {
    switch (type) {
      case "text":
        return <FileText className="h-5 w-5" />
      case "video":
        return <Video className="h-5 w-5" />
      case "image":
        return <ImageIcon className="h-5 w-5" />
      case "quiz":
        return <FileQuestion className="h-5 w-5" />
      case "presentation":
        return <Presentation className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Storyboard Builder</h2>
        <p className="text-sm text-muted-foreground">
          Arrange and organize your course content by dragging and dropping lesson blocks
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => addBlock("text")}>
          <FileText className="mr-2 h-4 w-4" />
          Add Text
        </Button>
        <Button variant="outline" size="sm" onClick={() => addBlock("video")}>
          <Video className="mr-2 h-4 w-4" />
          Add Video
        </Button>
        <Button variant="outline" size="sm" onClick={() => addBlock("image")}>
          <ImageIcon className="mr-2 h-4 w-4" />
          Add Image
        </Button>
        <Button variant="outline" size="sm" onClick={() => addBlock("quiz")}>
          <FileQuestion className="mr-2 h-4 w-4" />
          Add Quiz
        </Button>
        <Button variant="outline" size="sm" onClick={() => addBlock("presentation")}>
          <Presentation className="mr-2 h-4 w-4" />
          Add Presentation
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="storyboard">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {storyboard.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className="rounded-md border bg-card">
                      <div className="flex items-center p-3">
                        <div {...provided.dragHandleProps} className="mr-2 cursor-grab text-muted-foreground">
                          <Grip className="h-5 w-5" />
                        </div>

                        <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                          {getBlockIcon(block.type)}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium">{block.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {block.type.charAt(0).toUpperCase() + block.type.slice(1)} • {block.duration} min
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => editBlock(block)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteBlock(block.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {storyboard.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-2 text-lg font-medium">No content blocks</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add your first content block using the buttons above
                  </p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingBlock?.id ? "Edit" : "Add"} {editingBlock?.type} Block
            </DialogTitle>
          </DialogHeader>

          {editingBlock && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="block-title">Title</Label>
                <Input
                  id="block-title"
                  value={editingBlock.title}
                  onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="block-type">Type</Label>
                  <Select
                    value={editingBlock.type}
                    onValueChange={(value: LessonBlock["type"]) => setEditingBlock({ ...editingBlock, type: value })}
                  >
                    <SelectTrigger id="block-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="block-duration">Duration (minutes)</Label>
                  <Input
                    id="block-duration"
                    type="number"
                    min="1"
                    value={editingBlock.duration}
                    onChange={(e) =>
                      setEditingBlock({
                        ...editingBlock,
                        duration: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="block-content">Content</Label>
                <Textarea
                  id="block-content"
                  rows={5}
                  value={editingBlock.content}
                  onChange={(e) => setEditingBlock({ ...editingBlock, content: e.target.value })}
                  placeholder={
                    editingBlock.type === "text"
                      ? "Enter text content..."
                      : editingBlock.type === "video"
                        ? "Enter video URL or embed code..."
                        : editingBlock.type === "image"
                          ? "Enter image URL or description..."
                          : editingBlock.type === "quiz"
                            ? "Enter quiz questions..."
                            : "Enter presentation content..."
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveBlock}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
