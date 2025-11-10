"use client"

import { ParamConfig } from "@/lib/model-config"

interface DynamicParamInputProps {
  paramKey: string
  config: ParamConfig
  value: any
  onChange: (value: any) => void
}

/**
 * 動態參數輸入組件
 * 根據參數配置自動渲染對應的 UI 控件
 */
export function DynamicParamInput({ paramKey, config, value, onChange }: DynamicParamInputProps) {
  // 如果參數被禁用且有固定值，顯示只讀狀態
  if (config.disabled && config.fixedValue !== undefined) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {config.label}
        </label>
        <div className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 bg-gray-100 text-gray-500">
          {config.fixedValue}
        </div>
        {config.description && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {config.description}
          </p>
        )}
      </div>
    )
  }

  // 根據類型渲染不同的輸入控件
  switch (config.type) {
    case 'slider':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {config.label} ({value})
          </label>
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            disabled={config.disabled}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {config.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {config.description}
            </p>
          )}
        </div>
      )

    case 'select':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {config.label}
          </label>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={config.disabled}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {config.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {config.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {config.description}
            </p>
          )}
        </div>
      )

    case 'number':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {config.label}
          </label>
          <input
            type="number"
            min={config.minValue}
            max={config.maxValue}
            value={value}
            onChange={(e) => {
              const inputValue = e.target.value
              if (inputValue === '') {
                onChange(config.defaultValue)
                return
              }
              const numValue = parseInt(inputValue)
              if (!isNaN(numValue) && numValue >= (config.minValue || 1)) {
                onChange(numValue)
              } else if (!isNaN(numValue) && numValue < (config.minValue || 1)) {
                onChange(config.minValue || 1)
              }
            }}
            onBlur={(e) => {
              const numValue = parseInt(e.target.value)
              if (isNaN(numValue) || numValue < (config.minValue || 1)) {
                onChange(config.defaultValue)
              }
            }}
            disabled={config.disabled}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={String(config.defaultValue)}
          />
          {config.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {config.description}
            </p>
          )}
        </div>
      )

    case 'toggle':
      return (
        <div className="mb-4 flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium mb-1">
              {config.label}
            </label>
            {config.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {config.description}
              </p>
            )}
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              disabled={config.disabled}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      )

    default:
      return null
  }
}

