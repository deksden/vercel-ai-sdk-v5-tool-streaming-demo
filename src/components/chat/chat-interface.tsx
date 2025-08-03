'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { MessageList } from './message-list'
import { Send } from 'lucide-react'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useLanguage } from '@/components/language-provider'
import type { MyUIMessage } from '@/types/chat'

export function ChatInterface() {
  const { t } = useLanguage()

  const { messages, sendMessage, status } = useChat<MyUIMessage>({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onError: (error) => {
      console.error('=== useChat error ===')
      console.error('Error:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', error?.message)
      console.error('Full error object:', JSON.stringify(error, null, 2))
    },
    onFinish: (message) => {
      console.log('Chat finished:', message)
    },
    onData: (dataPart) => {
      console.log('=== Received data part ===', dataPart)
      if (dataPart.type === 'data-toolProgress') {
        const progress = dataPart.data
        console.log('Tool progress update:', progress)
        
        // Tool progress updates are now handled directly in MessageList via streaming data
      }
    }
  })

  const [input, setInput] = useState('')
  const isLoading = status !== 'ready'

  console.log('Chat status:', status)
  console.log('Chat isLoading:', isLoading)
  console.log('Messages count:', messages.length)
  console.log('Current input:', input)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      console.log('Sending message:', input)
      sendMessage({
        role: 'user',
        parts: [{ type: 'text', text: input }]
      })
      setInput('')
    }
  }

  const handleSuggestionClick = (suggestionText: string) => {
    if (!isLoading) {
      console.log('Sending suggestion:', suggestionText)
      sendMessage({
        role: 'user',
        parts: [{ type: 'text', text: suggestionText }]
      })
    }
  }


  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto" data-testid="chat-interface">
      {/* Header */}
      <div className="border-b border-border p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground" suppressHydrationWarning>{t('chat.title')}</h1>
          <p className="text-muted-foreground" suppressHydrationWarning>
            {t('chat.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2" data-testid="header-controls">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" data-testid="messages-container">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 text-center max-w-md bg-card text-card-foreground" data-testid="welcome-card">
              <h2 className="text-xl font-semibold mb-2 text-foreground" suppressHydrationWarning>{t('chat.welcome')}</h2>
              <p className="text-muted-foreground mb-4" suppressHydrationWarning>
                {t('chat.welcomeText')}
              </p>
              <div className="space-y-2 text-sm">
                <button
                  onClick={() => handleSuggestionClick(t('chat.suggestions.medium'))}
                  disabled={isLoading}
                  data-testid="suggestion-medium"
                  className="w-full bg-muted/50 p-3 rounded-lg text-foreground hover:bg-muted/70 hover:scale-105 transition-all duration-200 ease-in-out hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none text-left"
                >
                  <span suppressHydrationWarning>&ldquo;{t('chat.suggestions.medium')}&rdquo;</span>
                </button>
                <button
                  onClick={() => handleSuggestionClick(t('chat.suggestions.complex'))}
                  disabled={isLoading}
                  data-testid="suggestion-complex"
                  className="w-full bg-muted/50 p-3 rounded-lg text-foreground hover:bg-muted/70 hover:scale-105 transition-all duration-200 ease-in-out hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none text-left"
                >
                  <span suppressHydrationWarning>&ldquo;{t('chat.suggestions.complex')}&rdquo;</span>
                </button>
                <button
                  onClick={() => handleSuggestionClick(t('chat.suggestions.simple'))}
                  disabled={isLoading}
                  data-testid="suggestion-simple"
                  className="w-full bg-muted/50 p-3 rounded-lg text-foreground hover:bg-muted/70 hover:scale-105 transition-all duration-200 ease-in-out hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none text-left"
                >
                  <span suppressHydrationWarning>&ldquo;{t('chat.suggestions.simple')}&rdquo;</span>
                </button>
              </div>
            </Card>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4" data-testid="chat-input-container">
        <form onSubmit={handleSubmit} className="flex gap-2" data-testid="chat-form">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={t('chat.placeholder')}
            disabled={isLoading}
            data-testid="chat-input"
            className="flex-1 bg-background text-foreground border-input"
            suppressHydrationWarning
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            data-testid="send-button"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}