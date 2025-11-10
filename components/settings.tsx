"use client"

import { useState, useEffect } from "react"
import { type AIProvider } from "@/lib/types"
import { MODEL_CONFIGS, getModelConfigByModelName, getDefaultParams, type ModelConfigDescriptor } from "@/lib/model-config"
import { DynamicParamInput } from "./dynamic-param-input"

interface ProviderSettings {
  apiKey: string
  customModel: string
  parameters: Record<string, any>
}

interface SettingsProps {
  apiKey: string
  provider: AIProvider
  model?: string
  parameters?: Record<string, any>
  onSave: (apiKey: string, model: string, provider: AIProvider, parameters: Record<string, any>) => void
  onClose: () => void
}

export function Settings({ 
  apiKey, 
  provider,
  model = '',
  parameters = {},
  onSave, 
  onClose 
}: SettingsProps) {
  const [inputApiKey, setInputApiKey] = useState(apiKey)
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(provider)
  const [customModelName, setCustomModelName] = useState(model)
  const [currentParams, setCurrentParams] = useState<Record<string, any>>(parameters)
  const [showApiKey, setShowApiKey] = useState(false)
  const [currentConfig, setCurrentConfig] = useState<ModelConfigDescriptor | null>(null)

  // 根據當前選擇的提供商和模型，獲取配置
  useEffect(() => {
    const modelName = customModelName || getDefaultModelForProvider(selectedProvider)
    const config = getModelConfigByModelName(
      selectedProvider === 'openai-gpt5' ? 'openai' : selectedProvider,
      modelName
    )
    setCurrentConfig(config)

    // 從 localStorage 加載提供商特定的設置
    const savedSettings = localStorage.getItem(`provider_settings_${selectedProvider}`)
    if (savedSettings) {
      const settings: ProviderSettings = JSON.parse(savedSettings)
      setInputApiKey(settings.apiKey || apiKey)
      setCustomModelName(settings.customModel || '')
      
      // 合併保存的參數和默認參數
      const defaultParams = getDefaultParams(config)
      setCurrentParams({ ...defaultParams, ...settings.parameters })
    } else {
      // 如果沒有保存的設置，使用配置的默認值
      setInputApiKey(apiKey)
      setCustomModelName('')
      setCurrentParams(getDefaultParams(config))
    }
  }, [selectedProvider, apiKey])

  // 當自定義模型名稱改變時，更新配置（用於 GPT-5 檢測）
  useEffect(() => {
    if (customModelName.trim()) {
      const modelName = customModelName.trim()
      const config = getModelConfigByModelName(
        selectedProvider === 'openai-gpt5' ? 'openai' : selectedProvider,
        modelName
      )
      setCurrentConfig(config)
      
      // 如果配置改變了，重置參數為新配置的默認值
      const newDefaults = getDefaultParams(config)
      setCurrentParams(prev => {
        // 保留仍然存在的參數值，新參數使用默認值
        const merged: Record<string, any> = { ...newDefaults }
        Object.keys(prev).forEach(key => {
          if (config.parameters[key]) {
            merged[key] = prev[key]
          }
        })
        return merged
      })
    }
  }, [customModelName, selectedProvider])

  const handleSave = () => {
    const finalModel = customModelName.trim() || getDefaultModelForProvider(selectedProvider)
    
    // 保存當前提供商的設置到 localStorage
    const providerSettings: ProviderSettings = {
      apiKey: inputApiKey,
      customModel: customModelName.trim(),
      parameters: currentParams
    }
    localStorage.setItem(`provider_settings_${selectedProvider}`, JSON.stringify(providerSettings))
    
    // 調用父組件的保存函數
    onSave(inputApiKey, finalModel, selectedProvider, currentParams)
  }

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as AIProvider
    
    // 保存當前提供商的設置
    const currentProviderSettings: ProviderSettings = {
      apiKey: inputApiKey,
      customModel: customModelName.trim(),
      parameters: currentParams
    }
    localStorage.setItem(`provider_settings_${selectedProvider}`, JSON.stringify(currentProviderSettings))
    
    // 更新選中的提供商
    setSelectedProvider(newProvider)
  }

  const handleParamChange = (paramKey: string, value: any) => {
    setCurrentParams(prev => ({
      ...prev,
      [paramKey]: value
    }))
  }

  // 獲取提供商的默認模型
  function getDefaultModelForProvider(provider: AIProvider): string {
    const config = MODEL_CONFIGS[provider]
    return config?.models[0] || ''
  }

  if (!currentConfig) {
    return null // 配置加載中
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">設置</h2>

          {/* API Key 輸入 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {currentConfig.apiKeyLabel || 'API Key'}
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={inputApiKey}
                onChange={(e) => setInputApiKey(e.target.value)}
                className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                placeholder="輸入您的 API Key"
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

          {/* 提供商選擇 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">AI 提供商</label>
            <select
              value={selectedProvider}
              onChange={handleProviderChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            >
              {Object.entries(MODEL_CONFIGS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* 自定義模型名稱 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              自定義模型名稱 (可選)
            </label>
            <input
              type="text"
              value={customModelName}
              onChange={(e) => setCustomModelName(e.target.value)}
              placeholder={`預設：${currentConfig.models[0]}`}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              可用模型：{currentConfig.models.join(', ')}
            </p>
          </div>

          {/* 動態參數區域 */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
              模型參數
            </h3>
            
            {Object.entries(currentConfig.parameters).map(([paramKey, paramConfig]) => {
              if (!paramConfig) return null
              
              return (
                <DynamicParamInput
                  key={paramKey}
                  paramKey={paramKey}
                  config={paramConfig}
                  value={currentParams[paramKey] ?? paramConfig.defaultValue}
                  onChange={(value) => handleParamChange(paramKey, value)}
                />
              )
            })}
          </div>

          {/* 操作按鈕 */}
          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              取消
            </button>
            <button 
              onClick={handleSave} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
