export type MessageType = "user" | "assistant" | "system"


export type AIProvider = 'openai' | 'anthropic' | 'deepseek' | 'grok'

//provide 默认模型名称
export const DefaultModels = {
  openai: 'gpt-3.5-turbo',
  anthropic: 'claude-3-5-sonnet-latest',
  deepseek: 'deepseek-chat',
  grok: 'grok-1',
  gemini: 'gemini-2.0-flash'
}


export interface ChatSession {
  id: string
  title: string
  messageCount: number
  lastUpdated: string
}

export interface Settings {
  apiKey: string
  model: string
  provider: AIProvider
  temperature: number
}

// 默认设置
export const DefaultSettings: Settings = {
  apiKey: '',
  model: DefaultModels.openai,
  provider: 'openai',
  temperature: 0.7
}
