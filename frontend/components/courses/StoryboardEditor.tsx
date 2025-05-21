"use client"

import { useState, useRef } from "react"
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { Edit, Plus, X, Grip, Video, FileQuestion, BookOpen, MessageSquare, Play, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { LearningObject, Module } from "@/store/courseWizardStore"
import { v4 as uuidv4 } from "uuid"

interface StoryboardEditorProps {
  modules: Module[]
  learningObjects: LearningObject[]
  onLearningObjectsChange: (objects: LearningObject[]) => void
  isLoading?: boolean
}

export function StoryboardEditor({
  modules,
  learningObjects,
  onLearningObjectsChange,
  isLoading = false,
}: StoryboardEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentLearningObject, setCurrentLearningObject] = useState<LearningObject | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  
  // Create a reference to the container
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Configure sensors for keyboard and pointer
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )
  
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }
  
  const handleDragEnd = (event: any) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const activeObject = learningObjects.find((obj) => obj.id === active.id)
      const overObject = learningObjects.find((obj) => obj.id === over.id)
      
      if (activeObject && overObject) {
        // If moving within the same module
        if (activeObject.moduleId === overObject.moduleId) {
          const oldIndex = learningObjects.findIndex((obj) => obj.id === active.id)
          const newIndex = learningObjects.findIndex((obj) => obj.id === over.id)
          
          const newLearningObjects = arrayMove(learningObjects, oldIndex, newIndex)
          
          // Update positions
          const updatedObjects = newLearningObjects.map((obj, index) => {
            if (obj.moduleId === activeObject.moduleId) {
              const moduleObjects = newLearningObjects.filter(o => o.moduleId === obj.moduleId)
              const moduleIndex = moduleObjects.findIndex(o => o.id === obj.id)
              return { ...obj, position: moduleIndex }
            }
            return obj
          })
          
          onLearningObjectsChange(updatedObjects)
        } else {
          // If moving to a different module
          const newObjects = learningObjects.map(obj => {
            if (obj.id === active.id) {
              return { ...obj, moduleId: overObject.moduleId }
            }
            return obj
          })
          
          // Recalculate positions for both modules
          const sourceModuleId = activeObject.moduleId
          const targetModuleId = overObject.moduleId
          
          const updatedObjects = newObjects.map(obj => {
            if (obj.moduleId === sourceModuleId || obj.moduleId === targetModuleId) {
              const moduleObjects = newObjects.filter(o => o.moduleId === obj.moduleId)
              const moduleIndex = moduleObjects.findIndex(o => o.id === obj.id)
              return { ...obj, position: moduleIndex }
            }
            return obj
          })
          
          onLearningObjectsChange(updatedObjects)
        }
      }
    }
    
    setActiveId(null)
  }
  
  const handleAddLearningObject = (moduleId: string) => {
    setCurrentLearningObject({
      id: "",
      type: "video",
      title: "",
      description: "",
      moduleId,
      position: learningObjects.filter(obj => obj.moduleId === moduleId).length,
    })
    setIsCreatingNew(true)
    setEditDialogOpen(true)
  }
  
  const handleEditLearningObject = (learningObject: LearningObject) => {
    setCurrentLearningObject(learningObject)
    setIsCreatingNew(false)
    setEditDialogOpen(true)
  }
  
  const handleSaveLearningObject = (formData: any) => {
    if (isCreatingNew) {
      const newObject: LearningObject = {
        ...formData,
        id: uuidv4(),
      }
      
      onLearningObjectsChange([...learningObjects, newObject])
      
      toast({
        title: "Learning object added",
        description: "The learning object has been added successfully.",
      })
    } else if (currentLearningObject) {
      onLearningObjectsChange(
        learningObjects.map(obj => 
          obj.id === currentLearningObject.id ? { ...obj, ...formData } : obj
        )
      )
      
      toast({
        title: "Learning object updated",
        description: "The learning object has been updated successfully.",
      })
    }
    
    setEditDialogOpen(false)
    setCurrentLearningObject(null)
    setIsCreatingNew(false)
  }
  
  const handleDeleteLearningObject = (id: string) => {
    // Filter out the deleted object
    const newObjects = learningObjects.filter(obj => obj.id !== id)
    
    // Get the module ID of the deleted object
    const deletedObject = learningObjects.find(obj => obj.id === id)
    if (!deletedObject) return
    
    // Recalculate positions for the module
    const moduleId = deletedObject.moduleId
    const updatedObjects = newObjects.map(obj => {
      if (obj.moduleId === moduleId) {
        const moduleObjects = newObjects.filter(o => o.moduleId === moduleId)
        const moduleIndex = moduleObjects.findIndex(o => o.id === obj.id)
        return { ...obj, position: moduleIndex }
      }
      return obj
    })
    
    onLearningObjectsChange(updatedObjects)
    
    toast({
      title: "Learning object deleted",
      description: "The learning object has been deleted successfully.",
    })
  }
  
  // Group learning objects by module
  const getModuleLearningObjects = (moduleId: string) => {
    return learningObjects
      .filter(obj => obj.moduleId === moduleId)
      .sort((a, b) => a.position - b.position)
  }
  
  const getLearningObjectIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />
      case "quiz":
        return <FileQuestion className="h-5 w-5" />
      case "reading":
        return <BookOpen className="h-5 w-5" />
      case "reflection":
        return <MessageSquare className="h-5 w-5" />
      case "scenario":
        return <Play className="h-5 w-5" />
      default:
        return <Video className="h-5 w-5" />
    }
  }
  
  const getLearningObjectTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "Video"
      case "quiz":
        return "Quiz"
      case "reading":
        return "Reading"
      case "reflection":
        return "Reflection"
      case "scenario":
        return "Scenario"
      default:
        return "Content"
    }
  }
  
  // Draggable learning object component
  function SortableLearningObject({ 
    learningObject,
    onEdit,
    onDelete,
  }: { 
    learningObject: LearningObject
    onEdit: (learningObject: LearningObject) => void
    onDelete: (id: string) => void
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: learningObject.id })
    
    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      transition,
      opacity: isDragging ? 0.4 : 1,
    }
    
    return (
      <Card 
        ref={setNodeRef} 
        style={style} 
        className={cn(
          "mb-3",
          isDragging && "ring-2 ring-primary"
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div {...attributes} {...listeners} className="cursor-grab mt-1">
                <Grip className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  {getLearningObjectIcon(learningObject.type)}
                  <span className="text-xs font-medium bg-muted px-1.5 py-0.5 rounded">
                    {getLearningObjectTypeLabel(learningObject.type)}
                  </span>
                </div>
                
                <h4 className="font-medium text-sm">{learningObject.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {learningObject.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(learningObject)}
                aria-label={`Edit ${learningObject.title}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onDelete(learningObject.id)}
                aria-label={`Delete ${learningObject.title}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Rendered component for drag overlay
  function DragOverlayContent({ id }: { id: string }) {
    const learningObject = learningObjects.find(obj => obj.id === id)
    
    if (!learningObject) return null
    
    return (
      <Card className="w-full max-w-[320px] opacity-80">
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Grip className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                {getLearningObjectIcon(learningObject.type)}
                <span className="text-xs font-medium bg-muted px-1.5 py-0.5 rounded">
                  {getLearningObjectTypeLabel(learningObject.type)}
                </span>
              </div>
              
              <h4 className="font-medium text-sm">{learningObject.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {learningObject.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Form for editing/creating learning objects
  function LearningObjectForm({
    learningObject,
    onSave,
    onCancel,
  }: {
    learningObject: LearningObject
    onSave: (formData: any) => void
    onCancel: () => void
  }) {
    const [formData, setFormData] = useState({
      type: learningObject.type,
      title: learningObject.title,
      description: learningObject.description,
      moduleId: learningObject.moduleId,
      position: learningObject.position,
    })
    
    const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSave(formData)
    }
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">
            Object Type
          </label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select object type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="reading">Reading</SelectItem>
              <SelectItem value="reflection">Reflection Exercise</SelectItem>
              <SelectItem value="scenario">Interactive Scenario</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Enter a title"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Enter a description"
            className="min-h-[100px]"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="module" className="text-sm font-medium">
            Module
          </label>
          <Select
            value={formData.moduleId}
            onValueChange={(value) => handleChange("moduleId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select module" />
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
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    )
  }
  
  // This is what actually renders on the page
  return (
    <div className="space-y-6" ref={containerRef}>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h3 className="text-xl font-medium">Creating storyboard...</h3>
          <p className="text-muted-foreground mt-2">
            Our AI is organizing your course content into a structured storyboard.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Course Storyboard</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Drag and drop learning objects to arrange your course content. Each column represents a module. Click on a learning object to edit its details.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToWindowEdges]}
          >
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              aria-label="Course storyboard"
            >
              {modules.map((module) => {
                const moduleObjects = getModuleLearningObjects(module.id)
                
                return (
                  <Card key={module.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 py-3">
                      <CardTitle className="text-base">{module.title}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="p-3">
                      <SortableContext
                        items={moduleObjects.map(obj => obj.id)}
                        strategy={horizontalListSortingStrategy}
                      >
                        <div className="min-h-[120px]">
                          {moduleObjects.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">
                              No learning objects in this module.
                            </p>
                          ) : (
                            moduleObjects.map((obj) => (
                              <SortableLearningObject
                                key={obj.id}
                                learningObject={obj}
                                onEdit={handleEditLearningObject}
                                onDelete={handleDeleteLearningObject}
                              />
                            ))
                          )}
                        </div>
                      </SortableContext>
                    </CardContent>
                    
                    <CardFooter className="p-3 pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleAddLearningObject(module.id)}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add Learning Object
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
            
            <DragOverlay modifiers={[restrictToWindowEdges]}>
              {activeId ? <DragOverlayContent id={activeId} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isCreatingNew ? "Add Learning Object" : "Edit Learning Object"}
            </DialogTitle>
            <DialogDescription>
              {isCreatingNew
                ? "Create a new learning object for your course."
                : "Edit the details of this learning object."}
            </DialogDescription>
          </DialogHeader>
          
          {currentLearningObject && (
            <LearningObjectForm
              learningObject={currentLearningObject}
              onSave={handleSaveLearningObject}
              onCancel={() => {
                setEditDialogOpen(false)
                setCurrentLearningObject(null)
                setIsCreatingNew(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
