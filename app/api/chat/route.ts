import { OpenAI } from "openai"
import Anthropic from "@anthropic-ai/sdk"
import axios from 'axios'
import { GoogleGenAI } from "@google/genai"
import { getModelConfigByModelName, validateAndNormalizeParams } from "@/lib/model-config"

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const maxDuration = 300

export async function POST(req: Request) {
  try {
    const { messages, apiKey, model, provider, parameters = {} } = await req.json()

    console.log('📥 收到請求:', {
      provider,
      model,
      messageCount: messages?.length,
      parameters
    })

    // 參數驗證
    if (!apiKey) {
      console.error('❌ 缺少 API Key')
      return errorResponse(400, "請提供有效的 API Key")
    }

    if (!model) {
      console.error('❌ 缺少模型名稱')
      return errorResponse(400, "請提供模型名稱")
    }

    // 獲取模型配置並驗證參數
    console.log('🔧 獲取模型配置...')
    const modelConfig = getModelConfigByModelName(provider, model)
    console.log('✅ 模型配置:', modelConfig.displayName)

    const validatedParams = validateAndNormalizeParams(modelConfig, {
      ...parameters,
      model // 添加模型名稱以供 transformParams 使用
    })
    console.log('✅ 驗證後的參數:', validatedParams)

    // 根據提供商處理請求
    console.log('🚀 調用 API...')
    let response: Response

    switch (provider) {
      case 'openai':
      case 'openai-gpt5':
        response = await handleOpenAIRequest(apiKey, messages, model, validatedParams)
        break
      case 'anthropic':
        response = await handleAnthropicRequest(apiKey, messages, model, validatedParams)
        break
      case 'deepseek':
        response = await handleDeepSeekRequest(apiKey, messages, model, validatedParams)
        break
      case 'gemini':
        response = await handleGeminiRequest(apiKey, messages, model, validatedParams)
        break
      case 'novita':
        response = await handleNovitaRequest(apiKey, messages, model, validatedParams)
        break
      default:
        console.error('❌ 未知的提供商:', provider)
        return errorResponse(400, "未知的模型提供商")
    }

    console.log('✅ API 調用成功')
    return response

  } catch (error: any) {
    console.error('❌ API 調用失敗:', {
      name: error.name,
      message: error.message,
      status: error.status,
      stack: error.stack
    })

    // 處理 OpenAI 特定錯誤
    if (error.error) {
      return errorResponse(
        error.status || 500,
        error.error.message || error.message || "API 調用失敗"
      )
    }

    return errorResponse(
      error.status || 500,
      error.message || "模型服務調用失敗"
    )
  }
}

// Gemini 處理函數
async function handleGeminiRequest(
  apiKey: string,
  messages: Message[],
  model: string,
  params: Record<string, any>
) {
  const gemini = new GoogleGenAI({ apiKey: apiKey })

  // Get the last message and check its role
  const lastMessage = messages[messages.length - 1]
  const isLastMessageUser = lastMessage.role === 'user'

  // Convert messages to Gemini chat history format
  const historyMessages = isLastMessageUser ? messages.slice(0, -1) : messages
  const history = historyMessages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }))

  const chat = gemini.chats.create({
    model: model,
    history: history,
  })

  // Only send message if last message is from user
  const messageToSend = isLastMessageUser ? lastMessage.content : ''

  const response = await chat.sendMessage({
    message: messageToSend,
    config: {
      maxOutputTokens: params.maxTokens,
      temperature: params.temperature,
    },
  })

  return new Response(
    JSON.stringify({
      role: "assistant",
      content: response.text
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

// OpenAI 處理函數（包括 GPT-5）
async function handleOpenAIRequest(
  apiKey: string,
  messages: Message[],
  model: string,
  params: Record<string, any>
) {
  try {
    console.log('🤖 OpenAI - 初始化客戶端')
    const openai = new OpenAI({ apiKey })

    // 構建請求參數
    const requestParams: any = {
      model,
      messages: messages.map(formatOpenAIMessage),
    }

    // 添加標準參數
    if (params.temperature !== undefined) {
      requestParams.temperature = params.temperature
    }

    // 檢測是否是 GPT-5 模型
    const isGPT5 = isGPT5Model(model)

    // GPT-5 使用 max_completion_tokens，其他模型使用 max_tokens
    if (params.maxTokens !== undefined) {
      if (isGPT5) {
        requestParams.max_completion_tokens = params.maxTokens
      } else {
        requestParams.max_tokens = params.maxTokens
      }
    }

    // 添加 GPT-5 專屬參數
    if (isGPT5) {
      console.log('🌟 檢測到 GPT-5 模型')
      // GPT-5 專屬參數
      if (params.reasoning_effort !== undefined && model !== 'gpt-5-chat-latest') {
        requestParams.reasoning_effort = params.reasoning_effort
        console.log('  ✓ reasoning_effort:', params.reasoning_effort)
      }
      if (params.verbosity !== undefined && model !== 'gpt-5-chat-latest') {
        requestParams.verbosity = params.verbosity
        console.log('  ✓ verbosity:', params.verbosity)
      }
    }

    console.log('📤 發送請求到 OpenAI:', {
      model: requestParams.model,
      temperature: requestParams.temperature,
      max_tokens: requestParams.max_tokens || requestParams.max_completion_tokens,
      messageCount: requestParams.messages.length
    })

    const response = await openai.chat.completions.create(requestParams)

    console.log('📥 收到 OpenAI 響應:', {
      id: response.id,
      model: response.model,
      choices: response.choices?.length,
      usage: response.usage
    })

    if (!response.choices || response.choices.length === 0) {
      throw new Error('OpenAI 返回了空的 choices 數組')
    }

    const content = response.choices[0].message.content
    if (!content) {
      console.warn('⚠️ OpenAI 返回了空內容')
    }

    return new Response(
      JSON.stringify({
        role: response.choices[0].message.role,
        content: content || ''
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('❌ OpenAI API 錯誤:', {
      message: error.message,
      type: error.type,
      code: error.code,
      status: error.status
    })
    throw error
  }
}

// DeepSeek 處理函數
async function handleDeepSeekRequest(
  apiKey: string,
  messages: Message[],
  model: string,
  params: Record<string, any>
) {
  const deepseekClient = axios.create({
    baseURL: "https://api.deepseek.com",
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  const response = await deepseekClient.post('/v1/chat/completions', {
    model,
    messages: messages.map(formatOpenAIMessage),
    temperature: params.temperature,
    max_tokens: params.maxTokens,
  })

  return new Response(
    JSON.stringify({
      role: response.data.choices[0].message.role,
      content: response.data.choices[0].message.content
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

// Novita 處理函數
async function handleNovitaRequest(
  apiKey: string,
  messages: Message[],
  model: string,
  params: Record<string, any>
) {
  const novitaClient = new OpenAI({
    apiKey,
    baseURL: "https://api.novita.ai/v3/openai"
  })

  const response = await novitaClient.chat.completions.create({
    model,
    messages: messages.map(formatOpenAIMessage),
    temperature: params.temperature,
    max_tokens: params.maxTokens,
  })

  return new Response(
    JSON.stringify({
      role: response.choices[0].message.role,
      content: response.choices[0].message.content
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

// Anthropic 處理函數
async function handleAnthropicRequest(
  apiKey: string,
  messages: Message[],
  model: string,
  params: Record<string, any>
) {
  const anthropic = new Anthropic({ apiKey })
  const response = await anthropic.messages.create({
    model,
    messages: messages.map(formatClaudeMessage),
    max_tokens: params.maxTokens,
    temperature: params.temperature,
  })

  const content = response.content[0].type === 'text'
    ? response.content[0].text
    : ''

  return new Response(
    JSON.stringify({
      role: response.role,
      content
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

// 消息格式化函數
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

// 檢測是否是 GPT-5 模型
function isGPT5Model(model: string): boolean {
  return model.includes('gpt-5') ||
    model === 'gpt-5-preview' ||
    model === 'gpt-5-mini' ||
    model === 'gpt-5-chat-latest'
}

// 錯誤響應函數
function errorResponse(status: number, message: string) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { 'Content-Type': 'application/json' } }
  )
}
