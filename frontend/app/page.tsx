import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/layout/page-header"
import {
  BookOpen,
  FileText,
  ClipboardList,
  Route,
  Users,
  FileCheck,
  Database,
  Tags,
  Mail,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

export default function Home() {
  const modules = [
    {
      title: "Course Development",
      description: "Create and manage comprehensive learning courses",
      icon: BookOpen,
      href: "/courses",
      color: "bg-purple-100 dark:bg-purple-950",
    },
    {
      title: "Microlearning Modules",
      description: "Develop bite-sized learning content",
      icon: FileText,
      href: "/microlearning",
      color: "bg-blue-100 dark:bg-blue-950",
    },
    {
      title: "Evaluation Survey Builder",
      description: "Create surveys to gather feedback",
      icon: ClipboardList,
      href: "/survey",
      color: "bg-green-100 dark:bg-green-950",
    },
    {
      title: "Skills-Based Learning Paths",
      description: "Design learning journeys based on skills",
      icon: Route,
      href: "/learning-path",
      color: "bg-yellow-100 dark:bg-yellow-950",
    },
    {
      title: "Role-Specific Paths",
      description: "Create learning paths for specific roles",
      icon: Users,
      href: "/roles",
      color: "bg-orange-100 dark:bg-orange-950",
    },
    {
      title: "Assessment Generation",
      description: "Generate assessments from course content",
      icon: FileCheck,
      href: "/assessments",
      color: "bg-red-100 dark:bg-red-950",
    },
    {
      title: "Internal Knowledge Extraction",
      description: "Extract knowledge from internal documents",
      icon: Database,
      href: "/knowledge",
      color: "bg-indigo-100 dark:bg-indigo-950",
    },
    {
      title: "Content Tagging & Mapping",
      description: "Tag and map content to skills",
      icon: Tags,
      href: "/tagging",
      color: "bg-pink-100 dark:bg-pink-950",
    },
    {
      title: "Learner Communications",
      description: "Communicate with learners",
      icon: Mail,
      href: "/comms",
      color: "bg-teal-100 dark:bg-teal-950",
    },
    {
      title: "Training Impact Summarization",
      description: "Analyze and report on training impact",
      icon: BarChart3,
      href: "/impact",
      color: "bg-cyan-100 dark:bg-cyan-950",
    },
  ]

  return (
    <>
      <PageHeader
        title="Leidos Upskilling Hub Workshop"
        description="Create, curate, and communicate learning experiences"
        actions={<Button>Get Started</Button>}
      />
      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="modules" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <Link href={module.href} key={module.title} className="group">
                <Card className="h-full transition-all hover:shadow-md">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className={`rounded-md p-2 ${module.color}`}>
                      <module.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary">{module.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{module.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="recent">
          <div className="rounded-md border p-6 text-center">
            <h3 className="text-lg font-medium">No recent activity</h3>
            <p className="text-sm text-muted-foreground mt-1">Your recent activity will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
