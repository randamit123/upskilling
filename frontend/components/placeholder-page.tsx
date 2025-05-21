"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { Construction } from "lucide-react"

interface PlaceholderPageProps {
  title: string
  description: string
  features: string[]
}

export function PlaceholderPage({ title, description, features }: PlaceholderPageProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button variant="outline" disabled>
            Coming Soon
          </Button>
        }
      />
      
      <Card className="border-dashed border-2 border-muted-foreground/20">
        <CardHeader className="flex flex-row items-center gap-4">
          <Construction className="h-8 w-8 text-muted-foreground" />
          <div>
            <CardTitle>Under Development</CardTitle>
            <CardDescription>This page is currently being developed and will be available soon.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div>
              <h3 className="font-medium mb-2">Planned Features</h3>
              <ul className="list-disc pl-5 space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="text-muted-foreground">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-5">
          <p className="text-sm text-muted-foreground">Expected completion: Q3 2025</p>
        </CardFooter>
      </Card>
    </div>
  )
}
