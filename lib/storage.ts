import type { ChatSession, Settings } from "./types"

export function getStoredSessions(): ChatSession[] {
  if (typeof window === "undefined") return []

  try {
    const sessions = localStorage.getItem("sessions")
    return sessions ? JSON.parse(sessions) : []
  } catch (error) {
    console.error("Failed to parse sessions from localStorage", error)
    return []
  }
}

export function storeSession(key: string, data: any): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to store ${key} in localStorage`, error)
  }
}

export function getStoredSettings(): Settings | null {
  if (typeof window === "undefined") return null

  try {
    const settings = localStorage.getItem("settings")
    return settings ? JSON.parse(settings) : null
  } catch (error) {
    console.error("Failed to parse settings from localStorage", error)
    return null
  }
}

// 编辑历史记录，每个消息ID对应一个编辑栈
export const messageEditHistory: Record<string, string[]> = {};

// 全局的撤销栈，只在编辑模式下使用
export let globalUndoStack: string[] = [];

export const pushEdit = (messageId: string, content: string) => {
  if (!messageEditHistory[messageId]) {
    messageEditHistory[messageId] = [];
  }
  messageEditHistory[messageId].push(content);
  // 清空撤销栈，因为有新的编辑
  globalUndoStack = [];
};

export const undo = (messageId: string): string | undefined => {
  const history = messageEditHistory[messageId];
  if (!history || history.length < 1) return undefined;
  
  const currentEdit = history.pop()!;
  globalUndoStack.push(currentEdit);
  return currentEdit;
};

export const redo = (messageId: string): string | undefined => {
  if (globalUndoStack.length === 0) return undefined;
  
  const lastUndo = globalUndoStack.pop()!;
  if (messageEditHistory[messageId]) {
    messageEditHistory[messageId].push(lastUndo);
  }
  return lastUndo;
};

export const clearUndoStack = () => {
  globalUndoStack = [];
};

export const clearEditMessage = (messageId: string) => {
  messageEditHistory[messageId] = [];
}

