"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoaderSpinner } from "@/components/global/loader-spinner"
import { useMockLatency } from "@/lib/hooks/use-mock-latency"
import { Plus, Trash2 } from "lucide-react"

interface CourseOutlineProps {
  courseData: any
  updateCourseData: (data: any) => void
}

interface OutlineItem {
  id: string
  title: string
  content: string
}

interface Objective {
  id: string
  text: string
}

export function CourseOutline({ courseData, updateCourseData }: CourseOutlineProps) {
  const [outline, setOutline] = useState<OutlineItem[]>([])
  const [objectives, setObjectives] = useState<Objective[]>([])
  const { isLoading, simulateRequest } = useMockLatency()

  // Generate outline and objectives when component mounts or content changes
  useEffect(() => {
    if (courseData.content && (!courseData.outline.length || !courseData.objectives.length)) {
      generateOutlineAndObjectives()
    } else if (courseData.outline.length && courseData.objectives.length) {
      setOutline(courseData.outline)
      setObjectives(courseData.objectives)
    }
  }, [courseData.content])

  const generateOutlineAndObjectives = async () => {
    await simulateRequest(async () => {
      // In a real app, we would use AI to generate the outline and objectives
      // For now, we'll just create some dummy data
      const generatedOutline = [
        { id: "1", title: "Introduction to the Course", content: "Overview of what will be covered in the course." },
        { id: "2", title: "Core Concepts", content: "Explanation of the fundamental concepts and principles." },
        { id: "3", title: "Practical Applications", content: "Real-world examples and case studies." },
        { id: "4", title: "Advanced Techniques", content: "Deeper dive into more complex aspects of the subject." },
        { id: "5", title: "Conclusion and Next Steps", content: "Summary and recommendations for further learning." },
      ]

      const generatedObjectives = [
        { id: "1", text: "Understand the fundamental principles of the subject" },
        { id: "2", text: "Apply core concepts to solve practical problems" },
        { id: "3", text: "Analyze real-world scenarios using the learned techniques" },
        { id: "4", text: "Evaluate different approaches and methodologies" },
        { id: "5", text: "Create your own solutions based on the course material" },
      ]

      setOutline(generatedOutline)
      setObjectives(generatedObjectives)

      updateCourseData({
        outline: generatedOutline,
        objectives: generatedObjectives,
      })
    })
  }

  const handleOutlineChange = (id: string, field: keyof OutlineItem, value: string) => {
    const updatedOutline = outline.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    setOutline(updatedOutline)
    updateCourseData({ outline: updatedOutline })
  }

  const handleObjectiveChange = (id: string, value: string) => {
    const updatedObjectives = objectives.map((item) => (item.id === id ? { ...item, text: value } : item))
    setObjectives(updatedObjectives)
    updateCourseData({ objectives: updatedObjectives })
  }

  const addOutlineItem = () => {
    const newItem = {
      id: Date.now().toString(),
      title: "",
      content: "",
    }
    const updatedOutline = [...outline, newItem]
    setOutline(updatedOutline)
    updateCourseData({ outline: updatedOutline })
  }

  const removeOutlineItem = (id: string) => {
    const updatedOutline = outline.filter((item) => item.id !== id)
    setOutline(updatedOutline)
    updateCourseData({ outline: updatedOutline })
  }

  const addObjective = () => {
    const newObjective = {
      id: Date.now().toString(),
      text: "",
    }
    const updatedObjectives = [...objectives, newObjective]
    setObjectives(updatedObjectives)
    updateCourseData({ objectives: updatedObjectives })
  }

  const removeObjective = (id: string) => {
    const updatedObjectives = objectives.filter((item) => item.id !== id)
    setObjectives(updatedObjectives)
    updateCourseData({ objectives: updatedObjectives })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoaderSpinner />
        <p className="mt-4 text-muted-foreground">Generating course outline and learning objectives...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Course Outline & Learning Objectives</h2>
        <p className="text-sm text-muted-foreground">
          Review and edit the auto-generated outline and learning objectives
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-md flex items-center justify-between">
              Course Outline
              <Button size="sm" variant="outline" onClick={addOutlineItem}>
                <Plus className="mr-1 h-4 w-4" />
                Add Section
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {outline.map((item, index) => (
                <div key={item.id} className="space-y-2 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`section-${item.id}`} className="text-sm font-medium">
                      Section {index + 1}
                    </Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOutlineItem(item.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove section</span>
                    </Button>
                  </div>
                  <Input
                    id={`section-${item.id}`}
                    value={item.title}
                    onChange={(e) => handleOutlineChange(item.id, "title", e.target.value)}
                    placeholder="Section title"
                  />
                  <Textarea
                    value={item.content}
                    onChange={(e) => handleOutlineChange(item.id, "content", e.target.value)}
                    placeholder="Section content"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-md flex items-center justify-between">
              Learning Objectives
              <Button size="sm" variant="outline" onClick={addObjective}>
                <Plus className="mr-1 h-4 w-4" />
                Add Objective
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {objectives.map((objective, index) => (
                <div key={objective.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <Input
                      value={objective.text}
                      onChange={(e) => handleObjectiveChange(objective.id, e.target.value)}
                      placeholder={`Learning objective ${index + 1}`}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeObjective(objective.id)}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove objective</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
