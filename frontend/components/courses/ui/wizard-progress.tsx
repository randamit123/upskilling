interface WizardProgressProps {
  currentStep: number
  totalSteps: number
}

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="w-full mt-4">
      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-300 ease-in-out" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
    </div>
  )
}
