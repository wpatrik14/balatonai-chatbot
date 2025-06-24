"use client"

import { useState, useEffect } from "react"

// Generate a unique session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function useSession() {
  const [sessionId, setSessionId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  // Initialize or retrieve session ID
  useEffect(() => {
    let storedSessionId = localStorage.getItem("lake-balaton-session-id")

    if (!storedSessionId) {
      storedSessionId = generateSessionId()
      localStorage.setItem("lake-balaton-session-id", storedSessionId)
    }

    setSessionId(storedSessionId)
    setIsLoading(false)
  }, [])

  const startNewSession = () => {
    const newSessionId = generateSessionId()
    setSessionId(newSessionId)
    localStorage.setItem("lake-balaton-session-id", newSessionId)
    return newSessionId
  }

  const clearSession = () => {
    localStorage.removeItem("lake-balaton-session-id")
    setSessionId("")
  }

  return {
    sessionId,
    isLoading,
    startNewSession,
    clearSession,
  }
}
