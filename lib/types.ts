export type MessageType = "user" | "assistant" | "system"

export type AIModel = "gpt-4o" | "claude-3-5-sonnet" | "grok-1" | "deepseek-coder"

export interface ChatSession {
  id: string
  title: string
  lastUpdated: string
  model: AIModel
  messageCount: number
}

export interface Settings {
  apiKey: string
  model: AIModel
}
