"use client"

import type React from "react"

interface ChatInputProps {
  input: string
  handleInputChange: (value: string) => void
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  isLoading: boolean
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e.target.value)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={handleChange}
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
