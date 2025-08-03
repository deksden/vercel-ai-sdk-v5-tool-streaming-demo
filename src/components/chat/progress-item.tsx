import { CheckCircle2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { ProgressStep } from '@/types/chat'

interface ProgressItemProps {
  step: ProgressStep
}

export function ProgressItem({ step }: ProgressItemProps) {
  const getIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'in-progress':
        return <Spinner size="sm" className="h-4 w-4" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
    }
  }

  const getTimeInfo = () => {
    if (step.status === 'completed' && step.startTime && step.endTime) {
      const duration = ((step.endTime - step.startTime) / 1000).toFixed(1)
      return `(${duration}s)`
    }
    return ''
  }

  return (
    <div className="flex items-start gap-3 py-1.5" data-testid={`progress-step-${step.id}`}>
      <div className="flex-shrink-0 pt-0.5" data-testid={`step-icon-${step.id}`}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <span
            className={cn(
              "text-xs break-words leading-relaxed",
              step.status === 'completed' && "text-foreground/90",
              step.status === 'in-progress' && "text-foreground font-medium",
              step.status === 'pending' && "text-muted-foreground/60"
            )}
            data-testid={`step-title-${step.id}`}
          >
            {step.title}
          </span>
          {step.status === 'completed' && (
            <span className="text-xs font-mono text-muted-foreground ml-2 opacity-70" data-testid={`step-time-${step.id}`}>
              {getTimeInfo()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}