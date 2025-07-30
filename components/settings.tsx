"use client"

import { useState, useEffect } from "react"
import { DefaultModels, DefaultSettings, type AIProvider } from "@/lib/types"

interface ProviderSettings {
  apiKey: string;
  customModel: string;
}

interface SettingsProps {
  apiKey: string
  provider: AIProvider
  temperature?: number
  onSave: (apiKey: string, model: string, provider: AIProvider, temperature: number) => void
  onClose: () => void
}

export function Settings({ 
  apiKey, 
  provider, 
  temperature = DefaultSettings.temperature,
  onSave, 
  onClose 
}: SettingsProps) {
  const [inputApiKey, setInputApiKey] = useState(apiKey)
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(provider)
  const [customModelName, setCustomModelName] = useState("")
  const [tempValue, setTempValue] = useState(temperature)
  const [showApiKey, setShowApiKey] = useState(false)

  // 从 localStorage 加载提供商特定的设置
  useEffect(() => {
    const savedSettings = localStorage.getItem(`provider_settings_${selectedProvider}`)
    if (savedSettings) {
      const settings: ProviderSettings = JSON.parse(savedSettings)
      setInputApiKey(settings.apiKey || apiKey)
      setCustomModelName(settings.customModel || "")
    } else {
      // 如果没有保存的设置，重置为默认值
      setInputApiKey(apiKey)
      setCustomModelName("")
    }
  }, [selectedProvider, apiKey])

  const handleSave = () => {
    const finalModel = customModelName.trim() ? customModelName.trim() : DefaultModels[selectedProvider]
    
    // 保存当前提供商的设置到 localStorage
    const providerSettings: ProviderSettings = {
      apiKey: inputApiKey,
      customModel: customModelName.trim()
    }
    localStorage.setItem(`provider_settings_${selectedProvider}`, JSON.stringify(providerSettings))
    
    // 调用父组件的保存函数
    onSave(inputApiKey, finalModel, selectedProvider, tempValue)
  }

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as AIProvider
    
    // 保存当前提供商的设置
    const currentProviderSettings: ProviderSettings = {
      apiKey: inputApiKey,
      customModel: customModelName.trim()
    }
    localStorage.setItem(`provider_settings_${selectedProvider}`, JSON.stringify(currentProviderSettings))
    
    // 更新选中的提供商
    setSelectedProvider(newProvider)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">设置</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={inputApiKey}
                onChange={(e) => setInputApiKey(e.target.value)}
                className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                placeholder="输入您的 API Key"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showApiKey ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                    <line x1="2" x2="22" y1="2" y2="22"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">模型</label>
            <select
              value={selectedProvider}
              onChange={handleProviderChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            >
              <option value="openai">ChatGPT (GPT-4o)</option>
              <option value="anthropic">Claude (3.5 Sonnet V2)</option>
              <option value="grok">Grok</option>
              <option value="deepseek">DeepSeek</option>
              <option value="gemini">Gemini</option>
              <option value="novita">Novita AI</option>
            </select>
          </div>

          <div className="mb-4">
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

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Temperature ({tempValue})</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={tempValue}
              onChange={(e) => setTempValue(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              调整响应的随机性：0 表示更确定的响应，2 表示更具创造性的响应
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
