import { UploadedFile, Module, LearningObjective, Skill, LearningObject } from "@/store/courseWizardStore"

// Mock data for testing
const mockModules: Module[] = [
  {
    id: "module-1",
    title: "Introduction to Course Development",
    description: "This module introduces learners to the fundamentals of instructional design and course development principles.",
    units: [
      {
        id: "unit-1-1",
        title: "Adult Learning Principles",
        description: "Understanding how adults learn and applying these principles to course design."
      },
      {
        id: "unit-1-2",
        title: "Learning Objectives and Outcomes",
        description: "How to create effective learning objectives that drive course development."
      }
    ]
  },
  {
    id: "module-2",
    title: "Content Development Strategies",
    description: "This module covers strategies for developing engaging and effective learning content.",
    units: [
      {
        id: "unit-2-1",
        title: "Multimedia Learning",
        description: "Using multimedia elements to enhance learning experience."
      },
      {
        id: "unit-2-2",
        title: "Interactive Content",
        description: "Creating interactive content to improve engagement and retention."
      }
    ]
  },
  {
    id: "module-3",
    title: "Assessment and Evaluation",
    description: "This module explores different methods of assessment and evaluation in course development.",
    units: [
      {
        id: "unit-3-1",
        title: "Assessment Types",
        description: "Overview of formative and summative assessments."
      },
      {
        id: "unit-3-2",
        title: "Feedback Mechanisms",
        description: "Implementing effective feedback mechanisms in courses."
      }
    ]
  }
]

const mockLearningObjectives: LearningObjective[] = [
  {
    id: "obj-1",
    description: "Apply adult learning principles to course development"
  },
  {
    id: "obj-2",
    description: "Create clear and measurable learning objectives"
  },
  {
    id: "obj-3",
    description: "Develop engaging multimedia learning content"
  },
  {
    id: "obj-4",
    description: "Design effective assessment strategies"
  }
]

const mockSkills: Skill[] = [
  {
    id: "skill-1",
    name: "Instructional Design",
    category: "Education"
  },
  {
    id: "skill-2",
    name: "Curriculum Development",
    category: "Education"
  },
  {
    id: "skill-3",
    name: "Content Creation",
    category: "Media"
  },
  {
    id: "skill-4",
    name: "Learning Assessment",
    category: "Education"
  }
]

/**
 * Uploads content files to the backend
 * @param files List of files to upload
 * @returns Promise that resolves when upload is complete
 */
export async function uploadContent(files: UploadedFile[]): Promise<void> {
  console.log('Uploading files:', files)
  
  // Simulate API call with delay
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Files uploaded successfully')
      resolve()
    }, 2000)
  })
}

/**
 * Generates a course outline based on uploaded content
 * @returns Promise that resolves with the generated course outline
 */
export async function generateCourseOutline(): Promise<{
  title: string
  summary: string
  modules: Module[]
}> {
  console.log('Generating course outline')
  
  // Simulate API call with delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: "Advanced Course Development for Purple Courses",
        summary: "This comprehensive course teaches instructors how to design, develop, and deliver effective learning experiences aligned with adult learning principles. Learn how to create engaging content, design meaningful assessments, and structure courses for maximum impact.",
        modules: mockModules
      })
    }, 3000)
  })
}

/**
 * Generates learning objectives and skills based on course outline
 * @param data Course outline data
 * @returns Promise that resolves with generated objectives and skills
 */
export async function generateObjectivesAndSkills(data: {
  courseTitle: string
  courseSummary: string
  modules: Module[]
}): Promise<{
  objectives: LearningObjective[]
  skills: Skill[]
}> {
  console.log('Generating objectives and skills for:', data.courseTitle)
  
  // Simulate API call with delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        objectives: mockLearningObjectives,
        skills: mockSkills
      })
    }, 2500)
  })
}

/**
 * Saves the storyboard state to the backend
 * @param data Storyboard data
 * @returns Promise that resolves when save is complete
 */
export async function saveStoryboard(data: {
  learningObjects: LearningObject[]
}): Promise<void> {
  console.log('Saving storyboard:', data.learningObjects.length, 'learning objects')
  
  // Simulate API call with delay
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Storyboard saved successfully')
      resolve()
    }, 1500)
  })
}

/**
 * Publishes the course to the platform
 * @param data Complete course data
 * @returns Promise that resolves when publish is complete
 */
export async function publishCourse(data: {
  courseTitle: string
  courseSummary: string
  modules: Module[]
  learningObjectives: LearningObjective[]
  skills: Skill[]
  learningObjects: LearningObject[]
}): Promise<{ id: string; publishedAt: string }> {
  console.log('Publishing course:', data.courseTitle)
  
  // Simulate API call with delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "course-" + Date.now(),
        publishedAt: new Date().toISOString()
      })
    }, 3000)
  })
}
