# Next.js AI Chat with Multi-Step Tool Progress - Product Requirements Document (PRD)

## Project Overview

**Product Name**: AI Chat with Multi-Step Tool Progress  
**Version**: 1.0.0  
**Date**: 2025-08-01  
**Technology Stack**: Next.js 15.4, TypeScript, Vercel AI SDK v5 (beta), Google Generative AI, Tailwind CSS 4, shadcn/ui, pnpm

## Product Vision

Создать демонстрационное приложение чата с AI, которое показывает возможности Vercel AI SDK v5 (beta) для работы с инструментами, включая реал-тайм обновления UI с индикаторами прогресса выполнения многоэтапных задач.

## Core Features

### 1. AI Chat Interface
- Современный UI чата с использованием shadcn/ui компонентов
- Поддержка streaming сообщений от AI модели
- Интеграция с Google Generative AI (Gemini 2.5 Flash Latest)
- TypeScript для полной типизации

### 2. Multi-Step Tool: sampleCreateTool
- **Назначение**: Имитация длительной многоэтапной работы
- **Функциональность**:
  - Возвращает план действий (3-5 этапов)
  - Поэтапно выполняет каждый пункт плана
  - Симулирует реальное время выполнения (2-5 секунд на этап)
  - Отслеживает общее время выполнения

### 3. Dynamic Progress UI
- **План задач**: Отображение списка этапов выполнения
- **Progress Indicators**: 
  - Спиннер для выполняющихся задач
  - Галочка для завершенных задач
  - Реал-тайм обновление статуса
- **Time Tracking**: Отображение общего времени выполнения

### 4. Real-time Streaming
- Использование AI SDK v5 streaming data capabilities
- Server-Sent Events (SSE) для обновления UI
- Поддержка message metadata для передачи прогресса

## Technical Specifications

### Dependencies
```json
{
  "next": "^15.4.0",
  "react": "^19.0.0",
  "typescript": "^5.6.0",
  "ai": "^5.0.0-beta",
  "@ai-sdk/google": "^1.0.0-beta",
  "@ai-sdk/react": "^1.0.0-beta",
  "tailwindcss": "^4.0.0",
  "@radix-ui/react-*": "latest",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.5.0"
}
```

### Project Structure
```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # AI Chat API endpoint
│   ├── globals.css               # Tailwind CSS styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main chat page
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── chat/
│   │   ├── chat-interface.tsx   # Main chat component
│   │   ├── message-list.tsx     # Messages display
│   │   ├── tool-progress.tsx    # Progress indicator
│   │   └── progress-item.tsx    # Individual progress item
│   └── tools/
│       └── sample-create-tool.tsx # Tool result UI component
├── lib/
│   ├── ai-config.ts            # AI SDK configuration
│   ├── tools.ts                # Tool definitions
│   └── utils.ts                # Utility functions
└── types/
    └── chat.ts                 # Type definitions
```

### Key Implementation Details

#### 1. AI Configuration (API route)
```typescript
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Available Gemini 2.5 models:
// - gemini-2.5-flash (stable, latest generation)
// - gemini-2.5-flash-preview-05-20 (preview with latest features)
export const model = google('gemini-2.5-flash');
```

#### 2. sampleCreateTool Definition
```typescript
const sampleCreateTool = tool({
  description: 'Create a sample project with multi-step progress tracking',
  parameters: z.object({
    projectName: z.string(),
    complexity: z.enum(['simple', 'medium', 'complex']),
  }),
  // Implementation with streaming progress updates
});
```

#### 3. Progress UI Components
- Использование Radix UI primitives для accessibility
- Tailwind CSS 4 для стилизации
- Анимации для smooth transitions
- Real-time updates через streaming data

## User Experience Flow

1. **Initial State**: Пользователь видит чистый интерфейс чата
2. **Tool Invocation**: Пользователь запрашивает создание проекта
3. **Plan Display**: AI показывает план с этапами (все со спиннерами)
4. **Progressive Updates**: Поэтапно обновляются статусы (спиннер → галочка)
5. **Completion**: Отображение общего времени выполнения

## Technical References

### AI SDK v5 Documentation
- [AI SDK 5 Beta Announcement](https://ai-sdk.dev/docs/announcing-ai-sdk-5-beta)
- [Migration Guide 5.0](https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0)
- [Tools and Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)
- [Chatbot Implementation](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot)
- [Chatbot Tool Usage](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage)
- [Generative User Interfaces](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces)
- [Streaming Data](https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data)
- [Message Metadata](https://ai-sdk.dev/docs/ai-sdk-ui/message-metadata)
- [Google Generative AI Provider](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai)
- [Stream Object Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-object)
- [useChat Reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
- [AI SDK v5 Beta useChat](https://v5.ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
- [AI SDK v5 Beta Chatbot](https://v5.ai-sdk.dev/docs/ai-sdk-ui/chatbot)
- [Tool Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/tool)
- [Dynamic Tool Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/dynamic-tool)
- [UI Message Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/ui-message)
- [Model Message Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/model-message)

### Additional Resources
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Google Gemini 2.5 Models](https://ai.google.dev/gemini-api/docs/models)
- [Google Gemini 2.5 Flash Documentation](https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash)

## Success Criteria

1. ✅ Проект успешно инициализирован с Next.js 15.4 и TypeScript
2. ✅ AI SDK v5 (beta) интегрирован с Google Generative AI
3. ✅ sampleCreateTool корректно работает с многоэтапным прогрессом
4. ✅ UI показывает реал-тайм обновления прогресса
5. ✅ Спиннеры заменяются галочками при завершении этапов
6. ✅ Отображается общее время выполнения
7. ✅ Код полностью типизирован с TypeScript
8. ✅ UI соответствует modern design principles

## Implementation Notes

- Использовать latest beta версии AI SDK для доступа к новейшим возможностям
- Обеспечить proper error handling для network requests
- Добавить loading states для лучшего UX
- Следовать React best practices и patterns
- Оптимизировать для production deployment на Vercel

## Future Enhancements

- Добавление дополнительных инструментов
- Поддержка file uploads
- Интеграция с другими AI провайдерами
- Персистентность истории чата
- Расширенные возможности customization UI