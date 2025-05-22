"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Module, LearningObject } from "@/store/courseWizardStore"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { v4 as uuidv4 } from "uuid"
import {
  Plus,
  Loader2,
  Video,
  FileQuestion,
  MessageSquare,
  BookOpen,
  Lightbulb,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SortableItem } from "./ui/sortable-item"

interface StoryboardEditorProps {
  modules: Module[]
  learningObjects: LearningObject[]
  onLearningObjectsChange: (objects: LearningObject[]) => void
  isLoading: boolean
}

type LearningObjectType = "video" | "quiz" | "reflection" | "scenario" | "reading"

const objectTypeIcons = {
  video: Video,
  quiz: FileQuestion,
  reflection: MessageSquare,
  reading: BookOpen,
  scenario: Lightbulb,
}

const objectTypeColors = {
  video: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  quiz: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  reflection: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  reading: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  scenario: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
}

export function StoryboardEditor({
  modules,
  learningObjects,
  onLearningObjectsChange,
  isLoading,
}: StoryboardEditorProps) {
  const [editingObject, setEditingObject] = useState<LearningObject | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newObjectType, setNewObjectType] = useState<LearningObjectType>("video")
  const [newObjectTitle, setNewObjectTitle] = useState("")
  const [newObjectDescription, setNewObjectDescription] = useState("")
  const [newObjectModuleId, setNewObjectModuleId] = useState("")
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const activeObject = learningObjects.find((obj) => obj.id === active.id)
      const overObject = learningObjects.find((obj) => obj.id === over.id)

      if (activeObject && overObject) {
        // Get all objects in the same module as the over object
        const moduleObjects = learningObjects.filter((obj) => obj.moduleId === overObject.moduleId)

        // Find the indices
        const activeIndex = moduleObjects.findIndex((obj) => obj.id === active.id)
        const overIndex = moduleObjects.findIndex((obj) => obj.id === over.id)

        // Create a new array with the updated positions
        const updatedObjects = [...learningObjects]

        // Update the module ID if it's different
        if (activeObject.moduleId !== overObject.moduleId) {
          const objIndex = updatedObjects.findIndex((obj) => obj.id === active.id)
          updatedObjects[objIndex] = {
            ...updatedObjects[objIndex],
            moduleId: overObject.moduleId,
          }
        }

        // Update positions
        updatedObjects.forEach((obj) => {
          if (obj.moduleId === overObject.moduleId) {
            const currentIndex = moduleObjects.findIndex((o) => o.id === obj.id)
            let newPosition = obj.position

            if (currentIndex === activeIndex) {
              // This is the dragged item, set its position to the target position
              newPosition = overObject.position
            } else if (
              (activeIndex < overIndex && currentIndex > activeIndex && currentIndex <= overIndex) ||
              (activeIndex > overIndex && currentIndex < activeIndex && currentIndex >= overIndex)
            ) {
              // Adjust positions of items between the source and target
              newPosition = activeIndex < overIndex ? obj.position - 1 : obj.position + 1
            }

            const objIndex = updatedObjects.findIndex((o) => o.id === obj.id)
            if (objIndex !== -1) {
              updatedObjects[objIndex] = { ...updatedObjects[objIndex], position: newPosition }
            }
          }
        })

        onLearningObjectsChange(updatedObjects)
      }
    }
  }

  const handleAddObject = () => {
    if (!newObjectTitle.trim() || !newObjectModuleId) return

    const moduleObjects = learningObjects.filter((obj) => obj.moduleId === newObjectModuleId)

    // Find the highest position in the module
    const highestPosition = moduleObjects.length > 0 ? Math.max(...moduleObjects.map((obj) => obj.position)) : -1

    const newObject: LearningObject = {
      id: uuidv4(),
      type: newObjectType,
      title: newObjectTitle,
      description: newObjectDescription,
      moduleId: newObjectModuleId,
      position: highestPosition + 1,
    }

    onLearningObjectsChange([...learningObjects, newObject])
    resetForm()
    setIsDialogOpen(false)
    setIsAddMenuOpen(false)
  }

  const handleUpdateObject = () => {
    if (!editingObject || !editingObject.title.trim()) return

    const updatedObjects = learningObjects.map((obj) => (obj.id === editingObject.id ? editingObject : obj))

    onLearningObjectsChange(updatedObjects)
    setEditingObject(null)
    setIsDialogOpen(false)
  }

  const handleRemoveObject = (id: string) => {
    onLearningObjectsChange(learningObjects.filter((obj) => obj.id !== id))
  }

  const resetForm = () => {
    setNewObjectType("video")
    setNewObjectTitle("")
    setNewObjectDescription("")
    setNewObjectModuleId("")
  }

  const openEditDialog = (object: LearningObject) => {
    setEditingObject({ ...object })
    setIsDialogOpen(true)
  }

  const openAddDialog = (type: LearningObjectType) => {
    setNewObjectType(type)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium">Loading Storyboard</h3>
        <p className="text-muted-foreground mt-2">We're preparing your storyboard editor...</p>
      </div>
    )
  }

  // Group learning objects by module
  const objectsByModule: Record<string, LearningObject[]> = {}

  modules.forEach((module) => {
    objectsByModule[module.id] = learningObjects
      .filter((obj) => obj.moduleId === module.id)
      .sort((a, b) => a.position - b.position)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Storyboard Editor</h2>

        <div className="flex space-x-2">
          <Sheet open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
            <SheetTrigger asChild>
              <Button className="bg-[#582873] hover:bg-[#582873]/90">
                <Plus className="h-4 w-4 mr-1" />
                Add Content
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[300px]">
              <SheetHeader>
                <SheetTitle>Add Learning Content</SheetTitle>
                <SheetDescription>Select the type of learning content you want to add to your course.</SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-6">
                {Object.entries(objectTypeIcons).map(([type, Icon]) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="h-auto flex flex-col items-center justify-center p-4 gap-2"
                    onClick={() => {
                      openAddDialog(type as LearningObjectType)
                    }}
                  >
                    <div className={`p-2 rounded-full ${objectTypeColors[type as LearningObjectType]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm capitalize">{type}</span>
                  </Button>
                ))}
              </div>

              <SheetFooter>
                <Button variant="outline" onClick={() => setIsAddMenuOpen(false)}>
                  Cancel
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-4">
        {modules.map((module) => (
          <Card key={module.id} className="min-w-[300px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{module.title}</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext items={objectsByModule[module.id] || []} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {objectsByModule[module.id]?.length ? (
                      objectsByModule[module.id].map((object) => {
                        const Icon = objectTypeIcons[object.type]

                        return (
                          <SortableItem key={object.id} id={object.id}>
                            <div className="flex items-start border rounded-md p-3 bg-card group hover:border-primary/40 transition-colors">
                              <div className="flex-shrink-0 mr-3 mt-1 cursor-grab">
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div
                                className={`flex-shrink-0 w-8 h-8 rounded-full ${objectTypeColors[object.type]} flex items-center justify-center mr-3`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium truncate">{object.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{object.description}</p>
                              </div>
                              <div className="flex-shrink-0 ml-2 flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(object)}
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveObject(object.id)}
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </div>
                          </SortableItem>
                        )
                      })
                    ) : (
                      <div className="text-center py-6 border border-dashed rounded-md">
                        <p className="text-sm text-muted-foreground mb-2">No content in this module</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNewObjectModuleId(module.id)
                            setIsAddMenuOpen(true)
                          }}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add Content
                        </Button>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>

              {objectsByModule[module.id]?.length > 0 && (
                <Button
                  variant="ghost"
                  className="w-full mt-3 border border-dashed text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setNewObjectModuleId(module.id)
                    setIsAddMenuOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Content
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingObject ? "Edit Learning Object" : "Add Learning Object"}</DialogTitle>
            <DialogDescription>
              {editingObject
                ? "Update the details of this learning object."
                : "Create a new learning object for your course."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!editingObject && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Module</label>
                <Select value={newObjectModuleId} onValueChange={setNewObjectModuleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!editingObject && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Content Type</label>
                <Select value={newObjectType} onValueChange={(value) => setNewObjectType(value as LearningObjectType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(objectTypeIcons).map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center">
                          {React.createElement(objectTypeIcons[type as LearningObjectType], {
                            className: "h-4 w-4 mr-2",
                          })}
                          <span className="capitalize">{type}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editingObject ? editingObject.title : newObjectTitle}
                onChange={(e) =>
                  editingObject
                    ? setEditingObject({ ...editingObject, title: e.target.value })
                    : setNewObjectTitle(e.target.value)
                }
                placeholder="Enter a title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editingObject ? editingObject.description : newObjectDescription}
                onChange={(e) =>
                  editingObject
                    ? setEditingObject({ ...editingObject, description: e.target.value })
                    : setNewObjectDescription(e.target.value)
                }
                placeholder="Enter a description"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setEditingObject(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingObject ? handleUpdateObject : handleAddObject}
              className="bg-[#582873] hover:bg-[#582873]/90"
            >
              {editingObject ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
