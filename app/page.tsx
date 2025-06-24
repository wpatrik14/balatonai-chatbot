"use client"

import type React from "react"

import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Loader2, RotateCcw, Settings, Clock } from "lucide-react"
import { useRef, useEffect, useState } from "react"
import { useSession } from "../hooks/useSession"

export default function LakeBalatonChat() {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [requestStartTime, setRequestStartTime] = useState<number | null>(null)
  const [lastResponseTime, setLastResponseTime] = useState<number | null>(null)
  const [messageTimings, setMessageTimings] = useState<Record<string, number>>({})

  const { sessionId, isLoading: sessionLoading, startNewSession } = useSession()

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      sessionId: sessionId,
    },
    onResponse: (response) => {
      console.log("Chat response received:", response)
      if (requestStartTime) {
        const responseTime = (Date.now() - requestStartTime) / 1000
        setLastResponseTime(responseTime)
        console.log(`Response time: ${responseTime.toFixed(2)}s`)
      }
    },
    onFinish: (message) => {
      console.log("Chat finished with message:", message)

      // Store the timing for this specific message
      if (requestStartTime && message.role === "assistant" && message.id) {
        const responseTime = (Date.now() - requestStartTime) / 1000
        setMessageTimings((prev) => ({
          ...prev,
          [message.id]: responseTime,
        }))
        console.log(`Final response time for message ${message.id}: ${responseTime.toFixed(2)}s`)
      }

      setRequestStartTime(null)
    },
    onError: (error) => {
      console.error("Chat error:", error)
      setRequestStartTime(null)
      setLastResponseTime(null)
    },
  })

  // Track request start time
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const startTime = Date.now()
    setRequestStartTime(startTime)
    setLastResponseTime(null)
    console.log("Request started at:", startTime)
    handleSubmit(e)
  }

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion: string) => {
    const startTime = Date.now()
    setRequestStartTime(startTime)
    setLastResponseTime(null)
    console.log("Suggestion request started at:", startTime)

    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>
    handleInputChange({ target: { value: suggestion } } as any)
    setTimeout(() => handleSubmit(syntheticEvent), 100)
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Debug messages and timings
  useEffect(() => {
    console.log("Messages updated:", messages)
    console.log("Message timings:", messageTimings)
    console.log("Last response time:", lastResponseTime)
  }, [messages, messageTimings, lastResponseTime])

  if (sessionLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <div className="absolute inset-0 animate-ping">
              <div className="h-8 w-8 rounded-full bg-blue-200 opacity-20"></div>
            </div>
          </div>
          <p className="text-gray-600">Inicializálás...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">Balaton Asszisztens</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm text-gray-500">AI Segítő</p>
              {lastResponseTime && (
                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  <Clock className="h-3 w-3" />
                  <span>Utolsó: {lastResponseTime.toFixed(1)}s</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              startNewSession()
              window.location.reload()
            }}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200 p-2"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* Debug Panel Toggle - Development Only */}
          {process.env.NODE_ENV === "development" && (
            <details className="relative">
              <summary className="cursor-pointer">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2">
                  <Settings className="h-4 w-4" />
                </Button>
              </summary>
              <Card className="absolute right-0 top-10 w-72 sm:w-80 p-4 shadow-xl border-gray-200 bg-white z-50">
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="font-medium text-gray-900 mb-3">Debug Információ</div>
                  <p>
                    <strong>Munkamenet:</strong> {sessionId?.slice(-8) || "Betöltés..."}
                  </p>
                  <p>
                    <strong>Üzenetek:</strong> {messages.length}
                  </p>
                  <p>
                    <strong>Betöltés:</strong> {isLoading ? "Igen" : "Nem"}
                  </p>
                  <p>
                    <strong>Utolsó válaszidő:</strong> {lastResponseTime ? `${lastResponseTime.toFixed(2)}s` : "N/A"}
                  </p>
                  <p>
                    <strong>Tárolt időzítések:</strong> {Object.keys(messageTimings).length}
                  </p>
                  <p>
                    <strong>Hiba:</strong> {error ? error.message : "Nincs"}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const testStart = Date.now()
                        const response = await fetch("/api/test-webhook", { method: "POST" })
                        const testTime = (Date.now() - testStart) / 1000
                        const result = await response.json()
                        console.log("Webhook test result:", result)
                        alert(`Webhook teszt: ${testTime.toFixed(2)}s - Ellenőrizd a konzolt`)
                      } catch (error) {
                        console.error("Webhook test failed:", error)
                        alert("Webhook teszt sikertelen - ellenőrizd a konzolt")
                      }
                    }}
                    className="w-full mt-3 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    Webhook Teszt
                  </Button>
                </div>
              </Card>
            </details>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex-shrink-0 mx-3 sm:mx-4 mt-3 sm:mt-4">
          <Card className="border-red-200 bg-red-50 p-3 sm:p-4">
            <p className="text-red-800 text-sm">
              <strong>Kapcsolódási hiba:</strong> {error.message}
            </p>
          </Card>
        </div>
      )}

      {/* Chat Messages - Flexible height */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-4">
            {messages.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
                  <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Üdvözöl a Balaton</h2>
                <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
                  Itt vagyok, hogy segítsek felfedezni Magyarország legnagyobb tavát. Kérdezz rólam programokról,
                  éttermekről, szállásokról vagy utazási tippekről.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4 sm:mt-6 px-4">
                  {["Legjobb strandok", "Helyi éttermek", "Vízi programok", "Hol szálljak meg"].map(
                    (suggestion, index) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-xs sm:text-sm opacity-0 animate-fade-in-up"
                        style={{ animationDelay: `${index * 150 + 500}ms` }}
                      >
                        {suggestion}
                      </Button>
                    ),
                  )}
                </div>
              </div>
            )}

            {messages.map((message, index) => {
              const isNewMessage = index === messages.length - 1
              const messageResponseTime = message.id ? messageTimings[message.id] : null

              return (
                <div
                  key={message.id}
                  className={`flex gap-2 sm:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} ${
                    isNewMessage ? "opacity-0 animate-message-appear" : ""
                  }`}
                >
                  <div
                    className={`flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-sm ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : "bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      ) : (
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                          : "bg-gray-50 border border-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{message.content}</p>
                      {message.role === "assistant" && (
                        <div className="flex items-center justify-between mt-1 sm:mt-2">
                          <span className="text-xs text-gray-400">Balaton Asszisztens</span>
                          {messageResponseTime ? (
                            <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-2">
                              <Clock className="h-3 w-3" />
                              <span>{messageResponseTime.toFixed(1)}s</span>
                            </div>
                          ) : (
                            // Show a placeholder for debugging
                            <div className="text-xs text-gray-300 ml-2">
                              {message.id ? `ID: ${message.id.slice(-4)}` : "No ID"}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex gap-2 sm:gap-3 justify-start opacity-0 animate-message-appear">
                <div className="flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%]">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-gray-100 border border-gray-200 shadow-sm">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                  </div>
                  <div className="rounded-2xl px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-wave-dot"></div>
                        <div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-wave-dot"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-wave-dot"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <span className="text-gray-600 ml-2 text-sm sm:text-base">Gondolkozom...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Input Form - Always at bottom */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-100 bg-white">
        <form onSubmit={handleFormSubmit} className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Kérdezz a Balatonról..."
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 pr-3 sm:pr-12 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 text-sm sm:text-base"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
