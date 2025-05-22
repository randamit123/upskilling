"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UploadedFile = {
  id: string
  name: string
  size: number
  type: string
  url: string
}

export type Module = {
  id: string
  title: string
  description: string
  collapsed?: boolean
  units: {
    id: string
    title: string
    description: string
  }[]
}

export type LearningObjective = {
  id: string
  description: string
}

export type Skill = {
  id: string
  name: string
  category: string
}

export type LearningObject = {
  id: string
  type: "video" | "quiz" | "reflection" | "scenario" | "reading"
  title: string
  description: string
  moduleId: string
  position: number
}

export type ComprehensivenessLevel = "brief" | "balanced" | "comprehensive"
export type CourseLength = "short" | "medium" | "long"
export type SkillLevel = "beginner" | "intermediate" | "advanced"

export interface CourseWizardState {
  activeStep: number
  uploadedFiles: UploadedFile[]
  courseTitle: string
  courseSummary: string
  // New course metadata fields
  customPrompt: string
  comprehensivenessLevel: ComprehensivenessLevel
  courseLength: CourseLength
  skillLevel: SkillLevel
  // Existing fields
  modules: Module[]
  learningObjectives: LearningObjective[]
  skills: Skill[]
  learningObjects: LearningObject[]
  isGenerating: boolean
  generationProgress: number // 0-100
  
  // Actions
  setActiveStep: (step: number) => void
  addUploadedFile: (file: UploadedFile) => void
  removeUploadedFile: (id: string) => void
  setCourseTitle: (title: string) => void
  setCourseSummary: (summary: string) => void
  // New metadata actions
  setCustomPrompt: (prompt: string) => void
  setComprehensivenessLevel: (level: ComprehensivenessLevel) => void
  setCourseLength: (length: CourseLength) => void
  setSkillLevel: (level: SkillLevel) => void
  // Existing actions
  setModules: (modules: Module[]) => void
  updateModule: (moduleId: string, updates: Partial<Module>) => void
  setLearningObjectives: (objectives: LearningObjective[]) => void
  updateLearningObjective: (id: string, description: string) => void
  addLearningObjective: (objective: LearningObjective) => void
  removeLearningObjective: (id: string) => void
  setSkills: (skills: Skill[]) => void
  addSkill: (skill: Skill) => void
  removeSkill: (id: string) => void
  setLearningObjects: (objects: LearningObject[]) => void
  addLearningObject: (object: LearningObject) => void
  updateLearningObject: (id: string, updates: Partial<LearningObject>) => void
  removeLearningObject: (id: string) => void
  moveLearningObject: (id: string, moduleId: string, position: number) => void
  setIsGenerating: (isGenerating: boolean) => void
  setGenerationProgress: (progress: number) => void
  reset: () => void
}

const initialState = {
  activeStep: 0,
  uploadedFiles: [],
  courseTitle: "",
  courseSummary: "",
  // New metadata with defaults
  customPrompt: "",
  comprehensivenessLevel: "balanced" as ComprehensivenessLevel,
  courseLength: "medium" as CourseLength,
  skillLevel: "intermediate" as SkillLevel,
  // Existing fields
  modules: [],
  learningObjectives: [],
  skills: [],
  learningObjects: [],
  isGenerating: false,
  generationProgress: 0,
}

export const useCourseWizardStore = create<CourseWizardState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setActiveStep: (step) => set({ activeStep: step }),
      
      addUploadedFile: (file) => 
        set((state) => ({ 
          uploadedFiles: [...state.uploadedFiles, file] 
        })),
      
      removeUploadedFile: (id) => 
        set((state) => ({ 
          uploadedFiles: state.uploadedFiles.filter((file) => file.id !== id) 
        })),
      
      setCourseTitle: (title) => set({ courseTitle: title }),
      
      setCourseSummary: (summary) => set({ courseSummary: summary }),
      
      // New metadata setters
      setCustomPrompt: (prompt) => set({ customPrompt: prompt }),
      setComprehensivenessLevel: (level) => set({ comprehensivenessLevel: level }),
      setCourseLength: (length) => set({ courseLength: length }),
      setSkillLevel: (level) => set({ skillLevel: level }),
      
      setModules: (modules) => set({ modules }),
      
      updateModule: (moduleId, updates) => 
        set((state) => ({
          modules: state.modules.map((module) => 
            module.id === moduleId ? { ...module, ...updates } : module
          )
        })),
      
      setLearningObjectives: (objectives) => set({ learningObjectives: objectives }),
      
      updateLearningObjective: (id, description) => 
        set((state) => ({
          learningObjectives: state.learningObjectives.map((objective) => 
            objective.id === id ? { ...objective, description } : objective
          )
        })),
      
      addLearningObjective: (objective) => 
        set((state) => ({ 
          learningObjectives: [...state.learningObjectives, objective] 
        })),
      
      removeLearningObjective: (id) => 
        set((state) => ({ 
          learningObjectives: state.learningObjectives.filter((obj) => obj.id !== id) 
        })),
      
      setSkills: (skills) => set({ skills }),
      
      addSkill: (skill) => 
        set((state) => ({ skills: [...state.skills, skill] })),
      
      removeSkill: (id) => 
        set((state) => ({ 
          skills: state.skills.filter((skill) => skill.id !== id) 
        })),
      
      setLearningObjects: (objects) => set({ learningObjects: objects }),
      
      addLearningObject: (object) => 
        set((state) => ({ 
          learningObjects: [...state.learningObjects, object] 
        })),
      
      updateLearningObject: (id, updates) => 
        set((state) => ({
          learningObjects: state.learningObjects.map((obj) => 
            obj.id === id ? { ...obj, ...updates } : obj
          )
        })),
      
      removeLearningObject: (id) => 
        set((state) => ({ 
          learningObjects: state.learningObjects.filter((obj) => obj.id !== id) 
        })),
      
      moveLearningObject: (id, moduleId, position) => 
        set((state) => {
          // Create a copy of learning objects
          const updatedObjects = [...state.learningObjects]
          
          // Find the object being moved
          const objectIndex = updatedObjects.findIndex((obj) => obj.id === id)
          if (objectIndex === -1) return state
          
          // Update module ID and position
          updatedObjects[objectIndex] = {
            ...updatedObjects[objectIndex],
            moduleId,
            position,
          }
          
          // Reorder positions within target module
          const moduleObjects = updatedObjects
            .filter((obj) => obj.moduleId === moduleId)
            .sort((a, b) => a.position - b.position)
          
          // Update positions
          moduleObjects.forEach((obj, index) => {
            const objIndex = updatedObjects.findIndex((o) => o.id === obj.id)
            if (objIndex !== -1) {
              updatedObjects[objIndex] = { ...updatedObjects[objIndex], position: index }
            }
          })
          
          return { learningObjects: updatedObjects }
        }),
      
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      
      setGenerationProgress: (generationProgress) => set({ generationProgress }),
      
      reset: () => set(initialState),
    }),
    {
      name: "course-wizard-storage",
    }
  )
)
