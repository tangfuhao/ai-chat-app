"use client"

import { useState } from "react"
import type { ChatSession } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface ChatHistoryProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string) => void
  onDuplicateSession: (id: string) => void
  onUpdateTitle: (id: string, title: string) => void
}

export function ChatHistory({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onDuplicateSession,
  onUpdateTitle,
}: ChatHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const startEditing = (session: ChatSession) => {
    setEditingId(session.id)
    setEditTitle(session.title)
  }

  const saveTitle = () => {
    if (editingId && editTitle.trim()) {
      onUpdateTitle(editingId, editTitle)
      setEditingId(null)
    }
  }

  return (
    <div className="space-y-1 px-2">
      {sessions.map((session) => (
        <div
          key={session.id}
          className={`relative group rounded-lg p-3 cursor-pointer ${
            session.id === currentSessionId
              ? "bg-gray-200 dark:bg-gray-700"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => onSelectSession(session.id)}
        >
          {editingId === session.id ? (
            <div className="flex items-center">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                autoFocus
                className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
            <>
              <div className="font-medium truncate">{session.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(session.lastUpdated)} · {session.messageCount} 条消息
              </div>

              <div className="absolute right-2 top-2 hidden group-hover:flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    startEditing(session)
                  }}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
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
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicateSession(session.id)
                  }}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
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
                    className="lucide lucide-copy"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSession(session.id)
                  }}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
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
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
