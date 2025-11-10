# AI Chat App

一個支援多個 AI 提供商的現代化聊天應用，採用配置驅動的動態 UI 架構。

## ✨ 特性

### 🤖 多模型支援

- **OpenAI GPT-4/3.5** - ChatGPT 系列模型
- **OpenAI GPT-5** ⭐ - 完整支援 GPT-5 專屬參數
  - `reasoning_effort` - 控制推理耗時和質量
  - `verbosity` - 控制回答詳細程度
- **Anthropic Claude** - Claude 3.5 Sonnet 系列
- **DeepSeek** - DeepSeek Chat 和 Coder
- **Google Gemini** - Gemini 2.0 Flash 系列
- **Novita AI** - 多模型支援

### 🎨 配置驅動架構

- **動態 UI 生成** - 根據模型自動渲染參數控件
- **智能參數處理** - 自動驗證、規範化和轉換
- **獨立設置存儲** - 每個提供商的設置獨立保存
- **極易擴展** - 添加新模型只需 5 分鐘

### 🛠️ 技術棧

- **Next.js 15** - React 框架
- **React 19** - UI 庫
- **TypeScript** - 類型安全
- **Tailwind CSS** - 樣式框架
- **Radix UI** - 無障礙組件庫

## 🚀 快速開始

### 安裝依賴

```bash
npm install
# 或
pnpm install
# 或
yarn install
```

### 運行開發服務器

```bash
npm run dev
# 或
pnpm dev
# 或
yarn dev
```

打開 [http://localhost:3000](http://localhost:3000) 查看應用。

### 構建生產版本

```bash
npm run build
npm run start
```

### 🐛 調試開發

本項目已配置完整的 VSCode 調試支持！

**快速開始調試：**

1. 在代碼中設置斷點（點擊行號左側）
2. 按 `F5` 鍵
3. 選擇調試配置：
   - **🚀 服務端調試** - 調試 API 路由和服務端邏輯
   - **🌐 客戶端調試** - 調試 React 組件
   - **🎯 全棧調試** - 同時調試前後端

**詳細指南：**
- [完整調試指南](./DEBUG-GUIDE.md) - 詳細的調試教程
- [快速參考](./QUICK-DEBUG.md) - 一分鐘快速上手

**調試示例：**
```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const { parameters } = await req.json()
  // 🔴 點擊這裡設置斷點，按 F5 啟動調試
  console.log('收到請求:', parameters)
}
```

## 📖 使用指南

### 基本使用

1. **配置 API Key**
   - 點擊右上角的設置按鈕
   - 選擇 AI 提供商
   - 輸入對應的 API Key
   - 調整參數（可選）
   - 保存設置

2. **開始聊天**
   - 在輸入框輸入消息
   - 按 Enter 或點擊發送
   - 等待 AI 回應

3. **管理會話**
   - 創建新會話
   - 刪除舊會話
   - 複製會話
   - 重命名會話

### GPT-5 使用

詳細的 GPT-5 使用指南請參考 [GPT5-GUIDE.md](./GPT5-GUIDE.md)

#### 快速配置

```
提供商: ChatGPT (GPT-5)
模型: gpt-5-preview
Reasoning Effort: Medium
Verbosity: Medium
最大 Token 數: 4096
```

## 📁 項目結構

```
.
├── app/
│   ├── api/chat/
│   │   └── route.ts          # API 路由（參數驗證和轉換）
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # 主頁面
├── components/
│   ├── chat-history.tsx       # 聊天歷史側邊欄
│   ├── chat-input.tsx         # 消息輸入框
│   ├── chat-messages.tsx      # 消息列表
│   ├── settings.tsx           # 設置面板（配置驅動）
│   ├── dynamic-param-input.tsx # 動態參數輸入組件
│   └── ui/                    # UI 組件庫
├── lib/
│   ├── model-config.ts        # 模型配置系統核心 ⭐
│   ├── types.ts               # 類型定義
│   ├── storage.ts             # 存儲邏輯
│   └── utils.ts               # 工具函數
├── hooks/
│   └── useChat.ts             # 聊天 Hook
└── docs/
    ├── ARCHITECTURE.md        # 架構文檔
    ├── GPT5-GUIDE.md          # GPT-5 使用指南
    ├── MIGRATION.md           # 遷移指南
    ├── REFACTOR-SUMMARY.md    # 重構總結
    └── TESTING-CHECKLIST.md   # 測試清單
```

## 🎯 核心架構

### 配置驅動的動態 UI

本項目採用配置描述符系統，每個模型的參數通過配置定義：

```typescript
// lib/model-config.ts
'openai-gpt5': {
  provider: 'openai',
  models: ['gpt-5-preview', 'gpt-5-mini', 'gpt-5-chat-latest'],
  displayName: 'ChatGPT (GPT-5)',
  parameters: {
    temperature: { type: 'slider', ... },
    reasoning_effort: { type: 'select', ... },
    verbosity: { type: 'select', ... }
  }
}
```

UI 會根據配置自動生成對應的表單控件，無需手寫表單代碼。

詳細架構說明請參考 [ARCHITECTURE.md](./ARCHITECTURE.md)

## 📚 文檔

- **[架構文檔](./ARCHITECTURE.md)** - 完整的系統架構說明
- **[GPT-5 指南](./GPT5-GUIDE.md)** - GPT-5 使用指南
- **[遷移指南](./MIGRATION.md)** - v1.x → v2.0 遷移指南
- **[重構總結](./REFACTOR-SUMMARY.md)** - 重構完成總結
- **[測試清單](./TESTING-CHECKLIST.md)** - 完整的測試檢查清單

## 🔧 開發指南

### 添加新的 AI 提供商

只需三步：

1. **添加類型定義**（lib/types.ts）
2. **添加模型配置**（lib/model-config.ts）
3. **添加 API 處理函數**（app/api/chat/route.ts）

UI 會自動生成！

詳細步驟請參考 [ARCHITECTURE.md](./ARCHITECTURE.md#如何添加新模型)

### 參數類型

支持的參數類型：

- `slider` - 滑桿控件（如 Temperature）
- `select` - 下拉選擇（如 Reasoning Effort）
- `number` - 數字輸入（如 Max Tokens）
- `toggle` - 開關按鈕

每種類型都支持驗證、默認值、描述等配置。

## 🧪 測試

運行測試：

```bash
npm run test
```

查看完整的測試檢查清單：[TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md)

## 📝 變更日誌

### v2.0.0 (2025-11-10)

#### 🎉 新增
- ✅ 完整的 GPT-5 支援
  - reasoning_effort 參數
  - verbosity 參數
  - 自動處理 temperature 限制
- ✅ 配置驅動的動態 UI 系統
- ✅ 智能模型檢測
- ✅ 獨立的提供商設置存儲

#### 🔄 重構
- ✅ Settings 組件完全重寫
- ✅ API 路由參數處理統一化
- ✅ 類型定義更新為動態參數結構

#### 📚 文檔
- ✅ 添加架構文檔
- ✅ 添加 GPT-5 使用指南
- ✅ 添加遷移指南
- ✅ 添加測試清單

### v1.0.0

- 初始版本
- 支持 OpenAI、Anthropic、DeepSeek、Gemini、Novita

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 🙏 致謝

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [OpenAI](https://openai.com/)
- [Anthropic](https://www.anthropic.com/)

## 📞 聯繫方式

如有問題或建議，請：
- 提交 [GitHub Issue](#)
- 查看 [文檔](./ARCHITECTURE.md)
- 參考 [FAQ](./GPT5-GUIDE.md#常見問題)

---

**享受使用配置驅動的 AI Chat App！** 🎉

