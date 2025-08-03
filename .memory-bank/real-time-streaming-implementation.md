# Real-Time Tool Progress Streaming Implementation Guide

**📚 Languages:** [English](real-time-streaming-implementation.md) | [Русский](real-time-streaming-implementation_ru.md)

## Technical Solution for Real-Time Tool Progress Streaming in AI SDK v5

This document describes the complete implementation of real-time streaming of tool execution progress from server to client using Vercel AI SDK v5 beta.

---

## 🎯 Core Concept

**Problem**: Standard AI SDK tools send only initial and final states, users don't see intermediate progress of long-running operations.

**Solution**: Using `createUIMessageStream` with custom `data parts` for streaming intermediate progress updates in real-time.

---

## 🏗️ Solution Architecture

### 1. Server-Side Streaming (API Route)

**File**: `src/app/api/chat/route.ts`

```typescript
import { 
  streamText, 
  convertToModelMessages, 
  createUIMessageStream, 
  createUIMessageStreamResponse 
} from 'ai'
import { sampleCreateStreamingTool } from '@/lib/tools'
import type { MyUIMessage } from '@/types/chat'

export async function POST(req: Request) {
  const { messages }: { messages: MyUIMessage[] } = await req.json()
  const convertedMessages = convertToModelMessages(messages)

  // 🎯 Key part: createUIMessageStream with writer
  const stream = createUIMessageStream<MyUIMessage>({
    execute: ({ writer }) => {
      const result = streamText({
        model: google('gemini-2.5-flash'),
        messages: convertedMessages,
        tools: {
          // Pass writer to tool for sending progress updates
          sampleCreateStreamingTool: sampleCreateStreamingTool(writer),
        },
      })
      
      // Merge standard AI stream with our custom data
      writer.merge(result.toUIMessageStream())
    }
  })
  
  // Return streaming response
  return createUIMessageStreamResponse({ stream })
}
```

**Key Points:**
- `createUIMessageStream<MyUIMessage>` - creates stream with custom data types
- `writer` - object for sending progress updates in real-time
- `writer.merge()` - combines standard AI stream with custom data
- `createUIMessageStreamResponse()` - proper way to return streaming response

### 2. Streaming Tool Implementation

**File**: `src/lib/tools.ts`

```typescript
export const sampleCreateStreamingTool = (writer: any) => tool({
  description: 'Create a sample project with real-time streaming updates',
  inputSchema: sampleCreateToolSchema,
  execute: async ({ projectName, complexity }, { toolCallId }) => {
    const steps = getStepsForComplexity(complexity, projectName)
    
    // 📡 Send initial state
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
    
    // 🔄 Step-by-step execution with real-time updates
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const stepStartTime = Date.now()
      
      // Update step as "in-progress"
      completedSteps[i] = { ...step, status: 'in-progress', startTime: stepStartTime }
      
      // 📡 Send intermediate update
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
      
      // Simulate work
      await delay(workTime)
      
      // Mark step as completed
      const stepEndTime = Date.now()
      completedSteps[i] = { ...completedSteps[i], status: 'completed', endTime: stepEndTime }
      
      // 📡 Send step completion update
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
    
    // 📡 Final update
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
        totalTimeSeconds: totalTimeSeconds,
      }
    })
    
    return { /* standard tool result */ }
  },
})
```

**Key Points:**
- `writer.write()` - sends data part to client in real-time
- `type: 'data-toolProgress'` - custom data type for progress
- `id: toolCallId` - unique identifier for linking updates
- Multiple `writer.write()` calls for each progress stage

### 3. TypeScript Type Definitions

**File**: `src/types/chat.ts`

```typescript
import { UIMessage } from 'ai'

// 🎯 Custom UIMessage type with data parts for progress
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

export interface ProgressStep {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed'
  startTime?: number
  endTime?: number
}
```

**Key Points:**
- Extending `UIMessage` with custom data parts
- Typing `toolProgress` for progress updates
- Full typing for TypeScript safety

### 4. Client-Side Streaming Handling

**File**: `src/components/chat/chat-interface.tsx`

```typescript
import { useChat } from '@ai-sdk/react'
import type { MyUIMessage } from '@/types/chat'

export function ChatInterface() {
  const [toolProgresses, setToolProgresses] = useState<Record<string, ToolProgress>>({})

  const { messages, sendMessage, status } = useChat<MyUIMessage>({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    
    // 🎯 Key part: handling streaming data parts
    onData: (dataPart) => {
      console.log('=== Received data part ===', dataPart)
      
      if (dataPart.type === 'data-toolProgress') {
        const progress = dataPart.data
        console.log('Tool progress update:', progress)
        
        // 🔄 Update progress state in real-time
        setToolProgresses(prev => ({
          ...prev,
          [progress.toolCallId]: {
            toolCallId: progress.toolCallId,
            steps: progress.steps,
            totalStartTime: Date.now(),
            projectName: progress.projectName,
            complexity: progress.complexity,
            totalEndTime: progress.status === 'completed' ? Date.now() : undefined
          }
        }))
      }
    }
  })

  return (
    // UI components display toolProgresses in real-time
    <MessageList messages={messages} toolProgresses={toolProgresses} />
  )
}
```

**Key Points:**
- `useChat<MyUIMessage>` - typed hook with custom data parts
- `onData` callback - handles all streaming data parts
- `dataPart.type === 'data-toolProgress'` - filtering progress updates
- `toolProgresses` state updates in real-time

### 5. UI Components for Progress Display

**File**: `src/components/chat/message-list.tsx`

```typescript
export function MessageList({ messages, toolProgresses }: MessageListProps) {
  return (
    <div className="p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="space-y-4">
          {message.role === 'assistant' && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground px-4 py-2 rounded-lg">
                {message.parts.map((part, index) => {
                  // 🎯 Handle custom data parts
                  if (part.type === 'data-toolProgress') {
                    return (
                      <div key={index} className="mt-2">
                        <ToolProgress progress={part.data} />
                      </div>
                    )
                  }
                  // ... handle other part types
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

---

## 🔄 Data Flow

```
1. [Client] Sends message through useChat
              ↓
2. [Server] API route receives request
              ↓
3. [Server] createUIMessageStream creates stream with writer
              ↓
4. [Server] streamText calls sampleCreateStreamingTool(writer)
              ↓
5. [Tool] Starts execution, calls writer.write() for each stage
              ↓
6. [Server] writer sends data parts to client in real-time
              ↓
7. [Client] onData callback receives each data part
              ↓
8. [Client] setToolProgresses updates UI state
              ↓
9. [Client] UI components re-render with new progress
              ↓
10. [User] Sees live progress updates in real-time! 🎉
```

---

## 📡 Streaming Data Format

### Server sends:
```typescript
writer.write({
  type: 'data-toolProgress',        // Custom data type
  id: 'w83GXlGuKYfHPJyt',          // toolCallId for linking
  data: {
    toolCallId: 'w83GXlGuKYfHPJyt',
    projectName: 'FinalTest',
    complexity: 'simple',
    currentStep: 2,                 // Current executing stage
    totalSteps: 3,                  // Total number of stages
    steps: [
      {
        id: '1',
        title: 'Initializing project structure',
        status: 'completed',         // 'pending' | 'in-progress' | 'completed'
        startTime: 1754051008223,
        endTime: 1754051009667
      },
      {
        id: '2', 
        title: 'Setting up development environment',
        status: 'in-progress',       // Current active stage
        startTime: 1754051009668
      },
      {
        id: '3',
        title: 'Installing dependencies', 
        status: 'pending'            // Not started yet
      }
    ],
    status: 'in-progress',           // Overall status: 'started' | 'in-progress' | 'completed'
    totalTimeSeconds: undefined     // Filled when completed
  }
})
```

### Client receives:
```typescript
onData: (dataPart) => {
  // dataPart.type === 'data-toolProgress'
  // dataPart.id === 'w83GXlGuKYfHPJyt'  
  // dataPart.data === { /* object above */ }
}
```

---

## 📊 Debugging and Monitoring

### Server-side logs:
```
[STREAMING] Starting FinalTest project creation with simple complexity
[STREAMING] Step 1/3: Initializing FinalTest project structure - STARTED
[STREAMING] Step 1/3: Initializing FinalTest project structure - COMPLETED (1.4s)
[STREAMING] Step 2/3: Setting up development environment - STARTED
[STREAMING] Step 2/3: Setting up development environment - COMPLETED (1.3s)
[STREAMING] Step 3/3: Installing dependencies - STARTED
[STREAMING] Step 3/3: Installing dependencies - COMPLETED (1.1s)
[STREAMING] Project FinalTest creation completed in 3.9s
```

### Client-side logs:
```
=== Received data part === {type: data-toolProgress, id: w83GXlGuKYfHPJyt, ...}
Tool progress update: {toolCallId: w83GXlGuKYfHPJyt, projectName: FinalTest, ...}
Tool progresses: {w83GXlGuKYfHPJyt: Object}
```

---

## 🎯 Key Implementation Features

### ✅ What works:
1. **Real-time streaming**: Updates sent immediately when state changes
2. **Type safety**: Full TypeScript typing for all data parts
3. **State reconciliation**: Same `id` allows updating existing data parts
4. **Error handling**: Graceful fallback when streaming errors occur
5. **Performance**: Efficient transmission of only changed data

### 🔧 Technical details:
- **Return method**: `createUIMessageStreamResponse({ stream })` - correct way for AI SDK v5
- **Writer usage**: Tool accepts `writer` as parameter for sending updates
- **Data part naming**: `type: 'data-toolProgress'` - naming convention
- **ID management**: `toolCallId` used as unique identifier
- **State updates**: `writer.write()` can be called multiple times for same `id`

---

## 📚 Documentation References

### AI SDK v5 Documentation:
- [AI SDK 5 Beta Announcement](https://ai-sdk.dev/docs/announcing-ai-sdk-5-beta)
- [Streaming Data Guide](https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data)
- [Message Metadata](https://ai-sdk.dev/docs/ai-sdk-ui/message-metadata)
- [Generative User Interfaces](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces)
- [Tools and Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)
- [useChat Reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
- [AI SDK v5 Beta useChat](https://v5.ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
- [Stream Object Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-object)

### Key API Methods:
- `createUIMessageStream<T>()` - create custom UI message stream
- `createUIMessageStreamResponse()` - return streaming response
- `writer.write()` - send custom data parts
- `writer.merge()` - merge streams
- `useChat<T>()` - typed chat hook
- `onData` callback - streaming data parts handler

---

## 🎉 Result

Complete implementation of real-time tool progress streaming:
- ✅ Users see live progress updates
- ✅ Each stage displayed with real execution time  
- ✅ Seamless integration with AI SDK v5 beta
- ✅ Type-safe implementation with TypeScript
- ✅ Scalable architecture for any long-running operations

**This implementation demonstrates cutting-edge capabilities of modern AI applications with real-time user experience!** 🚀