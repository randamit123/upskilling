"use client"

import { useState, useEffect } from "react"
import { skills } from "@/lib/data/skills"

interface CourseSkillsTaggingProps {
  courseData: any
  updateCourseData: (data: any) => void
}

export function CourseSkillsTagging({ courseData, updateCourseData }: CourseSkillsTaggingProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([])

  useEffect(() => {
    if (courseData.skills && courseData.skills.length) {
      setSelectedSkills(courseData.skills)
    } else {
      // Generate suggested skills based on course content and title
      const suggested = generateSuggestedSkills()
      setSuggestedSkills(suggested)
    }
  }, [courseData])

  const generateSuggestedSkills = () => {
    // In a real app, this would use AI to analyze the course content
    // For now, we'll just return some random skills
    const allSkillNames = skills.map(skill => skill.name)
    const shuffled = [...allSkillNames].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 5)
  }

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      const updated = [...selectedSkills, skill]
      setSelectedSkills(updated)
      updateCourseData({ skills: updated })
    }
  }

  const removeSkill = (skill: string) => {
    const updated = selectedSkills.filter(s => s !== skill)
    setSelectedSkills(updated)
    updateCourseData({ skills: updated })
  }

  const addSuggestedSkill = (skill: string) => {
    addSkill(skill)
    setSuggestedSkills(suggestedSkills.filter(s => s !== skill))
  }

  return (
    <div className="space-y-6">
      <div className="text-center text-muted-foreground">
        <p>Skills tagging component will be implemented here</p>
        <p>Selected skills: {selectedSkills.join(', ') || 'None'}</p>
      </div>
    </div>
  )
}
