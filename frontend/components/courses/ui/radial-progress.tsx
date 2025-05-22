interface RadialProgressProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function RadialProgress({ progress, size = 36, strokeWidth = 3, className = "" }: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-300 ease-in-out"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          opacity={0.2}
          className="text-muted-foreground"
        />
      </svg>
      <span className="absolute text-xs font-medium">{Math.round(progress)}%</span>
    </div>
  )
}
