"use client"

import { useState } from "react"
import { Edit, ChevronDown, ChevronUp, Save, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Module } from "@/store/courseWizardStore"

interface CourseOutlineEditorProps {
  courseTitle: string
  courseSummary: string
  modules: Module[]
  onCourseTitleChange: (title: string) => void
  onCourseSummaryChange: (summary: string) => void
  onModulesChange: (modules: Module[]) => void
  isLoading?: boolean
}

export function CourseOutlineEditor({
  courseTitle,
  courseSummary,
  modules,
  onCourseTitleChange,
  onCourseSummaryChange,
  onModulesChange,
  isLoading = false,
}: CourseOutlineEditorProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingSummary, setEditingSummary] = useState(false)
  const [tempTitle, setTempTitle] = useState(courseTitle)
  const [tempSummary, setTempSummary] = useState(courseSummary)
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null)
  const [editingUnitIndex, setEditingUnitIndex] = useState<{moduleIndex: number; unitIndex: number} | null>(null)
  
  const handleSaveTitle = () => {
    onCourseTitleChange(tempTitle)
    setEditingTitle(false)
    toast({
      title: "Title updated",
      description: "Course title has been updated successfully.",
    })
  }
  
  const handleSaveSummary = () => {
    onCourseSummaryChange(tempSummary)
    setEditingSummary(false)
    toast({
      title: "Summary updated",
      description: "Course summary has been updated successfully.",
    })
  }
  
  const handleModuleTitleChange = (index: number, title: string) => {
    const updatedModules = [...modules]
    updatedModules[index] = { ...updatedModules[index], title }
    onModulesChange(updatedModules)
  }
  
  const handleModuleDescriptionChange = (index: number, description: string) => {
    const updatedModules = [...modules]
    updatedModules[index] = { ...updatedModules[index], description }
    onModulesChange(updatedModules)
  }
  
  const handleUnitTitleChange = (moduleIndex: number, unitIndex: number, title: string) => {
    const updatedModules = [...modules]
    updatedModules[moduleIndex].units[unitIndex] = { 
      ...updatedModules[moduleIndex].units[unitIndex], 
      title 
    }
    onModulesChange(updatedModules)
  }
  
  const handleUnitDescriptionChange = (moduleIndex: number, unitIndex: number, description: string) => {
    const updatedModules = [...modules]
    updatedModules[moduleIndex].units[unitIndex] = { 
      ...updatedModules[moduleIndex].units[unitIndex], 
      description 
    }
    onModulesChange(updatedModules)
  }
  
  const handleSaveModule = (index: number) => {
    setEditingModuleIndex(null)
    toast({
      title: "Module updated",
      description: "Module has been updated successfully.",
    })
  }
  
  const handleSaveUnit = (moduleIndex: number, unitIndex: number) => {
    setEditingUnitIndex(null)
    toast({
      title: "Unit updated",
      description: "Unit has been updated successfully.",
    })
  }
  
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h3 className="text-xl font-medium">Generating course outline...</h3>
          <p className="text-muted-foreground mt-2">
            Our AI is analyzing your content and creating a structured course outline.
          </p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="relative pb-2">
              <div className="absolute right-4 top-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingTitle(true)
                    setTempTitle(courseTitle)
                  }}
                  aria-label="Edit course title"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              
              {editingTitle ? (
                <div className="space-y-2">
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    placeholder="Enter course title"
                    className="text-xl font-semibold"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveTitle}>
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setEditingTitle(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <CardTitle className="text-2xl">{courseTitle || "Untitled Course"}</CardTitle>
              )}
            </CardHeader>
            
            <CardContent className="relative pt-0">
              <div className="absolute right-4 top-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingSummary(true)
                    setTempSummary(courseSummary)
                  }}
                  aria-label="Edit course summary"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              
              {editingSummary ? (
                <div className="space-y-2">
                  <Textarea
                    value={tempSummary}
                    onChange={(e) => setTempSummary(e.target.value)}
                    placeholder="Enter course summary"
                    className="min-h-[100px]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveSummary}>
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setEditingSummary(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <CardDescription className="text-base mt-1">
                  {courseSummary || "No course summary provided."}
                </CardDescription>
              )}
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Course Syllabus</h3>
            
            <Accordion type="multiple" className="w-full" defaultValue={modules.map((_, i) => `module-${i}`)}>
              {modules.map((module, moduleIndex) => (
                <AccordionItem key={module.id} value={`module-${moduleIndex}`} className="border rounded-md px-2 mb-3">
                  <AccordionTrigger className="hover:no-underline py-4 px-2">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="text-left">
                        <span className="font-medium">{`Module ${moduleIndex + 1}: ${module.title}`}</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent>
                    <div className="pt-2 pb-4 px-2 space-y-4">
                      {editingModuleIndex === moduleIndex ? (
                        <div className="space-y-4 mb-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Module Title</label>
                            <Input
                              value={module.title}
                              onChange={(e) => handleModuleTitleChange(moduleIndex, e.target.value)}
                              placeholder="Enter module title"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-1 block">Module Description</label>
                            <Textarea
                              value={module.description}
                              onChange={(e) => handleModuleDescriptionChange(moduleIndex, e.target.value)}
                              placeholder="Enter module description"
                              className="min-h-[80px]"
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveModule(moduleIndex)}>
                              <Save className="h-3.5 w-3.5 mr-1" />
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setEditingModuleIndex(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start mb-4">
                          <p className="text-muted-foreground text-sm">{module.description}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingModuleIndex(moduleIndex)}
                            aria-label={`Edit module ${moduleIndex + 1}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Units</h4>
                        
                        {module.units.map((unit, unitIndex) => (
                          <Card key={unit.id} className="overflow-hidden">
                            <CardContent className="p-3">
                              {editingUnitIndex && 
                               editingUnitIndex.moduleIndex === moduleIndex && 
                               editingUnitIndex.unitIndex === unitIndex ? (
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-xs font-medium mb-1 block">Unit Title</label>
                                    <Input
                                      value={unit.title}
                                      onChange={(e) => handleUnitTitleChange(moduleIndex, unitIndex, e.target.value)}
                                      placeholder="Enter unit title"
                                      className="text-sm"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="text-xs font-medium mb-1 block">Unit Description</label>
                                    <Textarea
                                      value={unit.description}
                                      onChange={(e) => handleUnitDescriptionChange(moduleIndex, unitIndex, e.target.value)}
                                      placeholder="Enter unit description"
                                      className="min-h-[60px] text-sm"
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleSaveUnit(moduleIndex, unitIndex)}>
                                      <Save className="h-3.5 w-3.5 mr-1" />
                                      Save
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => setEditingUnitIndex(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-medium text-sm">Unit {unitIndex + 1}: {unit.title}</h5>
                                    <p className="text-xs text-muted-foreground mt-1">{unit.description}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingUnitIndex({ moduleIndex, unitIndex })}
                                    aria-label={`Edit unit ${unitIndex + 1}`}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </>
      )}
    </div>
  )
}
