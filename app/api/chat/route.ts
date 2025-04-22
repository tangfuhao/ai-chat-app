import { OpenAI } from "openai"
import Anthropic from "@anthropic-ai/sdk"

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// 模型配置类型
interface ModelConfig {
  provider: 'openai' | 'anthropic'
  baseURL?: string
  requiresSystemRoleConversion?: boolean
}

// 支持的模型配置
const MODEL_CONFIG: Record<string, ModelConfig> = {
  // OpenAI
  'gpt-3.5-turbo': { provider: 'openai' },
  'gpt-4': { provider: 'openai' },
  
  // Anthropic
  'claude-3-opus-20240229': { 
    provider: 'anthropic',
    requiresSystemRoleConversion: true
  },
}

export const maxDuration = 300

export async function POST(req: Request) {
  const { messages, apiKey, model } = await req.json()

  // 参数验证
  if (!apiKey) {
    return errorResponse(400, "请提供有效的API Key")
  }

  const modelConfig = MODEL_CONFIG[model]
  if (!modelConfig) {
    return errorResponse(400, "不支持的模型类型")
  }

  try {
    // 根据提供商处理请求
    switch (modelConfig.provider) {
      case 'openai':
        return handleOpenAIRequest(apiKey, messages, model)
      case 'anthropic':
        return handleAnthropicRequest(apiKey, messages, model)
      default:
        return errorResponse(400, "未知的模型提供商")
    }
  } catch (error: any) {
    console.error('API调用失败:', error)
    return errorResponse(
      error.status || 500,
      error.message || "模型服务调用失败"
    )
  }
}

// OpenAI处理函数
async function handleOpenAIRequest(
  apiKey: string,
  messages: Message[],
  model: string
) {
  const openai = new OpenAI({ apiKey })
  const response = await openai.chat.completions.create({
    model,
    messages: messages.map(formatOpenAIMessage),
  })

  return new Response(
    JSON.stringify({ content: response.choices[0].message.content }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

// Anthropic处理函数
async function handleAnthropicRequest(
  apiKey: string,
  messages: Message[],
  model: string
) {
  const anthropic = new Anthropic({ apiKey })
  const response = await anthropic.messages.create({
    model,
    messages: messages.map(formatClaudeMessage),
    max_tokens: 1024,
  })

  return new Response(
    JSON.stringify({ content: response.content }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

// 消息格式化函数
function formatOpenAIMessage(message: Message): OpenAI.ChatCompletionMessageParam {
  return {
    role: message.role,
    content: message.content
  }
}

function formatClaudeMessage(message: Message): Anthropic.MessageParam {
  return {
    role: message.role === 'system' ? 'assistant' : message.role,
    content: message.content
  }
}

// 错误响应函数
function errorResponse(status: number, message: string) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { 'Content-Type': 'application/json' } }
  )
}