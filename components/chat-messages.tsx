"use client";

import { useState } from "react";
import type { Message } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Button } from "./ui/button";
import { MonitorCog, RefreshCw } from "lucide-react";
import { Avatar } from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { pushEdit, undo, redo, } from "@/lib/storage";

interface ChatMessagesProps {
  messages: Message[];
  onEditMessage: (index: number, content: string) => void;
  onDeleteMessage: (index: number) => void;
  onChangeRole: (index: number) => void;
  onInsertMessage: (index: number) => void;
  onMoveMessage: (index: number, direction: "up" | "down") => void;
  onRegenerate: () => void;
  isLoading: boolean;
}

export function ChatMessages({
  messages,
  onEditMessage,
  onDeleteMessage,
  onChangeRole,
  onInsertMessage,
  onMoveMessage,
  onRegenerate,
  isLoading,
}: ChatMessagesProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const startEditing = (index: number) => {
    // 保存编辑到历史记录
    pushEdit(messages[index].id, messages[index].content);
    setEditingIndex(index);
    setEditContent(messages[index].content);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      onEditMessage(editingIndex, editContent);
      setEditingIndex(null);
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      if (editingIndex !== null) {
        const messageId = messages[editingIndex].id;
        if (e.shiftKey) {
          // 重做：Command/Ctrl + Shift + Z
          const redoContent = redo(messageId);
          if (redoContent) {
            setEditContent(redoContent);
          }
        } else {
          // 撤销：Command/Ctrl + Z
          const undoContent = undo(messageId);
          if (undoContent) {
            setEditContent(undoContent);
          }
        }
      }
      return;
    }
  };

  return (
    <div>
      <div className="space-y-6">
        {messages.map((message, index) => (
          <div key={message.id || index} className="group relative">
            <div className="flex items-start space-x-3">
              <button
                onClick={() => onChangeRole(index)}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {message.role === "user" && (
                  <Avatar className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
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
                      // className="text-indigo-500"
                      className="text-black"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </Avatar>
                )}

                {message.role === "assistant" && (
                  <Avatar className="h-10 w-10 bg-green-400  rounded-full flex items-center justify-center ">
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
                      className="text-black"
                    >
                      <path d="M9 10h.01" />
                      <path d="M15 10h.01" />
                      <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
                    </svg>
                  </Avatar>
                )}

                {message.role === "system" && (
                  <Avatar className="h-10 w-10 bg-red-400 rounded-full flex items-center justify-center ">
                    <MonitorCog className="text-black" />
                  </Avatar>
                )}
              </button>

              <div className="flex-1">
                {editingIndex === index ? (
                  <div className="w-full">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                      autoFocus
                      style={{
                        height: "auto",
                        overflow: "auto",
                        maxHeight: "800px"
                      }}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 min-h-[20px]"
                      ref={(textareaRef) => {
                        if (textareaRef) {
                          textareaRef.style.height = "auto"
                          textareaRef.style.height = `${textareaRef.scrollHeight}px`
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                      message.role === "user" &&
                        "bg-indigo-400 dark:bg-indigo-200"
                    )}
                    onDoubleClick={() => startEditing(index)}
                  >
                    <div
                      className={cn(
                        "prose dark:prose-invert max-w-none",
                        message.role === "user" && "text-white dark:text-black"
                      )}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
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
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
              <Avatar className="h-10 w-10 rounded-full flex items-center justify-center ">
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
                  className="text-gray-600 dark:text-gray-300"
                >
                  <path d="M9 10h.01" />
                  <path d="M15 10h.01" />
                  <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
                </svg>
              </Avatar>
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
      {/* 重生成按钮 */}
      {!isLoading && (
        <div className="mt-4 flex justify-start">
          <Button
            variant="ghost"
            className="text-gray-700 flex items-center gap-2"
            onClick={onRegenerate}
          >
            <RefreshCw size={18} />
            <span>Regenerate</span>
          </Button>
        </div>
      )}
    </div>
  );
}
