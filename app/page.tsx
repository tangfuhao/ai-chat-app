"use client"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { Settings } from "@/components/settings"
import { ChatHistory } from "@/components/chat-history"
import { ChatMessages } from "@/components/chat-messages"
import { ChatInput } from "@/components/chat-input"
import type { MessageType, ChatSession, AIModel } from "@/lib/types"
import { getStoredSessions, storeSession, getStoredSettings } from "@/lib/storage"

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [selectedModel, setSelectedModel] = useState<AIModel>("gpt-4o")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, error, reload } = useChat({
    id: currentSessionId || undefined,
    body: {
      apiKey,
      model: selectedModel,
    },
    onFinish: () => {
      if (currentSessionId) {
        const updatedSession = sessions.find((s) => s.id === currentSessionId)
        if (updatedSession) {
          const updatedSessions = sessions.map((s) =>
            s.id === currentSessionId
              ? { ...s, messageCount: messages.length + 1, lastUpdated: new Date().toISOString() }
              : s,
          )
          setSessions(updatedSessions)
          storeSession(currentSessionId, messages)
          storeSession("sessions", updatedSessions)
        }
      }
    },
  })

  useEffect(() => {
    const storedSessions = getStoredSessions()
    setSessions(storedSessions)

    if (storedSessions.length > 0) {
      setCurrentSessionId(storedSessions[0].id)
    } else {
      createNewSession()
    }

    const settings = getStoredSettings()
    if (settings) {
      setApiKey(settings.apiKey || "")
      setSelectedModel(settings.model || "gpt-4o")
    }
  }, [])

  useEffect(() => {
    if (currentSessionId) {
      const storedMessages = JSON.parse(localStorage.getItem(currentSessionId) || "[]")
      setMessages(storedMessages)
    }
  }, [currentSessionId, setMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const createNewSession = () => {
    const newSessionId = `session-${Date.now()}`
    const newSession: ChatSession = {
      id: newSessionId,
      title: "New Chat",
      lastUpdated: new Date().toISOString(),
      model: selectedModel,
      messageCount: 0,
    }

    const updatedSessions = [newSession, ...sessions]
    setSessions(updatedSessions)
    setCurrentSessionId(newSessionId)
    setMessages([])
    storeSession("sessions", updatedSessions)
  }

  const deleteSession = (sessionId: string) => {
    if (confirm("确定要删除这个会话吗？")) {
      const updatedSessions = sessions.filter((s) => s.id !== sessionId)
      setSessions(updatedSessions)
      localStorage.removeItem(sessionId)
      storeSession("sessions", updatedSessions)

      if (sessionId === currentSessionId) {
        if (updatedSessions.length > 0) {
          setCurrentSessionId(updatedSessions[0].id)
        } else {
          createNewSession()
        }
      }
    }
  }

  const duplicateSession = (sessionId: string) => {
    const sessionToDuplicate = sessions.find((s) => s.id === sessionId)
    if (sessionToDuplicate) {
      const newSessionId = `session-${Date.now()}`
      const duplicatedSession: ChatSession = {
        ...sessionToDuplicate,
        id: newSessionId,
        title: `${sessionToDuplicate.title} (复制)`,
        lastUpdated: new Date().toISOString(),
      }

      const storedMessages = JSON.parse(localStorage.getItem(sessionId) || "[]")
      const updatedSessions = [duplicatedSession, ...sessions]

      setSessions(updatedSessions)
      setCurrentSessionId(newSessionId)
      setMessages(storedMessages)

      storeSession(newSessionId, storedMessages)
      storeSession("sessions", updatedSessions)
    }
  }

  const updateSessionTitle = (sessionId: string, newTitle: string) => {
    const updatedSessions = sessions.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
    setSessions(updatedSessions)
    storeSession("sessions", updatedSessions)
  }

  const saveSettings = (apiKey: string, model: AIModel) => {
    setApiKey(apiKey)
    setSelectedModel(model)
    localStorage.setItem("settings", JSON.stringify({ apiKey, model }))
    setIsSettingsOpen(false)
  }

  const handleMessageEdit = (index: number, content: string) => {
    const updatedMessages = [...messages]
    updatedMessages[index] = { ...updatedMessages[index], content }
    setMessages(updatedMessages)

    if (currentSessionId) {
      storeSession(currentSessionId, updatedMessages)
    }
  }

  const handleMessageDelete = (index: number) => {
    const updatedMessages = messages.filter((_, i) => i !== index)
    setMessages(updatedMessages)

    if (currentSessionId) {
      storeSession(currentSessionId, updatedMessages)
    }
  }

  const handleMessageRoleChange = (index: number) => {
    const roles: MessageType[] = ["user", "assistant", "system"]
    const currentRole = messages[index].role as MessageType
    const currentIndex = roles.indexOf(currentRole)
    const nextRole = roles[(currentIndex + 1) % roles.length]

    const updatedMessages = [...messages]
    updatedMessages[index] = { ...updatedMessages[index], role: nextRole }
    setMessages(updatedMessages)

    if (currentSessionId) {
      storeSession(currentSessionId, updatedMessages)
    }
  }

  const handleInsertMessage = (index: number) => {
    const newMessage = { id: `msg-${Date.now()}`, role: "user", content: "" }
    const updatedMessages = [...messages.slice(0, index + 1), newMessage, ...messages.slice(index + 1)]
    setMessages(updatedMessages)
  }

  const handleMoveMessage = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === messages.length - 1)) {
      return
    }

    const updatedMessages = [...messages]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    ;[updatedMessages[index], updatedMessages[targetIndex]] = [updatedMessages[targetIndex], updatedMessages[index]]

    setMessages(updatedMessages)

    if (currentSessionId) {
      storeSession(currentSessionId, updatedMessages)
    }
  }

  const handleRegenerate = () => {
    reload()
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Top Bar */}
      <header className="flex justify-between items-center py-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h1 className="text-xl font-semibold">{selectedModel === "gpt-4o" ? "ChatGPT" : selectedModel}</h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-settings"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat History Sidebar (30%) */}
        <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
          <div className="p-4 flex justify-between items-center">
            <h2 className="font-semibold">Sessions</h2>
            <div className="flex space-x-2">
              <button onClick={createNewSession} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-plus"
                >
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
              </button>
            </div>
          </div>

          <ChatHistory
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={setCurrentSessionId}
            onDeleteSession={deleteSession}
            onDuplicateSession={duplicateSession}
            onUpdateTitle={updateSessionTitle}
          />
        </div>

        {/* Main Chat Area (70%) */}
        <div className="w-3/4 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4">
            <ChatMessages
              messages={messages}
              onEditMessage={handleMessageEdit}
              onDeleteMessage={handleMessageDelete}
              onChangeRole={handleMessageRoleChange}
              onInsertMessage={handleInsertMessage}
              onMoveMessage={handleMoveMessage}
              isLoading={isLoading}
            />
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <ChatInput
              input={input}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              onRegenerate={handleRegenerate}
              isLoading={isLoading}
              messages={messages} // Pass the messages from useChat
            />
            {error && (
              <div className="mt-2 p-2 text-sm text-red-500 border border-red-500 rounded">
                {error.message || "请求失败，请检查API设置"}
              </div>
            )}
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <Settings
          apiKey={apiKey}
          model={selectedModel}
          onSave={saveSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  )
}
