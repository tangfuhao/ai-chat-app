export type MessageType = "user" | "assistant" | "system"

export type AIModel = 
  | 'gpt-3.5-turbo'
  | 'gpt-4'
  | 'claude-3-opus-20240229'

export interface ChatSession {
  id: string
  title: string
  messageCount: number
  lastUpdated: string
  model: AIModel
}

export interface Settings {
  apiKey: string
  model: AIModel
}
