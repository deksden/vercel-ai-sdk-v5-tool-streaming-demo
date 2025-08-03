import { tool, type UIMessageStreamWriter } from 'ai'
import { sampleCreateToolSchema, type SampleCreateToolInput, type ProgressStep, type MyUIMessage } from '@/types/chat'

// Helper function to simulate work with delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Define steps based on complexity
const getStepsForComplexity = (complexity: SampleCreateToolInput['complexity'], projectName: string): ProgressStep[] => {
  const baseSteps = [
    { id: '1', title: `Initializing ${projectName} project structure`, status: 'pending' as const },
    { id: '2', title: 'Setting up development environment', status: 'pending' as const },
    { id: '3', title: 'Installing dependencies', status: 'pending' as const },
  ]

  const additionalSteps = {
    simple: [],
    medium: [
      { id: '4', title: 'Configuring build tools', status: 'pending' as const },
      { id: '5', title: 'Setting up testing framework', status: 'pending' as const },
    ],
    complex: [
      { id: '4', title: 'Configuring build tools', status: 'pending' as const },
      { id: '5', title: 'Setting up testing framework', status: 'pending' as const },
      { id: '6', title: 'Implementing CI/CD pipeline', status: 'pending' as const },
      { id: '7', title: 'Setting up monitoring and logging', status: 'pending' as const },
    ]
  }

  return [...baseSteps, ...additionalSteps[complexity]]
}

// Original non-streaming tool (kept for backward compatibility)
export const sampleCreateTool = tool({
  description: 'Create a sample project with multi-step progress tracking. This tool simulates a long-running project creation process with real-time updates.',
  inputSchema: sampleCreateToolSchema,
  execute: async ({ projectName, complexity }) => {
    const steps = getStepsForComplexity(complexity, projectName)
    const totalStartTime = Date.now()
    
    console.log(`Starting ${projectName} project creation with ${complexity} complexity`)
    
    // Simulate step-by-step execution
    const completedSteps: ProgressStep[] = [...steps]
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const stepStartTime = Date.now()
      
      console.log(`Step ${i + 1}/${steps.length}: ${step.title} - STARTED`)
      
      // Update step to in-progress
      completedSteps[i] = { ...step, status: 'in-progress' as const, startTime: stepStartTime }
      
      // Simulate work time based on complexity (30% faster for testing)
      const workTime = {
        simple: 700 + Math.random() * 350, // 0.7-1.05 seconds (was 1-1.5)
        medium: 1050 + Math.random() * 350, // 1.05-1.4 seconds (was 1.5-2)  
        complex: 1400 + Math.random() * 700, // 1.4-2.1 seconds (was 2-3)
      }[complexity]
      
      await delay(workTime)
      
      // Update step to completed
      const stepEndTime = Date.now()
      completedSteps[i] = { ...completedSteps[i], status: 'completed' as const, endTime: stepEndTime }
      
      console.log(`Step ${i + 1}/${steps.length}: ${step.title} - COMPLETED (${((stepEndTime - stepStartTime) / 1000).toFixed(1)}s)`)
    }
    
    const totalEndTime = Date.now()
    const totalTimeSeconds = ((totalEndTime - totalStartTime) / 1000).toFixed(1)
    
    console.log(`Project ${projectName} creation completed in ${totalTimeSeconds}s`)
    
    return {
      success: true,
      projectName,
      complexity,
      steps: completedSteps,
      totalTimeSeconds,
      message: `Successfully created ${projectName} project (${complexity} complexity) in ${totalTimeSeconds} seconds!`,
    }
  },
})

// Streaming version that sends progress updates to the client
export const sampleCreateStreamingTool = (writer: UIMessageStreamWriter<MyUIMessage>) => tool({
  description: 'Create a sample project with multi-step progress tracking and real-time streaming updates. This tool simulates a long-running project creation process with live progress updates sent to the client.',
  inputSchema: sampleCreateToolSchema,
  execute: async ({ projectName, complexity }, { toolCallId }) => {
    const steps = getStepsForComplexity(complexity, projectName)
    const totalStartTime = Date.now()
    
    console.log(`[STREAMING] Starting ${projectName} project creation with ${complexity} complexity`)
    
    // Send initial progress update
    writer.write({
      type: 'data-toolProgress',
      id: toolCallId,
      data: {
        toolCallId,
        projectName,
        complexity,
        currentStep: 0,
        totalSteps: steps.length,
        steps: steps,
        status: 'started',
      }
    })
    
    // Simulate step-by-step execution with streaming updates
    const completedSteps: ProgressStep[] = [...steps]
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const stepStartTime = Date.now()
      
      console.log(`[STREAMING] Step ${i + 1}/${steps.length}: ${step.title} - STARTED`)
      
      // Update step to in-progress and send to client
      completedSteps[i] = { ...step, status: 'in-progress' as const, startTime: stepStartTime }
      
      writer.write({
        type: 'data-toolProgress',
        id: toolCallId,
        data: {
          toolCallId,
          projectName,
          complexity,
          currentStep: i + 1,
          totalSteps: steps.length,
          steps: [...completedSteps],
          status: 'in-progress',
        }
      })
      
      // Simulate work time based on complexity (30% faster for testing)
      const workTime = {
        simple: 700 + Math.random() * 350, // 0.7-1.05 seconds (was 1-1.5)
        medium: 1050 + Math.random() * 350, // 1.05-1.4 seconds (was 1.5-2)  
        complex: 1400 + Math.random() * 700, // 1.4-2.1 seconds (was 2-3)
      }[complexity]
      
      await delay(workTime)
      
      // Update step to completed and send to client
      const stepEndTime = Date.now()
      completedSteps[i] = { ...completedSteps[i], status: 'completed' as const, endTime: stepEndTime }
      
      console.log(`[STREAMING] Step ${i + 1}/${steps.length}: ${step.title} - COMPLETED (${((stepEndTime - stepStartTime) / 1000).toFixed(1)}s)`)
      
      writer.write({
        type: 'data-toolProgress',
        id: toolCallId,
        data: {
          toolCallId,
          projectName,
          complexity,
          currentStep: i + 1,
          totalSteps: steps.length,
          steps: [...completedSteps],
          status: 'in-progress',
        }
      })
    }
    
    const totalEndTime = Date.now()
    const totalTimeSeconds = ((totalEndTime - totalStartTime) / 1000).toFixed(1)
    
    console.log(`[STREAMING] Project ${projectName} creation completed in ${totalTimeSeconds}s`)
    
    // Send final completion update
    writer.write({
      type: 'data-toolProgress',
      id: toolCallId,
      data: {
        toolCallId,
        projectName,
        complexity,
        currentStep: steps.length,
        totalSteps: steps.length,
        steps: completedSteps,
        status: 'completed',
        totalTimeSeconds,
      }
    })
    
    return {
      success: true,
      projectName,
      complexity,
      steps: completedSteps,
      totalTimeSeconds,
      message: `Successfully created ${projectName} project (${complexity} complexity) in ${totalTimeSeconds} seconds!`,
    }
  },
})