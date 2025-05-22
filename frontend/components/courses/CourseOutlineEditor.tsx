"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Module } from "@/store/courseWizardStore"
import { Pencil, Plus, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface CourseOutlineEditorProps {
  courseTitle: string
  courseSummary: string
  modules: Module[]
  onCourseTitleChange: (title: string) => void
  onCourseSummaryChange: (summary: string) => void
  onModulesChange: (modules: Module[]) => void
  isLoading: boolean
}

export function CourseOutlineEditor({
  courseTitle,
  courseSummary,
  modules,
  onCourseTitleChange,
  onCourseSummaryChange,
  onModulesChange,
  isLoading,
}: CourseOutlineEditorProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingSummary, setEditingSummary] = useState(false)
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [tempTitle, setTempTitle] = useState(courseTitle)
  const [tempSummary, setTempSummary] = useState(courseSummary)
  const [tempModuleTitle, setTempModuleTitle] = useState("")

  const handleSaveTitle = () => {
    onCourseTitleChange(tempTitle)
    setEditingTitle(false)
  }

  const handleSaveSummary = () => {
    onCourseSummaryChange(tempSummary)
    setEditingSummary(false)
  }

  const handleAddModule = () => {
    const newModule: Module = {
      id: uuidv4(),
      title: "New Module",
      description: "Module description",
      units: [],
    }
    onModulesChange([...modules, newModule])
  }

  const handleUpdateModule = (moduleId: string, updates: Partial<Module>) => {
    const updatedModules = modules.map((module) => (module.id === moduleId ? { ...module, ...updates } : module))
    onModulesChange(updatedModules)
  }

  const handleRemoveModule = (moduleId: string) => {
    const updatedModules = modules.filter((module) => module.id !== moduleId)
    onModulesChange(updatedModules)
  }

  const handleAddUnit = (moduleId: string) => {
    const updatedModules = modules.map((module) => {
      if (module.id === moduleId) {
        return {
          ...module,
          units: [
            ...module.units,
            {
              id: uuidv4(),
              title: "New Unit",
              description: "Unit description",
            },
          ],
        }
      }
      return module
    })
    onModulesChange(updatedModules)
  }

  const handleUpdateUnit = (moduleId: string, unitId: string, title: string, description: string) => {
    const updatedModules = modules.map((module) => {
      if (module.id === moduleId) {
        return {
          ...module,
          units: module.units.map((unit) => (unit.id === unitId ? { ...unit, title, description } : unit)),
        }
      }
      return module
    })
    onModulesChange(updatedModules)
  }

  const handleRemoveUnit = (moduleId: string, unitId: string) => {
    const updatedModules = modules.map((module) => {
      if (module.id === moduleId) {
        return {
          ...module,
          units: module.units.filter((unit) => unit.id !== unitId),
        }
      }
      return module
    })
    onModulesChange(updatedModules)
  }

  const handleMoveModule = (moduleId: string, direction: "up" | "down") => {
    const moduleIndex = modules.findIndex((module) => module.id === moduleId)
    if ((direction === "up" && moduleIndex === 0) || (direction === "down" && moduleIndex === modules.length - 1)) {
      return
    }

    const newModules = [...modules]
    const targetIndex = direction === "up" ? moduleIndex - 1 : moduleIndex + 1
    const temp = newModules[moduleIndex]
    newModules[moduleIndex] = newModules[targetIndex]
    newModules[targetIndex] = temp

    onModulesChange(newModules)
  }

  const handleEditModuleTitle = (moduleId: string, currentTitle: string) => {
    setEditingModuleId(moduleId)
    setTempModuleTitle(currentTitle)
  }

  const handleSaveModuleTitle = (moduleId: string) => {
    if (tempModuleTitle.trim()) {
      handleUpdateModule(moduleId, { title: tempModuleTitle })
    }
    setEditingModuleId(null)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Analyzing your content and generating course outline...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Course Details</h2>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Course Title</label>
                  <Button variant="ghost" size="sm" onClick={() => setEditingTitle(!editingTitle)} className="h-8 px-2">
                    <Pencil className="h-4 w-4 mr-1" />
                    {editingTitle ? "Cancel" : "Edit"}
                  </Button>
                </div>
                {editingTitle ? (
                  <div className="flex space-x-2">
                    <Input
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      placeholder="Enter course title"
                      className="flex-1"
                    />
                    <Button onClick={handleSaveTitle} size="sm">
                      Save
                    </Button>
                  </div>
                ) : (
                  <p className="text-lg font-medium">{courseTitle || "Untitled Course"}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Course Summary</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSummary(!editingSummary)}
                    className="h-8 px-2"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    {editingSummary ? "Cancel" : "Edit"}
                  </Button>
                </div>
                {editingSummary ? (
                  <div className="flex flex-col space-y-2">
                    <Textarea
                      value={tempSummary}
                      onChange={(e) => setTempSummary(e.target.value)}
                      placeholder="Enter course summary"
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleSaveSummary} size="sm">
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">{courseSummary || "No summary provided yet."}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Course Syllabus</h2>
            <Button onClick={handleAddModule} className="bg-[#582873] hover:bg-[#582873]/90">
              <Plus className="h-4 w-4 mr-1" />
              Add Module
            </Button>
          </div>

          {modules.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">No modules added yet.</p>
                <Button onClick={handleAddModule} variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Your First Module
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="multiple" defaultValue={modules.map((m) => m.id)} className="space-y-4">
              {modules.map((module, index) => (
                <AccordionItem key={module.id} value={module.id} className="border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between">
                    <AccordionTrigger className="flex-1">
                      {editingModuleId === module.id ? (
                        <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={tempModuleTitle}
                            onChange={(e) => setTempModuleTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveModuleTitle(module.id)
                              } else if (e.key === "Escape") {
                                setEditingModuleId(null)
                              }
                            }}
                            onBlur={() => handleSaveModuleTitle(module.id)}
                            className="h-8 py-1 px-2 w-full"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className="font-medium flex items-center">
                          Module {index + 1}: {module.title}
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditModuleTitle(module.id, module.title)
                            }}
                            className="h-6 w-6 ml-2 opacity-50 hover:opacity-100"
                          >
                            <span>
                              <Pencil className="h-3.5 w-3.5" />
                              <span className="sr-only">Edit module title</span>
                            </span>
                          </Button>
                        </span>
                      )}
                    </AccordionTrigger>
                    <div className="flex items-center pr-4 space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMoveModule(module.id, "up")
                        }}
                        disabled={index === 0}
                        className="h-8 w-8"
                      >
                        <ChevronUp className="h-4 w-4" />
                        <span className="sr-only">Move up</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMoveModule(module.id, "down")
                        }}
                        disabled={index === modules.length - 1}
                        className="h-8 w-8"
                      >
                        <ChevronDown className="h-4 w-4" />
                        <span className="sr-only">Move down</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveModule(module.id)
                        }}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete module</span>
                      </Button>
                    </div>
                  </div>
                  <AccordionContent className="px-4 pt-4 pb-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Module Description</label>
                        <Textarea
                          value={module.description}
                          onChange={(e) => handleUpdateModule(module.id, { description: e.target.value })}
                          placeholder="Enter module description"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-3 mt-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Units</h4>
                          <Button size="sm" variant="outline" onClick={() => handleAddUnit(module.id)}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add Unit
                          </Button>
                        </div>

                        {module.units.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">No units added to this module yet.</p>
                        ) : (
                          <Accordion type="multiple" className="space-y-2">
                            {module.units.map((unit, unitIndex) => (
                              <AccordionItem
                                key={unit.id}
                                value={unit.id}
                                className="border rounded-md overflow-hidden"
                              >
                                <div className="flex items-center bg-muted/20">
                                  <AccordionTrigger className="px-3 py-2 hover:no-underline flex-1 text-sm">
                                    <span>
                                      Unit {unitIndex + 1}: {unit.title}
                                    </span>
                                  </AccordionTrigger>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveUnit(module.id, unit.id)
                                    }}
                                    className="h-7 w-7 mr-2 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span className="sr-only">Delete unit</span>
                                  </Button>
                                </div>
                                <AccordionContent className="px-3 pt-3 pb-2">
                                  <div className="space-y-3">
                                    <div className="space-y-1">
                                      <label className="text-xs font-medium">Unit Title</label>
                                      <Input
                                        value={unit.title}
                                        onChange={(e) =>
                                          handleUpdateUnit(module.id, unit.id, e.target.value, unit.description)
                                        }
                                        placeholder="Enter unit title"
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-xs font-medium">Unit Description</label>
                                      <Textarea
                                        value={unit.description}
                                        onChange={(e) =>
                                          handleUpdateUnit(module.id, unit.id, unit.title, e.target.value)
                                        }
                                        placeholder="Enter unit description"
                                        rows={2}
                                        className="text-sm"
                                      />
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        )}

                        {module.units.length === 0 && (
                          <Button
                            variant="ghost"
                            className="w-full border border-dashed text-muted-foreground hover:text-foreground hover:bg-muted/50 mt-2"
                            onClick={() => handleAddUnit(module.id)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add First Unit
                          </Button>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {modules.length > 0 && (
            <Button
              variant="outline"
              className="w-full border border-dashed text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={handleAddModule}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Another Module
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
