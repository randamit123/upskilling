"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { SortableItem } from "./ui/sortable-item"
import { v4 as uuidv4 } from "uuid"
import {
  BookOpen,
  GraduationCap,
  Tag,
  PlayCircle,
  FileText,
  MessageSquare,
  Lightbulb,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Loader2,
  Video,
  FileQuestion,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Settings,
  ClipboardEdit,
  Wand2,
} from "lucide-react"
import type { 
  Module, 
  LearningObjective, 
  Skill, 
  LearningObject 
} from "@/store/courseWizardStore"

// Object type icons and colors
const objectTypeIcons = {
  video: Video,
  quiz: FileQuestion,
  discussion: MessageSquare,
  reading: BookOpen,
  activity: Lightbulb,
}

const objectTypeColors = {
  video: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  quiz: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  discussion: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  reading: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  activity: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
}

interface InteractiveCoursePreviewProps {
  courseTitle: string
  courseSummary: string
  modules: Module[]
  learningObjectives: LearningObjective[]
  skills: Skill[]
  learningObjects: LearningObject[]
  isLoading: boolean
  onLearningObjectsChange: (objects: LearningObject[]) => void
  onProceed: () => void
  onRegenerate: () => void
}

export function InteractiveCoursePreview({
  courseTitle,
  courseSummary,
  modules,
  learningObjectives,
  skills,
  learningObjects,
  isLoading,
  onLearningObjectsChange,
  onProceed,
  onRegenerate,
}: InteractiveCoursePreviewProps) {
  // State for reordering and managing learning objects
  const [regenerationNotes, setRegenerationNotes] = useState("")
  const [isRegenerationModalOpen, setIsRegenerationModalOpen] = useState(false)
  const [currentRegeneratingItem, setCurrentRegeneratingItem] = useState<LearningObject | null>(null)
  const [isRegeneratingCourse, setIsRegeneratingCourse] = useState(false)
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)
  
  // DnD Sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Function to filter and sort objects by module
  const getModuleObjects = (moduleId: string) => {
    return learningObjects
      .filter((obj) => obj.moduleId === moduleId)
      .sort((a, b) => a.position - b.position)
  }

  // Placeholder for rendering content type icon
  const getLectureTypeIcon = (type: string) => {
    const Icon = objectTypeIcons[type as keyof typeof objectTypeIcons] || FileText
    return <Icon className="h-4 w-4" />
  }

  // Open regeneration modal for an individual item
  const openRegenerationModal = (object: LearningObject) => {
    setCurrentRegeneratingItem(object)
    setRegenerationNotes("")
    setIsRegenerationModalOpen(true)
  }

  // Handle regeneration of an individual content item
  const handleRegenerateItem = () => {
    if (!currentRegeneratingItem) return
    
    setIsRegeneratingCourse(true)
    
    // Simulate API call to regenerate content item
    setTimeout(() => {
      // In a real implementation, you would call an API endpoint
      // Example: await regenerateContentItem(currentRegeneratingItem.id, regenerationNotes)
      
      const updatedObjects = learningObjects.map(obj => {
        if (obj.id === currentRegeneratingItem.id) {
          return {
            ...obj,
            title: `${obj.title} (Regenerated)`,
            description: regenerationNotes ? `Based on notes: ${regenerationNotes}` : obj.description
          }
        }
        return obj
      })
      
      onLearningObjectsChange(updatedObjects)
      setIsRegenerationModalOpen(false)
      setIsRegeneratingCourse(false)
      setCurrentRegeneratingItem(null)
      
      // Show success notification
      // toast({ title: "Content item regenerated successfully" })
    }, 1500) // Simulated delay
  }

  // Handle regeneration of the entire course
  const handleRegenerateCourse = () => {
    setIsRegeneratingCourse(true)
    
    // Call the parent component's regenerate function
    onRegenerate()
    
    // In a real implementation, you would also include the global notes
    // Example: await regenerateCourse(courseId, regenerationNotes)
  }

  // Handle drag end event for reordering objects
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const activeObject = learningObjects.find((obj) => obj.id === active.id)
      const overObject = learningObjects.find((obj) => obj.id === over.id)

      if (activeObject && overObject) {
        // Get all objects in the same module
        const moduleObjects = learningObjects.filter((obj) => 
          obj.moduleId === overObject.moduleId
        )

        // Find the indices
        const activeIndex = moduleObjects.findIndex((obj) => obj.id === active.id)
        const overIndex = moduleObjects.findIndex((obj) => obj.id === over.id)

        // Create a new array with the updated positions
        const updatedObjects = [...learningObjects]

        // Update the moduleId if it's different
        if (activeObject.moduleId !== overObject.moduleId) {
          const objIndex = updatedObjects.findIndex((obj) => obj.id === active.id)
          updatedObjects[objIndex] = {
            ...updatedObjects[objIndex],
            moduleId: overObject.moduleId,
          }
        }

        // Update positions based on new index
        const reorderedObjects = updatedObjects.map((obj, idx) => {
          if (moduleObjects.find(mObj => mObj.id === obj.id)) {
            // This object is in the same module as the dragged items
            // Assign new position based on its order in the module
            const newModuleObjects = [...moduleObjects]
            const [movedItem] = newModuleObjects.splice(activeIndex, 1)
            newModuleObjects.splice(overIndex, 0, movedItem)
            
            const newPos = newModuleObjects.findIndex(mObj => mObj.id === obj.id)
            return { ...obj, position: newPos }
          }
          
          return obj
        })

        onLearningObjectsChange(reorderedObjects)
      }
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium">Generating Course Preview</h3>
        <p className="text-sm text-muted-foreground mt-2">Please wait while we prepare your course content</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="flex flex-col space-y-6 pb-20">
        {/* Course title and summary */}
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <BookOpen className="mr-2 h-6 w-6 text-primary" />
            {courseTitle}
          </h1>
          <p className="text-muted-foreground mt-2">{courseSummary}</p>
        </div>
        
        <Separator />
        
        {/* Global notes for regenerating the entire course */}
        <Card className="border-dashed border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-md flex items-center">
              <Sparkles className="h-4 w-4 text-primary mr-2" />
              Course Regeneration Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <Textarea 
                placeholder="Add global notes or instructions for regenerating the course..."
                className={`min-h-[40px] transition-all ${isNotesExpanded ? 'min-h-[120px]' : ''}`}
                onFocus={() => setIsNotesExpanded(true)}
                onBlur={() => setIsNotesExpanded(false)}
              />
              
              <div className="flex justify-end mt-3">
                <Button 
                  onClick={handleRegenerateCourse}
                  className="bg-[#582873] hover:bg-[#582873]/90"
                  disabled={isRegeneratingCourse}
                >
                  {isRegeneratingCourse ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Regenerate Course
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules and Learning Objects */}
        <div className="space-y-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            {modules.map((module, moduleIndex) => (
              <Card key={module.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 py-3">
                  <CardTitle className="text-xl flex items-center">
                    Module {moduleIndex + 1}: {module.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </CardHeader>
                <CardContent className="p-4 space-y-6">
                  {/* Module Content (Learning Objects) */}
                  <div className="space-y-4">
                    <SortableContext 
                      items={getModuleObjects(module.id).map(obj => obj.id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      {getModuleObjects(module.id).map((object) => (
                        <SortableItem key={object.id} id={object.id}>
                          <div className="flex items-start border-l-2 border-muted pl-3 py-2 group">
                            <div className="flex-shrink-0 mt-0.5 mr-2 cursor-move opacity-50 group-hover:opacity-100">
                              <GripVertical className="h-5 w-5" />
                            </div>
                            
                            <div className="flex-shrink-0 mt-0.5 mr-2">
                              {getLectureTypeIcon(object.type)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-sm ${objectTypeColors[object.type as keyof typeof objectTypeColors]}`}>
                                  {object.type.charAt(0).toUpperCase() + object.type.slice(1)}
                                </span>
                              </div>
                              
                              <h6 className="text-sm font-medium mt-1">
                                {object.title}
                              </h6>
                              
                              <p className="text-xs text-muted-foreground mt-1">
                                {object.description}
                              </p>
                            </div>
                            
                            <div className="flex space-x-1 items-start ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 rounded-full"
                                onClick={() => openRegenerationModal(object)}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span className="sr-only">Regenerate</span>
                              </Button>
                              
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 rounded-full"
                                onClick={() => {
                                  const updatedObjects = learningObjects.filter(obj => obj.id !== object.id)
                                  onLearningObjectsChange(updatedObjects)
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </SortableItem>
                      ))}
                    </SortableContext>
                    
                    {/* Add new item button */}
                    <div className="mt-4 pl-8">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-8"
                        onClick={() => {
                          const newObject: LearningObject = {
                            id: uuidv4(),
                            moduleId: module.id,
                            type: "reading",
                            title: "New Learning Object",
                            description: "Click to edit this learning object",
                            position: getModuleObjects(module.id).length,
                          }
                          
                          onLearningObjectsChange([...learningObjects, newObject])
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Learning Object
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </DndContext>
        </div>

        {/* Learning Objectives and Skills */}
        <div className="grid grid-cols-1 gap-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-md">
                <div className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Learning Objectives & Skills
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Learning Objectives</h3>
                <ul className="space-y-2">
                  {learningObjectives.map((objective, index) => (
                    <li key={objective.id} className="text-sm flex">
                      <span className="font-medium text-primary mr-2">{index + 1}.</span>
                      <span className="text-muted-foreground">{objective.description}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill.id} variant="outline" className="bg-primary/10 text-primary">
                      <Tag className="h-3 w-3 mr-1" />
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fixed footer with primary action button */}
      <div className="fixed bottom-6 right-6 z-10">
        <Button 
          onClick={onProceed}
          className="bg-[#582873] hover:bg-[#582873]/90] h-12 px-6 shadow-md"
          size="lg"
        >
          Review & Publish
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Regeneration Modal */}
      <Dialog open={isRegenerationModalOpen} onOpenChange={setIsRegenerationModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Regenerate Content Item</DialogTitle>
            <DialogDescription>
              Provide specific instructions to guide the AI in regenerating this content item.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="text-sm font-medium mb-2">Current Content</h3>
            <div className="bg-muted/20 p-3 rounded-md mb-4">
              <div className="flex items-center mb-1">
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-sm ${currentRegeneratingItem ? objectTypeColors[currentRegeneratingItem.type as keyof typeof objectTypeColors] : ""}`}>
                  {currentRegeneratingItem ? currentRegeneratingItem.type.charAt(0).toUpperCase() + currentRegeneratingItem.type.slice(1) : ""}
                </span>
              </div>
              <h4 className="text-sm font-medium">{currentRegeneratingItem?.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{currentRegeneratingItem?.description}</p>
            </div>
            
            <Textarea
              placeholder="Add specific instructions for regeneration (e.g., 'Make this more interactive', 'Focus on practical applications', etc.)"
              className="min-h-[120px]"
              value={regenerationNotes}
              onChange={(e) => setRegenerationNotes(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRegenerationModalOpen(false)
                setCurrentRegeneratingItem(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRegenerateItem}
              className="bg-[#582873] hover:bg-[#582873]/90"
              disabled={isRegeneratingCourse}
            >
              {isRegeneratingCourse ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
