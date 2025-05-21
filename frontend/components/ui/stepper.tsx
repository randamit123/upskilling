"use client"

import React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StepperProps {
  steps: {
    id: string
    label: string
    description?: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  activeStep: number
  onStepClick?: (step: number) => void
  orientation?: "horizontal" | "vertical"
  className?: string
}

export function Stepper({
  steps,
  activeStep,
  onStepClick,
  orientation = "horizontal",
  className,
}: StepperProps) {
  return (
    <div
      className={cn(
        "w-full",
        orientation === "vertical" ? "flex flex-col space-y-4" : "flex justify-between",
        className
      )}
    >
      {steps.map((step, index) => {
        const isActive = activeStep === index
        const isCompleted = activeStep > index
        
        return (
          <div
            key={step.id}
            className={cn(
              "relative flex",
              orientation === "vertical" ? "items-start" : "flex-col items-center",
              index !== steps.length - 1 && orientation === "horizontal" && "w-full"
            )}
          >
            <div className="flex items-center">
              <button
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 bg-background text-muted-foreground"
                )}
                onClick={() => onStepClick && isCompleted ? onStepClick(index) : null}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${index + 1}: ${step.label}`}
                disabled={!isCompleted && !isActive}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : step.icon ? (
                  <step.icon className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>
              
              {index !== steps.length - 1 && orientation === "horizontal" && (
                <div 
                  className={cn(
                    "mx-2 h-[2px] flex-1",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                  )} 
                  aria-hidden="true"
                />
              )}
            </div>
            
            <div
              className={cn(
                "mt-2 text-center",
                orientation === "vertical" ? "ml-4" : "w-full max-w-[120px]"
              )}
            >
              <div 
                className={cn(
                  "text-sm font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </div>
              
              {step.description && (
                <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {step.description}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export interface StepperContentProps {
  steps: {
    id: string
    content: React.ReactNode
  }[]
  activeStep: number
  className?: string
}

export function StepperContent({ 
  steps, 
  activeStep, 
  className 
}: StepperContentProps) {
  const activeContent = steps[activeStep]?.content

  return (
    <div 
      className={cn("mt-6", className)}
      role="region"
      aria-label={`Step ${activeStep + 1} content`}
    >
      {activeContent}
    </div>
  )
}
