"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { LearningObjective, Skill } from "@/store/courseWizardStore"
import { Plus, X, Loader2, Search, Tag } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface LearningObjectivesSkillsEditorProps {
  learningObjectives: LearningObjective[]
  skills: Skill[]
  onLearningObjectivesChange: (objectives: LearningObjective[]) => void
  onSkillsChange: (skills: Skill[]) => void
  isLoading: boolean
}

// Skill categories for grouping
const skillCategories = ["Technical", "Soft Skills", "Domain Knowledge", "Tools", "Methodologies", "Other"]

// Sample skills for the combobox
const sampleSkills = [
  { id: "s1", name: "JavaScript", category: "Technical" },
  { id: "s2", name: "React", category: "Technical" },
  { id: "s3", name: "Node.js", category: "Technical" },
  { id: "s4", name: "Communication", category: "Soft Skills" },
  { id: "s5", name: "Problem Solving", category: "Soft Skills" },
  { id: "s6", name: "Project Management", category: "Methodologies" },
  { id: "s7", name: "Agile", category: "Methodologies" },
  { id: "s8", name: "Data Analysis", category: "Domain Knowledge" },
  { id: "s9", name: "UX Design", category: "Domain Knowledge" },
  { id: "s10", name: "Git", category: "Tools" },
  { id: "s11", name: "Docker", category: "Tools" },
  { id: "s12", name: "Leadership", category: "Soft Skills" },
]

export function LearningObjectivesSkillsEditor({
  learningObjectives,
  skills,
  onLearningObjectivesChange,
  onSkillsChange,
  isLoading,
}: LearningObjectivesSkillsEditorProps) {
  const [newObjective, setNewObjective] = useState("")
  const [newSkillName, setNewSkillName] = useState("")
  const [newSkillCategory, setNewSkillCategory] = useState(skillCategories[0])
  const [skillSearchOpen, setSkillSearchOpen] = useState(false)

  const handleAddObjective = () => {
    if (!newObjective.trim()) return

    const objective: LearningObjective = {
      id: uuidv4(),
      description: newObjective,
    }

    onLearningObjectivesChange([...learningObjectives, objective])
    setNewObjective("")
  }

  const handleRemoveObjective = (id: string) => {
    onLearningObjectivesChange(learningObjectives.filter((obj) => obj.id !== id))
  }

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return

    const skill: Skill = {
      id: uuidv4(),
      name: newSkillName,
      category: newSkillCategory,
    }

    onSkillsChange([...skills, skill])
    setNewSkillName("")
  }

  const handleAddExistingSkill = (skill: Skill) => {
    // Check if skill already exists
    if (skills.some((s) => s.id === skill.id)) return

    onSkillsChange([...skills, skill])
    setSkillSearchOpen(false)
  }

  const handleRemoveSkill = (id: string) => {
    onSkillsChange(skills.filter((skill) => skill.id !== id))
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium">Generating Learning Objectives & Skills</h3>
        <p className="text-muted-foreground mt-2">
          We're analyzing your course content to identify key learning objectives and skills...
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Learning Objectives Column */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <span className="mr-2">Learning Objectives</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                placeholder="Enter a learning objective"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddObjective()
                }}
              />
              <Button onClick={handleAddObjective} className="bg-[#582873] hover:bg-[#582873]/90">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add objective</span>
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              {learningObjectives.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No learning objectives defined yet. Add your first objective above.
                </p>
              ) : (
                <ul className="space-y-2">
                  {learningObjectives.map((objective, index) => (
                    <li key={objective.id} className="flex items-start group">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2 mt-0.5">
                        <span className="text-xs font-medium">{index + 1}</span>
                      </div>
                      <div className="flex-1 border rounded-md p-3 bg-card relative group-hover:border-primary/40 transition-colors">
                        <p className="text-sm">{objective.description}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveObjective(objective.id)}
                          className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove objective</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Column */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <span className="mr-2">Skills</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Popover open={skillSearchOpen} onOpenChange={setSkillSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-muted-foreground">
                    <Search className="mr-2 h-4 w-4" />
                    {skills.length > 0 ? "Add more skills..." : "Search for skills..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start" side="bottom" sideOffset={5}>
                  <Command>
                    <CommandInput placeholder="Search skills..." />
                    <CommandList>
                      <CommandEmpty>
                        <div className="py-2 px-4">
                          <p className="text-sm text-muted-foreground">No skills found.</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Try a different search or add a custom skill below.
                          </p>
                        </div>
                      </CommandEmpty>
                      {skillCategories.map((category) => {
                        const categorySkills = sampleSkills.filter((skill) => skill.category === category)
                        if (categorySkills.length === 0) return null

                        return (
                          <CommandGroup key={category} heading={category}>
                            {categorySkills.map((skill) => (
                              <CommandItem
                                key={skill.id}
                                onSelect={() => handleAddExistingSkill(skill)}
                                disabled={skills.some((s) => s.id === skill.id)}
                              >
                                <Tag className="mr-2 h-4 w-4" />
                                <span>{skill.name}</span>
                                {skills.some((s) => s.id === skill.id) && (
                                  <span className="ml-auto text-xs text-muted-foreground">Added</span>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )
                      })}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex space-x-2">
              <Input
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Add a custom skill"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSkill()
                }}
              />
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                {skillCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Button onClick={handleAddSkill} className="bg-[#582873] hover:bg-[#582873]/90">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add skill</span>
              </Button>
            </div>

            <Separator />

            <div>
              {skills.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No skills added yet. Search for skills or add custom skills above.
                </p>
              ) : (
                <div className="space-y-4">
                  {skillCategories.map((category) => {
                    const categorySkills = skills.filter((skill) => skill.category === category)
                    if (categorySkills.length === 0) return null

                    return (
                      <div key={category}>
                        <h4 className="text-sm font-medium mb-2">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {categorySkills.map((skill) => (
                            <Badge
                              key={skill.id}
                              variant="outline"
                              className="bg-primary/10 text-primary hover:bg-primary/20 group"
                            >
                              {skill.name}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveSkill(skill.id)}
                                className="h-4 w-4 ml-1 text-primary hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove skill</span>
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
