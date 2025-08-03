import { ToolProgress } from './tool-progress'
import type { MyUIMessage } from '@/types/chat'

interface MessageListProps {
  messages: MyUIMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="p-4 space-y-4" data-testid="messages-list">
      {messages.map((message) => (
        <div key={message.id} className="space-y-4" data-testid={`message-${message.id}`}>
          {/* User message */}
          {message.role === 'user' && (
            <div className="flex justify-end" data-testid="user-message">
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
                {message.parts.map((part, index) => 
                  part.type === 'text' ? (
                    <span key={index}>{part.text}</span>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Assistant message */}
          {message.role === 'assistant' && (
            <div className="flex justify-start" data-testid="assistant-message">
              <div className="bg-muted text-foreground px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
                {message.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return <span key={index}>{part.text}</span>
                  } else if (part.type === 'data-toolProgress') {
                    // Отображаем реальтайм прогресс инструмента
                    return (
                      <div key={index} className="mt-2">
                        <ToolProgress progress={part.data} />
                      </div>
                    )
                  } else if (part.type === 'step-start' || part.type === 'tool-call-streaming-start' || part.type === 'tool-call-delta') {
                    // Убираем все лишние блоки - оставляем только progress component
                    return null
                  } else if (part.type.startsWith('tool-')) {
                    // Убираем лишний блок "Project created successfully" - оставляем только live progress
                    return null
                  }
                  return null
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}