import { ProgressItem } from './progress-item'
import { CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import type { ToolProgress, ProgressStep } from '@/types/chat'

interface ToolProgressProps {
  progress: ToolProgress | {
    toolCallId: string
    projectName: string
    complexity: 'simple' | 'medium' | 'complex'
    currentStep: number
    totalSteps: number
    steps: ProgressStep[]
    status: 'started' | 'in-progress' | 'completed'
    totalTimeSeconds?: string
  }
}

export function ToolProgress({ progress }: ToolProgressProps) {
  const { t, language } = useLanguage()
  
  const getTotalTime = () => {
    // Новый формат с totalTimeSeconds
    if ('totalTimeSeconds' in progress && progress.totalTimeSeconds) {
      return progress.totalTimeSeconds
    }
    // Старый формат с totalEndTime
    if ('totalEndTime' in progress && progress.totalEndTime && 'totalStartTime' in progress) {
      return ((progress.totalEndTime - progress.totalStartTime) / 1000).toFixed(1)
    }
    return null
  }

  const completedSteps = progress.steps.filter(step => step.status === 'completed').length
  const totalSteps = progress.steps.length
  
  const getStatusText = () => {
    if ('status' in progress) {
      switch (progress.status) {
        case 'completed': 
          return t('progress.projectCreated', { projectName: progress.projectName })
        case 'in-progress': 
          return t('progress.creatingProject', { projectName: progress.projectName })
        case 'started': 
          return t('progress.startingProject', { projectName: progress.projectName })
        default: 
          return t('progress.creatingProject', { projectName: progress.projectName })
      }
    }
    return t('progress.creatingProject', { projectName: progress.projectName })
  }

  const getMainStatusIcon = () => {
    if ('status' in progress) {
      switch (progress.status) {
        case 'completed': 
          return <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
        case 'in-progress': 
          return <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
        case 'started': 
          return <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
        default: 
          return <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30" />
      }
    }
    return completedSteps === totalSteps ? 
      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
        <CheckCircle2 className="h-4 w-4 text-white" />
      </div> : 
      <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
        <div className="h-2 w-2 rounded-full bg-white" />
      </div>
  }

  return (
    <div className="w-full max-w-lg bg-muted/30 rounded-lg p-4" data-testid="tool-progress">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4" data-testid="tool-progress-header">
        <div className="flex-shrink-0" data-testid="status-icon">{getMainStatusIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground" data-testid="status-text" suppressHydrationWarning>
            {getStatusText()}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1" data-testid="progress-metadata">
            <span className="capitalize" suppressHydrationWarning>
              {language === 'en' 
                ? `${t(`progress.complexity.${progress.complexity}`)} complexity`
                : t(`progress.complexity.${progress.complexity}`)
              }
            </span>
            <span>•</span>
            <span suppressHydrationWarning>{completedSteps}/{totalSteps} {t('progress.steps')}</span>
            {'status' in progress && progress.status === 'in-progress' && (
              <>
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400" suppressHydrationWarning>{t('progress.inProgress')}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Steps */}
      <div className="space-y-1" data-testid="progress-steps">
        {progress.steps.map((step) => (
          <ProgressItem key={step.id} step={step} />
        ))}
      </div>
      
      {/* Total time at bottom */}
      {getTotalTime() && (
        <>
          <div className="border-t border-border/30 my-3"></div>
          <div className="text-center">
            <span className="text-sm text-muted-foreground" suppressHydrationWarning>{t('progress.executionTime')} </span>
            <span className="text-sm font-mono font-semibold text-primary" data-testid="execution-time">{getTotalTime()}s</span>
          </div>
        </>
      )}
    </div>
  )
}