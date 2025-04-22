"use client"

import { useState } from "react"
import { DefaultModels, type AIProvider } from "@/lib/types"

interface SettingsProps {
  apiKey: string
  provider: AIProvider
  onSave: (apiKey: string, model: string, provider: AIProvider) => void
  onClose: () => void
}

export function Settings({ apiKey, provider, onSave, onClose }: SettingsProps) {
  const [inputApiKey, setInputApiKey] = useState(apiKey)
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(provider)
  const [customModelName, setCustomModelName] = useState("")

  const handleSave = () => {
    // Use custom model name if provided, otherwise use the selected model
    const finalModel = customModelName.trim() ? customModelName.trim() : DefaultModels[selectedProvider]
    console.log("handleSave: ", "finalModel", finalModel, "selectedProvider", selectedProvider)
    onSave(inputApiKey, finalModel, selectedProvider)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">设置</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">API Key</label>
            <input
              type="password"
              value={inputApiKey}
              onChange={(e) => setInputApiKey(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
              placeholder="输入您的 API Key"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">模型</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            >
              <option value="openai">ChatGPT (GPT-4o)</option>
              <option value="anthropic">Claude (3.5 Sonnet V2)</option>
              <option value="grok">Grok</option>
              <option value="deepseek">DeepSeek</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">自定义模型名称 (可选)</label>
            <input
              type="text"
              value={customModelName}
              onChange={(e) => setCustomModelName(e.target.value)}
              placeholder={`例如：claude-3-5-sonnet-20241022`}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              如需使用特定版本模型，可在此处输入完整模型名称
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              取消
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
