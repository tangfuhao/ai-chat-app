import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { streamText } from "ai"

export const maxDuration = 300 // 5 minutes max duration

export async function POST(req: Request) {
  const { messages, apiKey, model } = await req.json()

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "请提供有效的 API Key" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    let result

    // Select the appropriate provider based on the model
    if (model.startsWith("gpt")) {
      result = streamText({
        model: openai(model, { apiKey }),
        messages,
      })
    } else if (model.startsWith("claude")) {
      result = streamText({
        model: anthropic(model, { apiKey }),
        messages,
      })
    } else {
      // For other models, default to OpenAI for now
      // In a real implementation, you would add support for Grok and DeepSeek
      result = streamText({
        model: openai("gpt-4o", { apiKey }),
        messages,
      })
    }

    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error("Error in chat API:", error)

    let statusCode = 500
    let errorMessage = "请求失败，请检查API设置"

    if (error.status === 429) {
      statusCode = 429
      errorMessage = "请求过于频繁"
    } else if (error.message) {
      errorMessage = error.message
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    })
  }
}
