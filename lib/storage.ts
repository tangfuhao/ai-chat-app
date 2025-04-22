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
