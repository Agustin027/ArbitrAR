import * as React from "react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    max?: number
    className?: string
  }
>(({ className, value, max = 100, ...props }, ref) => {
  const percentage = value != null ? (value / max) * 100 : 0

  return (
    <div
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-slate-800", className)}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 transition-all"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
