export type MessageType = "user" | "assistant" | "system"

export type AIProvider = 'openai' | 'openai-gpt5' | 'anthropic' | 'deepseek' | 'grok' | 'gemini' | 'novita'

// 提供商默认模型名称
export const DefaultModels: Record<string, string> = {
  'openai': 'gpt-4o',
  'openai-gpt5': 'gpt-5-preview',
  'anthropic': 'claude-3-5-sonnet-latest',
  'deepseek': 'deepseek-chat',
  'grok': 'grok-1',
  'gemini': 'gemini-2.0-flash',
  'novita': 'pa/cd-3-5-st-20241022'
}

export interface ChatSession {
  id: string
  title: string
  messageCount: number
  lastUpdated: string
}

// 支持动态参数的设置接口
export interface Settings {
  apiKey: string
  model: string
  provider: AIProvider
  // 动态参数对象，可以包含任何模型特定的参数
  parameters: Record<string, any>
}

// 默认设置
export const DefaultSettings: Settings = {
  apiKey: '',
  model: DefaultModels.openai,
  provider: 'openai',
  parameters: {
    temperature: 0.7,
    maxTokens: 1024
  }
}
