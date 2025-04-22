"use client"

import type React from "react"

import type { FormEvent } from "react"

interface ChatInputProps {
  input: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onRegenerate: () => void
  isLoading: boolean
  messages?: any[] // Make messages optional
}

export function ChatInput({
  input,
  onChange,
  onSubmit,
  onRegenerate,
  isLoading,
  messages = [], // Provide default empty array
}: ChatInputProps) {
  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-4">
        {messages && messages.length > 0 && !isLoading && (
          <div className="mb-3">
            <button
              type="button"
              onClick={onRegenerate}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center space-x-2"
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
                className="lucide lucide-refresh-cw"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
              </svg>
              <span>Regenerate</span>
            </button>
          </div>
        )}
        <div className="relative">
          <textarea
            value={input}
            onChange={onChange}
            placeholder="Type a message..."
            className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 resize-none"
            rows={3}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 bottom-3 p-1 rounded-full bg-blue-500 text-white disabled:bg-gray-400"
          >
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
              className="lucide lucide-send"
            >
              <path d="m22 2-7 20-4-9-9-4Z"></path>
              <path d="M22 2 11 13"></path>
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
