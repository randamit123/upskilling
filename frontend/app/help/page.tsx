import { PageHeader } from "@/components/layout/page-header"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title="Help & Support" 
        description="Find answers to common questions and get support"
      />
      
      <div className="max-w-3xl mx-auto mt-6">
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input 
            type="search"
            className="pl-10" 
            placeholder="Search for help topics..." 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Getting Started</CardTitle>
              <CardDescription>Learn the basics of the Upskilling Hub</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="text-primary hover:underline cursor-pointer">Platform Overview</li>
                <li className="text-primary hover:underline cursor-pointer">Creating Your Profile</li>
                <li className="text-primary hover:underline cursor-pointer">Navigating the Dashboard</li>
                <li className="text-primary hover:underline cursor-pointer">Finding Learning Content</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Course Development</CardTitle>
              <CardDescription>Help with creating and managing courses</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="text-primary hover:underline cursor-pointer">Creating a New Course</li>
                <li className="text-primary hover:underline cursor-pointer">Adding Course Content</li>
                <li className="text-primary hover:underline cursor-pointer">Managing Course Modules</li>
                <li className="text-primary hover:underline cursor-pointer">Publishing Your Course</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Assessments & Surveys</CardTitle>
              <CardDescription>Help with creating evaluations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="text-primary hover:underline cursor-pointer">Creating Assessments</li>
                <li className="text-primary hover:underline cursor-pointer">Building Surveys</li>
                <li className="text-primary hover:underline cursor-pointer">Viewing Results</li>
                <li className="text-primary hover:underline cursor-pointer">Analyzing Feedback</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Technical Support</CardTitle>
              <CardDescription>Get help with technical issues</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="text-primary hover:underline cursor-pointer">Account Access Issues</li>
                <li className="text-primary hover:underline cursor-pointer">Browser Compatibility</li>
                <li className="text-primary hover:underline cursor-pointer">Content Not Loading</li>
                <li className="text-primary hover:underline cursor-pointer">Contact IT Support</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="mb-8">
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I enroll in a course?</AccordionTrigger>
            <AccordionContent>
              To enroll in a course, navigate to the course catalog, find the course you're interested in, and click the "Enroll" button. You'll immediately gain access to all course materials and can track your progress through your personal dashboard.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>How do I track my learning progress?</AccordionTrigger>
            <AccordionContent>
              Your learning progress is automatically tracked in your dashboard. You can view completion percentages for each course, see your assessment results, and track your learning pathway progress. Visit your profile page to see a comprehensive overview of your learning journey.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>How do I create a new course?</AccordionTrigger>
            <AccordionContent>
              To create a new course, navigate to the Course Development section and click "Create New Course." Follow the step-by-step wizard to define your course structure, add content modules, create assessments, and set completion criteria. Once finished, you can preview and publish your course for learners.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger>Can I export my certificates or completion data?</AccordionTrigger>
            <AccordionContent>
              Yes, you can export certificates for completed courses directly from your profile page. Click on the "Certificates" tab, select the certificates you wish to export, and choose your preferred format (PDF or image). You can also generate a comprehensive report of all your learning activities from the Reports section.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger>How do I connect my learning to my role path?</AccordionTrigger>
            <AccordionContent>
              In your profile settings, you can associate your current role and career aspirations. The system will automatically suggest relevant learning paths and courses aligned with your professional development goals. You can also manually add specific courses to your personal learning path from any course page.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Still Need Help?</CardTitle>
            <CardDescription>
              Contact our support team for personalized assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Call Support</h3>
                  <p className="text-sm text-muted-foreground">Available Mon-Fri, 9am-5pm ET</p>
                  <p className="text-sm font-medium">+1 (800) 555-1234</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Email Support</h3>
                  <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
                  <p className="text-sm font-medium">upskilling-support@leidos.com</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Submit a Support Ticket</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Provide details about your issue and we'll get back to you as soon as possible.
              </p>
              <Button className="w-full">Create Support Ticket</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
