import { createGoogleGenerativeAI } from '@ai-sdk/google'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  // baseURL: 'https://generativelanguage.googleapis.com/v1', // Try v1beta first
})
import { streamText, convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse } from 'ai'
import { sampleCreateStreamingTool } from '@/lib/tools'
import type { MyUIMessage } from '@/types/chat'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages }: { messages: MyUIMessage[] } = await req.json()
    
    console.log('=== API Chat Request ===')
    console.log('Received messages:', JSON.stringify(messages, null, 2))
    console.log('API Key present:', !!process.env.GOOGLE_GENERATIVE_AI_API_KEY)
    console.log('API Key length:', process.env.GOOGLE_GENERATIVE_AI_API_KEY?.length || 0)

    console.log('Converting messages...')
    const convertedMessages = convertToModelMessages(messages)
    console.log('Converted messages:', JSON.stringify(convertedMessages, null, 2))

    console.log('Using gemini-2.5-flash model with streaming...')
    
    // Create a streaming UI message response with custom tool progress
    const stream = createUIMessageStream<MyUIMessage>({
      execute: ({ writer }) => {
        const result = streamText({
          model: google('gemini-2.5-flash'),
          messages: convertedMessages,
          system: 'You are a helpful AI assistant. When users ask you to create a project, use the sampleCreateStreamingTool to demonstrate multi-step progress tracking with real-time updates. Respond clearly and help users understand what you\'re doing.',
          tools: {
            sampleCreateStreamingTool: sampleCreateStreamingTool(writer),
          },
          onChunk: ({ chunk }) => {
            console.log('Stream chunk type:', chunk.type)
            if (chunk.type === 'tool-call') {
              console.log('Tool call:', JSON.stringify(chunk, null, 2))
            }
            if (chunk.type === 'tool-result') {
              console.log('Tool result:', JSON.stringify(chunk, null, 2))
            }
          },
        })
        
        console.log('StreamText created with streaming writer')
        writer.merge(result.toUIMessageStream())
      }
    })
    
    console.log('UI Message Stream created, returning response')
    return createUIMessageStreamResponse({ stream })
  } catch (error) {
    console.error('=== Chat API Error ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error instanceof Error ? error.message : error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    // Специальные ошибки Gemini API
    if (error && typeof error === 'object' && 'cause' in error) {
      console.error('Error cause:', error.cause)
    }
    
    if (error && typeof error === 'object' && 'responseBody' in error) {
      console.error('Response body:', error.responseBody)
    }
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      console.error('Status code:', error.statusCode)
    }
    
    console.error('Full error object:', JSON.stringify(error, null, 2))
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStatus = (error && typeof error === 'object' && 'statusCode' in error) 
      ? (error as { statusCode: number }).statusCode 
      : 500
    
    return new Response(JSON.stringify({ 
      error: 'Chat API Error',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }), { 
      status: errorStatus,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}