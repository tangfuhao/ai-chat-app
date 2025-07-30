import { OpenAI } from "openai"
import Anthropic from "@anthropic-ai/sdk"
import axios from 'axios';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const maxDuration = 300

export async function POST(req: Request) {
  const { messages, apiKey, model, provider, temperature } = await req.json()

  // 参数验证
  if (!apiKey) {
    return errorResponse(400, "请提供有效的API Key")
  }

  try {
    // 根据提供商处理请求
    switch (provider) {
      case 'openai':
        return handleOpenAIRequest(apiKey, messages, model, temperature)
      case 'anthropic':
        return handleAnthropicRequest(apiKey, messages, model, temperature)
      case 'deepseek':
        return handleDeepSeekRequest(apiKey, messages, model, temperature)
      case 'gemini':
        return handleGeminiRequest(apiKey, messages, model, temperature)
      case 'novita':
        return handleNovitaRequest(apiKey, messages, model, temperature)
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

// Gemini处理函数
async function handleGeminiRequest(
  apiKey: string,
  messages: Message[],
  model: string,
  temperature: number = 0.7
) {
  const gemini = new GoogleGenAI({ apiKey: apiKey });
  // Get the last message and check its role
  const lastMessage = messages[messages.length - 1];
  const isLastMessageUser = lastMessage.role === 'user';

  // Convert messages to Gemini chat history format
  // If last message is not user message, include it in history
  const historyMessages = isLastMessageUser ? messages.slice(0, -1) : messages;
  const history = historyMessages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const chat = gemini.chats.create({
    model: model,
    history: history,
  });

  // Only send message if last message is from user
  const messageToSend = isLastMessageUser ? lastMessage.content : '';

  const response = await chat.sendMessage({
    message: messageToSend,
    config: {
      maxOutputTokens: 500,
      temperature: temperature,
    },
  });

  return new Response(
    JSON.stringify({
      role: "assistant",
      content: response.text
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

// OpenAI处理函数
async function handleOpenAIRequest(
  apiKey: string,
  messages: Message[],
  model: string,
  temperature: number = 0.7
) {
  const openai = new OpenAI({ apiKey })
  const response = await openai.chat.completions.create({
    model,
    messages: messages.map(formatOpenAIMessage),
    temperature,
  })

  return new Response(
    JSON.stringify({
      role: response.choices[0].message.role,
      content: response.choices[0].message.content
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

// DeepSeek处理函数
async function handleDeepSeekRequest(
  apiKey: string,
  messages: Message[],
  model: string,
  temperature: number = 0.7
) {
  const deepseekClient = axios.create({
    baseURL: "https://api.deepseek.com",
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const response = await deepseekClient.post('/v1/chat/completions', {
    model,
    messages: messages.map(formatOpenAIMessage),
    temperature,
  });

  return new Response(
    JSON.stringify({
      role: response.data.choices[0].message.role,
      content: response.data.choices[0].message.content
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

// Novita处理函数
async function handleNovitaRequest(
  apiKey: string,
  messages: Message[],
  model: string,
  temperature: number = 0.7
) {
  const novitaClient = new OpenAI({
    apiKey,
    baseURL: "https://api.novita.ai/v3/openai"
  })
  
  const response = await novitaClient.chat.completions.create({
    model,
    messages: messages.map(formatOpenAIMessage),
    temperature,
    max_tokens: 1024,
  })

  return new Response(
    JSON.stringify({
      role: response.choices[0].message.role,
      content: response.choices[0].message.content
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

// Anthropic处理函数
async function handleAnthropicRequest(
  apiKey: string,
  messages: Message[],
  model: string,
  temperature: number = 0.7
) {
  const anthropic = new Anthropic({ apiKey })
  const response = await anthropic.messages.create({
    model,
    messages: messages.map(formatClaudeMessage),
    max_tokens: 4096,
    temperature,
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