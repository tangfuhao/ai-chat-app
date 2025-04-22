import { useState, useCallback } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface UseChatOptions {
  id?: string
  body?: {
    apiKey: string
    model: string
  }
  onFinish?: () => void
  onError?: (error: Error) => void
}

export function useChat({
  id,
  body,
  onFinish,
  onError,
}: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleInputChange = useCallback((value: string) => {
    setInput(value)
  }, [])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!input.trim() || !body?.apiKey) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          apiKey: body.apiKey,
          model: body.model,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }

      const data = await response.json()
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: data.content,
      }

      setMessages(prev => [...prev, assistantMessage])
      onFinish?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send message')
      setError(error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [input, messages, body, onFinish, onError])

  const reload = useCallback(async () => {
    if (messages.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user')
      if (lastUserMessageIndex === -1) return

      const messagesCopy = messages.slice(0, messages.length - lastUserMessageIndex)
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesCopy,
          apiKey: body?.apiKey,
          model: body?.model,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to regenerate message')
      }

      const data = await response.json()
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: data.content,
      }

      setMessages(prev => [...messagesCopy, assistantMessage])
      onFinish?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to regenerate message')
      setError(error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [messages, body, onFinish, onError])

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
    error,
    reload,
  }
}
