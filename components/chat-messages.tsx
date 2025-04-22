"use client"

import { useState } from "react"
import type { Message } from "ai"
import type { MessageType } from "@/lib/types"
import ReactMarkdown from "react-markdown"

interface ChatMessagesProps {
  messages: Message[]
  onEditMessage: (index: number, content: string) => void
  onDeleteMessage: (index: number) => void
  onChangeRole: (index: number) => void
  onInsertMessage: (index: number) => void
  onMoveMessage: (index: number, direction: "up" | "down") => void
  isLoading: boolean
}

export function ChatMessages({
  messages,
  onEditMessage,
  onDeleteMessage,
  onChangeRole,
  onInsertMessage,
  onMoveMessage,
  isLoading,
}: ChatMessagesProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")

  const startEditing = (index: number) => {
    setEditingIndex(index)
    setEditContent(messages[index].content)
  }

  const saveEdit = () => {
    if (editingIndex !== null) {
      onEditMessage(editingIndex, editContent)
      setEditingIndex(null)
    }
  }

  const getRoleIcon = (role: MessageType) => {
    switch (role) {
      case "user":
        return "👤"
      case "assistant":
        return "🤖"
      case "system":
        return "🛠️"
      default:
        return "👤"
    }
  }

  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <div key={message.id || index} className="group relative">
          <div className="flex items-start space-x-3">
            <button
              onClick={() => onChangeRole(index)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {getRoleIcon(message.role as MessageType)}
            </button>

            <div className="flex-1">
              {editingIndex === index ? (
                <div className="w-full">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        saveEdit()
                      }
                    }}
                    autoFocus
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 min-h-[100px]"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
                    >
                      取消
                    </button>
                    <button
                      onClick={saveEdit}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  onDoubleClick={() => startEditing(index)}
                >
                  <ReactMarkdown className="prose dark:prose-invert max-w-none">{message.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          <div className="absolute right-0 top-0 hidden group-hover:flex items-center space-x-1 bg-white dark:bg-gray-800 p-1 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
            <button
              onClick={() => onMoveMessage(index, "up")}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={index === 0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-up"
              >
                <path d="m5 12 7-7 7 7"></path>
                <path d="M12 19V5"></path>
              </svg>
            </button>
            <button
              onClick={() => onMoveMessage(index, "down")}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={index === messages.length - 1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-down"
              >
                <path d="M12 5v14"></path>
                <path d="m19 12-7 7-7-7"></path>
              </svg>
            </button>
            <button
              onClick={() => startEditing(index)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-pencil"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
              </svg>
            </button>
            <button
              onClick={() => onDeleteMessage(index)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-trash-2"
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" x2="10" y1="11" y2="17"></line>
                <line x1="14" x2="14" y1="11" y2="17"></line>
              </svg>
            </button>
            <button
              onClick={() => onInsertMessage(index)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
      ))}

      {isLoading && (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            🤖
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
              <span className="text-gray-500">Generating...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
