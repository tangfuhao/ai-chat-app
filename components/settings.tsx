"use client"

import { useState } from "react"
import type { AIModel } from "@/lib/types"

interface SettingsProps {
  apiKey: string
  model: AIModel
  onSave: (apiKey: string, model: AIModel) => void
  onClose: () => void
}

export function Settings({ apiKey, model, onSave, onClose }: SettingsProps) {
  const [inputApiKey, setInputApiKey] = useState(apiKey)
  const [selectedModel, setSelectedModel] = useState<AIModel>(model)
  const [customModelName, setCustomModelName] = useState("")

  const handleSave = () => {
    // Use custom model name if provided, otherwise use the selected model
    const finalModel = customModelName.trim() ? customModelName.trim() : selectedModel
    onSave(inputApiKey, finalModel as AIModel)
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
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as AIModel)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            >
              <option value="gpt-4o">ChatGPT (GPT-4o)</option>
              <option value="claude-3-5-sonnet">Claude (3.5 Sonnet)</option>
              <option value="grok-1">Grok</option>
              <option value="deepseek-coder">DeepSeek</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">自定义模型名称 (可选)</label>
            <input
              type="text"
              value={customModelName}
              onChange={(e) => setCustomModelName(e.target.value)}
              placeholder={`例如：${selectedModel}-version-2`}
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
