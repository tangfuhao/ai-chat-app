/**
 * 模型配置系統 - 配置驅動的參數管理
 * 每個模型可以定義自己支援的參數類型和約束
 */

export type ParamType = 'slider' | 'select' | 'number' | 'toggle'

export interface ParamConfig {
  type: ParamType
  label: string
  description?: string
  defaultValue: any
  // slider 專用
  min?: number
  max?: number
  step?: number
  // select 專用
  options?: Array<{ value: string; label: string }>
  // number 專用
  minValue?: number
  maxValue?: number
  // 是否在該模型中禁用
  disabled?: boolean
  // 固定值（如果設置，UI 顯示但不可編輯）
  fixedValue?: any
  // 是否必填
  required?: boolean
}

export interface ModelConfigDescriptor {
  provider: string
  models: string[]  // 支援的模型列表
  displayName: string
  apiKeyLabel?: string
  // 定義該提供商/模型支援的所有參數
  parameters: {
    temperature?: ParamConfig
    maxTokens?: ParamConfig
    // GPT-5 專屬參數
    reasoning_effort?: ParamConfig
    verbosity?: ParamConfig
    // 未來可擴展更多參數
    topP?: ParamConfig
    topK?: ParamConfig
    frequencyPenalty?: ParamConfig
    presencePenalty?: ParamConfig
    [key: string]: ParamConfig | undefined
  }
  // 自定義參數轉換邏輯
  transformParams?: (params: Record<string, any>) => Record<string, any>
}

/**
 * 所有模型的配置定義
 */
export const MODEL_CONFIGS: Record<string, ModelConfigDescriptor> = {
  // ===== OpenAI GPT-4/3.5 系列 =====
  'openai': {
    provider: 'openai',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    displayName: 'ChatGPT (GPT-4/3.5)',
    parameters: {
      temperature: {
        type: 'slider',
        label: 'Temperature',
        description: '調整響應的隨機性：0 表示更確定的響應，2 表示更具創造性的響應',
        defaultValue: 0.7,
        min: 0,
        max: 2,
        step: 0.1
      },
      maxTokens: {
        type: 'number',
        label: '最大 Token 數',
        description: '控制 AI 回應的最大長度（1 token ≈ 0.75 個中文字符）',
        defaultValue: 1024,
        minValue: 1,
        maxValue: 4096
      }
    }
  },

  // ===== OpenAI GPT-5 系列 =====
  'openai-gpt5': {
    provider: 'openai',
    models: [
      'gpt-5-preview',
      'gpt-5-mini',
      'gpt-5-chat-latest'
    ],
    displayName: 'ChatGPT (GPT-5)',
    parameters: {
      temperature: {
        type: 'slider',
        label: 'Temperature',
        description: 'GPT-5 僅支援固定值 1 或留空',
        defaultValue: 1,
        min: 1,
        max: 1,
        step: 0.1,
        disabled: true,
        fixedValue: 1
      },
      maxTokens: {
        type: 'number',
        label: '最大 Token 數',
        description: '控制 AI 回應的最大長度（1 token ≈ 0.75 個中文字符）',
        defaultValue: 4096,
        minValue: 1,
        maxValue: 16384
      },
      reasoning_effort: {
        type: 'select',
        label: 'Reasoning Effort',
        description: '控制推理耗時：minimal（最快）、low、medium、high（質量最高）',
        defaultValue: 'medium',
        options: [
          { value: 'minimal', label: 'Minimal - 最快速度' },
          { value: 'low', label: 'Low - 低推理' },
          { value: 'medium', label: 'Medium - 中等推理' },
          { value: 'high', label: 'High - 高質量推理' }
        ]
      },
      verbosity: {
        type: 'select',
        label: 'Verbosity',
        description: '控制回答長度：low（簡短）、medium（適中）、high（詳盡）',
        defaultValue: 'medium',
        options: [
          { value: 'low', label: 'Low - 簡短扼要' },
          { value: 'medium', label: 'Medium - 適中' },
          { value: 'high', label: 'High - 詳盡全面' }
        ]
      }
    },
    transformParams: (params) => {
      // gpt-5-chat-latest 不支援 reasoning_effort 和 verbosity
      if (params.model === 'gpt-5-chat-latest') {
        const { reasoning_effort, verbosity, ...rest } = params
        return rest
      }
      return params
    }
  },

  // ===== Anthropic Claude =====
  'anthropic': {
    provider: 'anthropic',
    models: ['claude-3-5-sonnet-latest', 'claude-3-opus-latest', 'claude-3-sonnet-20240229'],
    displayName: 'Claude (3.5 Sonnet V2)',
    parameters: {
      temperature: {
        type: 'slider',
        label: 'Temperature',
        description: '調整響應的隨機性：0 表示更確定的響應，1 表示更具創造性的響應',
        defaultValue: 0.7,
        min: 0,
        max: 1,
        step: 0.1
      },
      maxTokens: {
        type: 'number',
        label: '最大 Token 數',
        description: '控制 AI 回應的最大長度',
        defaultValue: 4096,
        minValue: 1,
        maxValue: 8192
      }
    }
  },

  // ===== DeepSeek =====
  'deepseek': {
    provider: 'deepseek',
    models: ['deepseek-chat', 'deepseek-coder'],
    displayName: 'DeepSeek',
    parameters: {
      temperature: {
        type: 'slider',
        label: 'Temperature',
        description: '調整響應的隨機性',
        defaultValue: 0.7,
        min: 0,
        max: 2,
        step: 0.1
      },
      maxTokens: {
        type: 'number',
        label: '最大 Token 數',
        description: '控制 AI 回應的最大長度',
        defaultValue: 2048,
        minValue: 1,
        maxValue: 4096
      }
    }
  },

  // ===== Google Gemini =====
  'gemini': {
    provider: 'gemini',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    displayName: 'Gemini',
    parameters: {
      temperature: {
        type: 'slider',
        label: 'Temperature',
        description: '調整響應的隨機性',
        defaultValue: 0.7,
        min: 0,
        max: 2,
        step: 0.1
      },
      maxTokens: {
        type: 'number',
        label: '最大 Token 數',
        description: '控制 AI 回應的最大長度',
        defaultValue: 2048,
        minValue: 1,
        maxValue: 8192
      }
    }
  },

  // ===== Novita AI =====
  'novita': {
    provider: 'novita',
    models: ['pa/cd-3-5-st-20241022', 'meta-llama/llama-3.1-405b-instruct'],
    displayName: 'Novita AI',
    parameters: {
      temperature: {
        type: 'slider',
        label: 'Temperature',
        description: '調整響應的隨機性',
        defaultValue: 0.7,
        min: 0,
        max: 2,
        step: 0.1
      },
      maxTokens: {
        type: 'number',
        label: '最大 Token 數',
        description: '控制 AI 回應的最大長度',
        defaultValue: 1024,
        minValue: 1,
        maxValue: 4096
      }
    }
  }
}

/**
 * 根據提供商獲取配置
 */
export function getModelConfig(provider: string): ModelConfigDescriptor | undefined {
  // 特殊處理：如果模型名稱包含 gpt-5，使用 GPT-5 配置
  if (provider === 'openai') {
    // 需要在運行時根據具體模型名稱判斷
    return MODEL_CONFIGS['openai']
  }
  return MODEL_CONFIGS[provider]
}

/**
 * 根據模型名稱智能獲取配置
 */
export function getModelConfigByModelName(provider: string, modelName: string): ModelConfigDescriptor {
  // 檢查是否是 GPT-5 系列
  if (provider === 'openai' && (
    modelName.includes('gpt-5') || 
    modelName === 'gpt-5-preview' || 
    modelName === 'gpt-5-mini' ||
    modelName === 'gpt-5-chat-latest'
  )) {
    return MODEL_CONFIGS['openai-gpt5']
  }
  
  return MODEL_CONFIGS[provider] || MODEL_CONFIGS['openai']
}

/**
 * 獲取參數的預設值
 */
export function getDefaultParams(config: ModelConfigDescriptor): Record<string, any> {
  const defaults: Record<string, any> = {}
  
  Object.entries(config.parameters).forEach(([key, paramConfig]) => {
    if (paramConfig) {
      defaults[key] = paramConfig.fixedValue ?? paramConfig.defaultValue
    }
  })
  
  return defaults
}

/**
 * 驗證並規範化參數
 */
export function validateAndNormalizeParams(
  config: ModelConfigDescriptor,
  params: Record<string, any>
): Record<string, any> {
  const normalized: Record<string, any> = {}
  
  Object.entries(config.parameters).forEach(([key, paramConfig]) => {
    if (!paramConfig) return
    
    const value = params[key]
    
    // 如果有固定值，使用固定值
    if (paramConfig.fixedValue !== undefined) {
      normalized[key] = paramConfig.fixedValue
      return
    }
    
    // 如果沒有提供值，使用默認值
    if (value === undefined || value === null) {
      normalized[key] = paramConfig.defaultValue
      return
    }
    
    // 根據類型驗證和規範化
    switch (paramConfig.type) {
      case 'slider':
        const numVal = Number(value)
        if (paramConfig.min !== undefined && numVal < paramConfig.min) {
          normalized[key] = paramConfig.min
        } else if (paramConfig.max !== undefined && numVal > paramConfig.max) {
          normalized[key] = paramConfig.max
        } else {
          normalized[key] = numVal
        }
        break
        
      case 'number':
        const num = Number(value)
        if (paramConfig.minValue !== undefined && num < paramConfig.minValue) {
          normalized[key] = paramConfig.minValue
        } else if (paramConfig.maxValue !== undefined && num > paramConfig.maxValue) {
          normalized[key] = paramConfig.maxValue
        } else {
          normalized[key] = num
        }
        break
        
      case 'select':
        // 驗證值是否在選項中
        const validOptions = paramConfig.options?.map(o => o.value) || []
        normalized[key] = validOptions.includes(value) ? value : paramConfig.defaultValue
        break
        
      case 'toggle':
        normalized[key] = Boolean(value)
        break
        
      default:
        normalized[key] = value
    }
  })
  
  // 應用自定義轉換
  return config.transformParams ? config.transformParams(normalized) : normalized
}

