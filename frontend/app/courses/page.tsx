import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { CoursesDataTable } from "./courses-data-table"
import { Plus, BookOpen, Lightbulb, Users, Sparkles } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CoursesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Course Development"
        description="Create and manage comprehensive learning courses aligned with adult learning principles"
        actions={
          <Link href="/courses/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </Link>
        }
      />
      
      {/* Feature highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <BookOpen className="h-5 w-5 text-primary mb-2" />
            <CardTitle className="text-base">AI-Powered Outlines</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Auto-generate structured course outlines from uploaded content in minutes
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <Lightbulb className="h-5 w-5 text-primary mb-2" />
            <CardTitle className="text-base">Learning Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Map learning objectives to skills aligned with our skills taxonomy
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <Sparkles className="h-5 w-5 text-primary mb-2" />
            <CardTitle className="text-base">Interactive Storyboards</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Easily arrange learning objects with intuitive drag-and-drop
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <Users className="h-5 w-5 text-primary mb-2" />
            <CardTitle className="text-base">Adult Learning Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              All content follows proven adult learning principles for better outcomes
            </CardDescription>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-semibold tracking-tight mt-8">Your Courses</h2>
      <CoursesDataTable />
    </div>
  )
}
