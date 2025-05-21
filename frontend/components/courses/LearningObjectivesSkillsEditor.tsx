"use client"

import { useState } from "react"
import { Edit, Plus, X, Check, Info, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { LearningObjective, Skill } from "@/store/courseWizardStore"
import { v4 as uuidv4 } from "uuid"

interface LearningObjectivesSkillsEditorProps {
  learningObjectives: LearningObjective[]
  skills: Skill[]
  onLearningObjectivesChange: (objectives: LearningObjective[]) => void
  onSkillsChange: (skills: Skill[]) => void
  isLoading?: boolean
}

// Mock data for skill suggestions based on our skill taxonomy
const SKILL_SUGGESTIONS: Skill[] = [
  { id: "skill-1", name: "Data Analysis", category: "Data Science" },
  { id: "skill-2", name: "Machine Learning", category: "Data Science" },
  { id: "skill-3", name: "Python Programming", category: "Software Development" },
  { id: "skill-4", name: "JavaScript", category: "Web Development" },
  { id: "skill-5", name: "React.js", category: "Web Development" },
  { id: "skill-6", name: "Strategic Planning", category: "Leadership" },
  { id: "skill-7", name: "Project Management", category: "Leadership" },
  { id: "skill-8", name: "Critical Thinking", category: "Soft Skills" },
  { id: "skill-9", name: "Problem Solving", category: "Soft Skills" },
  { id: "skill-10", name: "Communication", category: "Soft Skills" },
  { id: "skill-11", name: "Cloud Computing", category: "Infrastructure" },
  { id: "skill-12", name: "Cybersecurity", category: "Security" },
]

export function LearningObjectivesSkillsEditor({
  learningObjectives,
  skills,
  onLearningObjectivesChange,
  onSkillsChange,
  isLoading = false,
}: LearningObjectivesSkillsEditorProps) {
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null)
  const [newObjectiveText, setNewObjectiveText] = useState("")
  const [tempObjectiveText, setTempObjectiveText] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [open, setOpen] = useState(false)
  
  const handleAddObjective = () => {
    if (!newObjectiveText.trim()) return
    
    const newObjective: LearningObjective = {
      id: uuidv4(),
      description: newObjectiveText.trim(),
    }
    
    onLearningObjectivesChange([...learningObjectives, newObjective])
    setNewObjectiveText("")
    
    toast({
      title: "Learning objective added",
      description: "The learning objective has been added successfully.",
    })
  }
  
  const handleUpdateObjective = (id: string) => {
    if (!tempObjectiveText.trim()) return
    
    onLearningObjectivesChange(
      learningObjectives.map((obj) => 
        obj.id === id 
          ? { ...obj, description: tempObjectiveText.trim() } 
          : obj
      )
    )
    
    setEditingObjectiveId(null)
    setTempObjectiveText("")
    
    toast({
      title: "Learning objective updated",
      description: "The learning objective has been updated successfully.",
    })
  }
  
  const handleRemoveObjective = (id: string) => {
    onLearningObjectivesChange(learningObjectives.filter((obj) => obj.id !== id))
    
    toast({
      title: "Learning objective removed",
      description: "The learning objective has been removed successfully.",
    })
  }
  
  const handleAddSkill = (skill: Skill) => {
    if (skills.some((s) => s.id === skill.id)) {
      toast({
        title: "Skill already added",
        description: "This skill is already in your list.",
        variant: "destructive",
      })
      return
    }
    
    onSkillsChange([...skills, skill])
    setOpen(false)
    
    toast({
      title: "Skill added",
      description: `${skill.name} has been added to your skills.`,
    })
  }
  
  const handleRemoveSkill = (id: string) => {
    onSkillsChange(skills.filter((skill) => skill.id !== id))
    
    toast({
      title: "Skill removed",
      description: "The skill has been removed successfully.",
    })
  }
  
  // Filter skills based on search value
  const filteredSkills = SKILL_SUGGESTIONS.filter((skill) => {
    if (!searchValue) return true
    
    return (
      skill.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchValue.toLowerCase())
    )
  })
  
  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h3 className="text-xl font-medium">Generating learning objectives and skills mapping...</h3>
          <p className="text-muted-foreground mt-2">
            Our AI is analyzing your course content and identifying relevant learning objectives and skills.
          </p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Learning Objectives</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Learning objectives describe what learners will be able to do after completing the course. They should be specific, measurable, and aligned with adult learning principles.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  value={newObjectiveText}
                  onChange={(e) => setNewObjectiveText(e.target.value)}
                  placeholder="Add a new learning objective..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddObjective()
                    }
                  }}
                />
                <Button onClick={handleAddObjective} disabled={!newObjectiveText.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="space-y-3">
                {learningObjectives.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-2">No learning objectives added yet.</p>
                ) : (
                  learningObjectives.map((objective) => (
                    <div 
                      key={objective.id} 
                      className="flex items-start justify-between rounded-md border p-3 text-sm"
                    >
                      {editingObjectiveId === objective.id ? (
                        <div className="flex-1 space-y-2">
                          <Input
                            value={tempObjectiveText}
                            onChange={(e) => setTempObjectiveText(e.target.value)}
                            placeholder="Enter learning objective"
                            className="text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateObjective(objective.id)}
                              disabled={!tempObjectiveText.trim()}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setEditingObjectiveId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="flex-1 leading-relaxed">{objective.description}</p>
                          <div className="flex items-center ml-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingObjectiveId(objective.id)
                                setTempObjectiveText(objective.description)
                              }}
                              aria-label="Edit objective"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveObjective(objective.id)}
                              aria-label="Remove objective"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Skills Mapping</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Skills mapping connects your course to specific competencies in our skills taxonomy. This helps learners understand the practical skills they'll gain and supports career development.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="justify-between w-full"
                    >
                      {searchValue ? searchValue : "Search for skills..."}
                      <Plus className="h-4 w-4 ml-2 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command className="w-full">
                      <CommandInput 
                        placeholder="Search skills..." 
                        value={searchValue}
                        onValueChange={setSearchValue}
                      />
                      <CommandList>
                        <CommandEmpty>No skills found.</CommandEmpty>
                        <CommandGroup>
                          {filteredSkills.map((skill) => (
                            <CommandItem
                              key={skill.id}
                              value={skill.name}
                              onSelect={() => handleAddSkill(skill)}
                              className="flex items-center justify-between"
                              disabled={skills.some((s) => s.id === skill.id)}
                            >
                              <div>
                                <span>{skill.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {skill.category}
                                </span>
                              </div>
                              {skills.some((s) => s.id === skill.id) && (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                {skills.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-2">No skills added yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill) => (
                      <Badge 
                        key={skill.id}
                        variant="secondary"
                        className="flex items-center gap-1 py-1.5 pl-3 pr-2"
                      >
                        <span className="mr-1">{skill.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => handleRemoveSkill(skill.id)}
                          aria-label={`Remove ${skill.name} skill`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
