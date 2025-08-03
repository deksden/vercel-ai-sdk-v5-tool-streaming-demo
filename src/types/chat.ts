import { z } from 'zod'
import { UIMessage } from 'ai'

export interface ProgressStep {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed'
  startTime?: number
  endTime?: number
}

export interface ToolProgress {
  toolCallId: string
  steps: ProgressStep[]
  totalStartTime: number
  totalEndTime?: number
  projectName: string
  complexity: 'simple' | 'medium' | 'complex'
}

export const sampleCreateToolSchema = z.object({
  projectName: z.string().describe('Name of the project to create'),
  complexity: z.enum(['simple', 'medium', 'complex']).describe('Complexity level of the project'),
})

export type SampleCreateToolInput = z.infer<typeof sampleCreateToolSchema>

// Custom UI Message type with tool progress data parts
export type MyUIMessage = UIMessage<
  never,
  {
    toolProgress: {
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
>