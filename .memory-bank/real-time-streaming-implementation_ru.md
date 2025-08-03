# Real-Time Tool Progress Streaming Implementation Guide

**📚 Языки:** [English](real-time-streaming-implementation.md) | [Русский](real-time-streaming-implementation_ru.md)

## Техническое решение для реального времени стриминга прогресса инструментов в AI SDK v5

Этот документ описывает полную реализацию real-time streaming прогресса выполнения инструментов от сервера к клиенту с использованием Vercel AI SDK v5 beta.

---

## 🎯 Основная концепция

**Проблема**: Стандартные инструменты AI SDK отправляют только начальное и конечное состояние, пользователь не видит промежуточный прогресс длительных операций.

**Решение**: Использование `createUIMessageStream` с кастомными `data parts` для streaming промежуточных обновлений прогресса в реальном времени.

---

## 🏗️ Архитектура решения

### 1. Server-Side Streaming (API Route)

**Файл**: `src/app/api/chat/route.ts`

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

  // 🎯 Ключевая часть: createUIMessageStream с writer
  const stream = createUIMessageStream<MyUIMessage>({
    execute: ({ writer }) => {
      const result = streamText({
        model: google('gemini-2.5-flash'),
        messages: convertedMessages,
        tools: {
          // Передаем writer в инструмент для отправки progress updates
          sampleCreateStreamingTool: sampleCreateStreamingTool(writer),
        },
      })
      
      // Объединяем стандартный поток AI с нашими кастомными данными
      writer.merge(result.toUIMessageStream())
    }
  })
  
  // Возвращаем streaming response
  return createUIMessageStreamResponse({ stream })
}
```

**Ключевые моменты:**
- `createUIMessageStream<MyUIMessage>` - создает поток с кастомными типами данных
- `writer` - объект для отправки progress updates в реальном времени
- `writer.merge()` - объединяет стандартный AI поток с кастомными данными
- `createUIMessageStreamResponse()` - правильный способ возврата streaming response

### 2. Streaming Tool Implementation

**Файл**: `src/lib/tools.ts`

```typescript
export const sampleCreateStreamingTool = (writer: any) => tool({
  description: 'Create a sample project with real-time streaming updates',
  inputSchema: sampleCreateToolSchema,
  execute: async ({ projectName, complexity }, { toolCallId }) => {
    const steps = getStepsForComplexity(complexity, projectName)
    
    // 📡 Отправляем начальное состояние
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
    
    // 🔄 Пошаговое выполнение с real-time updates
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const stepStartTime = Date.now()
      
      // Обновляем шаг как "в процессе"
      completedSteps[i] = { ...step, status: 'in-progress', startTime: stepStartTime }
      
      // 📡 Отправляем промежуточное обновление
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
      
      // Симулируем работу
      await delay(workTime)
      
      // Отмечаем шаг как завершенный
      const stepEndTime = Date.now()
      completedSteps[i] = { ...completedSteps[i], status: 'completed', endTime: stepEndTime }
      
      // 📡 Отправляем обновление о завершении шага
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
    
    // 📡 Финальное обновление
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
    
    return { /* стандартный результат инструмента */ }
  },
})
```

**Ключевые моменты:**
- `writer.write()` - отправляет data part клиенту в реальном времени
- `type: 'data-toolProgress'` - кастомный тип данных для прогресса
- `id: toolCallId` - уникальный идентификатор для связывания обновлений
- Множественные `writer.write()` вызовы для каждого этапа прогресса

### 3. TypeScript Type Definitions

**Файл**: `src/types/chat.ts`

```typescript
import { UIMessage } from 'ai'

// 🎯 Кастомный UIMessage тип с data parts для прогресса
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

**Ключевые моменты:**
- Расширение `UIMessage` с кастомными data parts
- Типизация `toolProgress` для progress updates
- Полная типизация для TypeScript safety

### 4. Client-Side Streaming Handling

**Файл**: `src/components/chat/chat-interface.tsx`

```typescript
import { useChat } from '@ai-sdk/react'
import type { MyUIMessage } from '@/types/chat'

export function ChatInterface() {
  const [toolProgresses, setToolProgresses] = useState<Record<string, ToolProgress>>({})

  const { messages, sendMessage, status } = useChat<MyUIMessage>({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    
    // 🎯 Ключевая часть: обработка streaming data parts
    onData: (dataPart) => {
      console.log('=== Received data part ===', dataPart)
      
      if (dataPart.type === 'data-toolProgress') {
        const progress = dataPart.data
        console.log('Tool progress update:', progress)
        
        // 🔄 Обновляем состояние прогресса в реальном времени
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
    // UI компоненты отображают toolProgresses в реальном времени
    <MessageList messages={messages} toolProgresses={toolProgresses} />
  )
}
```

**Ключевые моменты:**
- `useChat<MyUIMessage>` - типизированный hook с кастомными data parts
- `onData` callback - обрабатывает все streaming data parts
- `dataPart.type === 'data-toolProgress'` - фильтрация progress updates
- Состояние `toolProgresses` обновляется в реальном времени

### 5. UI Components for Progress Display

**Файл**: `src/components/chat/message-list.tsx`

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
                  // 🎯 Обработка кастомных data parts
                  if (part.type === 'data-toolProgress') {
                    return (
                      <div key={index} className="mt-2">
                        <ToolProgress progress={part.data} />
                      </div>
                    )
                  }
                  // ... обработка других типов частей
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

## 🔄 Поток данных (Data Flow)

```
1. [Client] Отправляет сообщение через useChat
              ↓
2. [Server] API route получает запрос
              ↓
3. [Server] createUIMessageStream создает поток с writer
              ↓
4. [Server] streamText вызывает sampleCreateStreamingTool(writer)
              ↓
5. [Tool] Начинает выполнение, вызывает writer.write() для каждого этапа
              ↓
6. [Server] writer отправляет data parts клиенту в реальном времени
              ↓
7. [Client] onData callback получает каждый data part
              ↓
8. [Client] setToolProgresses обновляет UI state
              ↓
9. [Client] UI компоненты re-render с новым прогрессом
              ↓
10. [User] Видит live progress updates в реальном времени! 🎉
```

---

## 📡 Формат Streaming Data

### Server отправляет:
```typescript
writer.write({
  type: 'data-toolProgress',        // Тип кастомных данных
  id: 'w83GXlGuKYfHPJyt',          // toolCallId для связывания
  data: {
    toolCallId: 'w83GXlGuKYfHPJyt',
    projectName: 'FinalTest',
    complexity: 'simple',
    currentStep: 2,                 // Текущий выполняемый этап
    totalSteps: 3,                  // Общее количество этапов
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
        status: 'in-progress',       // Текущий активный этап
        startTime: 1754051009668
      },
      {
        id: '3',
        title: 'Installing dependencies', 
        status: 'pending'            // Еще не начат
      }
    ],
    status: 'in-progress',           // Общий статус: 'started' | 'in-progress' | 'completed'
    totalTimeSeconds: undefined     // Заполняется при завершении
  }
})
```

### Client получает:
```typescript
onData: (dataPart) => {
  // dataPart.type === 'data-toolProgress'
  // dataPart.id === 'w83GXlGuKYfHPJyt'  
  // dataPart.data === { /* object above */ }
}
```

---

## 📊 Отладка и мониторинг

### Server-side логи:
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

### Client-side логи:
```
=== Received data part === {type: data-toolProgress, id: w83GXlGuKYfHPJyt, ...}
Tool progress update: {toolCallId: w83GXlGuKYfHPJyt, projectName: FinalTest, ...}
Tool progresses: {w83GXlGuKYfHPJyt: Object}
```

---

## 🎯 Ключевые особенности реализации

### ✅ Что работает:
1. **Real-time streaming**: Обновления отправляются немедленно при изменении состояния
2. **Type safety**: Полная типизация TypeScript для всех data parts
3. **State reconciliation**: Одинаковый `id` позволяет обновлять существующие data parts
4. **Error handling**: Graceful fallback при ошибках streaming
5. **Performance**: Эффективная передача только измененных данных

### 🔧 Технические детали:
- **Метод возврата**: `createUIMessageStreamResponse({ stream })` - правильный способ для AI SDK v5
- **Writer usage**: Инструмент принимает `writer` как параметр для отправки updates
- **Data part naming**: `type: 'data-toolProgress'` - соглашение о наименовании
- **ID management**: `toolCallId` используется как уникальный идентификатор
- **State updates**: `writer.write()` можно вызывать много раз для одного `id`

---

## 📚 Ссылки на документацию

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
- `createUIMessageStream<T>()` - создание кастомного UI message stream
- `createUIMessageStreamResponse()` - возврат streaming response
- `writer.write()` - отправка кастомных data parts
- `writer.merge()` - объединение потоков
- `useChat<T>()` - типизированный chat hook
- `onData` callback - обработчик streaming data parts

---

## 🎉 Результат

Полная реализация real-time streaming прогресса инструментов:
- ✅ Пользователи видят live progress updates
- ✅ Каждый этап отображается с реальным временем выполнения  
- ✅ Seamless integration с AI SDK v5 beta
- ✅ Type-safe implementation с TypeScript
- ✅ Scalable архитектура для любых long-running операций

**Эта реализация демонстрирует передовые возможности современных AI-приложений с real-time user experience!** 🚀