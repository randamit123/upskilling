import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  department: string
  avatar?: string
  role: string
  contentExpertise: string // Primary content expertise area
  topicsOfInterest: string[] // Areas they create content for
  createdCourses: string[] // Courses they've created
  draftCourses: string[] // Courses in development
  authoredContent: {
    id: string
    name: string
    type: string // Course, Microlearning, Assessment, etc.
    creationDate: string
    lastUpdated: string
  }[]
  skills: {
    name: string
    level: number // 1-5
  }[]
  contentGoals: string[] // Content development goals
  learningStyle?: string // Visual, Auditory, Reading, Kinesthetic
  theme?: string // User interface theme preference
}

interface UserProfileState {
  profile: UserProfile
  isLoading: boolean
  error: string | null
  updateProfile: (profile: Partial<UserProfile>) => void
  updateSkill: (skillName: string, level: number) => void
  addTopicOfInterest: (topic: string) => void
  removeTopicOfInterest: (topic: string) => void
  addContentGoal: (goal: string) => void
  removeContentGoal: (goal: string) => void
}

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set) => ({
      profile: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@leidos.com",
        department: "Upskilling Hub",
        role: "Learning Experience Designer",
        contentExpertise: "Instructional Design",
        topicsOfInterest: ["AI/ML", "Cloud", "Cybersecurity"],
        createdCourses: ["intro-to-ml", "cloud-fundamentals"],
        draftCourses: ["advanced-cybersecurity"],
        authoredContent: [
          {
            id: "course-001",
            name: "Machine Learning Fundamentals",
            type: "Course",
            creationDate: "2024-03-15",
            lastUpdated: "2024-05-10",
          },
          {
            id: "micro-002",
            name: "Cloud Security Basics",
            type: "Microlearning",
            creationDate: "2024-01-10",
            lastUpdated: "2024-01-15",
          },
          {
            id: "assess-003",
            name: "Cybersecurity Assessment",
            type: "Assessment",
            creationDate: "2024-02-20",
            lastUpdated: "2024-04-05",
          }
        ],
        skills: [
          { name: "Content Creation", level: 4 },
          { name: "Instructional Design", level: 3 },
          { name: "Data Analysis", level: 2 }
        ],
        contentGoals: ["Master AI course development", "Create advanced assessment modules"]
      },
      isLoading: false,
      error: null,
      updateProfile: (updatedProfile) => 
        set((state) => ({ 
          profile: { ...state.profile, ...updatedProfile } 
        })),
      updateSkill: (skillName: string, level: number) =>
        set((state) => ({
          profile: {
            ...state.profile,
            skills: state.profile.skills.map(skill => 
              skill.name === skillName ? { ...skill, level } : skill
            )
          }
        })),
      addTopicOfInterest: (topic: string) =>
        set((state) => ({
          profile: {
            ...state.profile,
            topicsOfInterest: [...state.profile.topicsOfInterest, topic]
          }
        })),
      removeTopicOfInterest: (topic: string) =>
        set((state) => ({
          profile: {
            ...state.profile,
            topicsOfInterest: state.profile.topicsOfInterest.filter(t => t !== topic)
          }
        })),
      addContentGoal: (goal: string) =>
        set((state) => ({
          profile: {
            ...state.profile,
            contentGoals: [...state.profile.contentGoals, goal]
          }
        })),
      removeContentGoal: (goal: string) =>
        set((state) => ({
          profile: {
            ...state.profile,
            contentGoals: state.profile.contentGoals.filter(g => g !== goal)
          }
        })),
    }),
    {
      name: 'user-profile-storage',
    }
  )
)
