"use client"

import type React from "react"

import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Loader2, RotateCcw, Settings } from "lucide-react"
import { useRef, useEffect } from "react"
import { useSession } from "../hooks/useSession"

export default function LakeBalatonChat() {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { sessionId, isLoading: sessionLoading, startNewSession } = useSession()

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      sessionId: sessionId,
    },
    onResponse: (response) => {
      console.log("Chat response received:", response)
    },
    onFinish: (message) => {
      console.log("Chat finished with message:", message)
    },
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Debug messages changes
  useEffect(() => {
    console.log("Messages updated:", messages)
  }, [messages])

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    <div className="min-h-screen bg-white">
      <div className="flex flex-col h-screen max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Balaton Asszisztens</h1>
              <p className="text-sm text-gray-500">AI Segítő</p>
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
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            {/* Debug Panel Toggle - Development Only */}
            {process.env.NODE_ENV === "development" && (
              <details className="relative">
                <summary className="cursor-pointer">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    <Settings className="h-4 w-4" />
                  </Button>
                </summary>
                <Card className="absolute right-0 top-10 w-80 p-4 shadow-xl border-gray-200 bg-white z-50">
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
                      <strong>Hiba:</strong> {error ? error.message : "Nincs"}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/test-webhook", { method: "POST" })
                          const result = await response.json()
                          console.log("Webhook test result:", result)
                          alert("Ellenőrizd a konzolt a webhook teszt eredményeiért")
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
          <div className="mx-4 mt-4">
            <Card className="border-red-200 bg-red-50 p-4 animate-wave-in">
              <p className="text-red-800 text-sm">
                <strong>Kapcsolódási hiba:</strong> {error.message}
              </p>
            </Card>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4" ref={scrollAreaRef}>
            <div className="py-6 space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-12 animate-wave-in">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Üdvözöl a Balaton</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Itt vagyok, hogy segítsek felfedezni Magyarország legnagyobb tavát. Kérdezz rólam programokról,
                    éttermekről, szállásokról vagy utazási tippekről.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-6">
                    {["Legjobb strandok", "Helyi éttermek", "Vízi programok", "Hol szálljak meg"].map(
                      (suggestion, index) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const syntheticEvent = {
                              preventDefault: () => {},
                            } as React.FormEvent<HTMLFormElement>
                            handleInputChange({ target: { value: suggestion } } as any)
                            setTimeout(() => handleSubmit(syntheticEvent), 100)
                          }}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 animate-wave-in"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {suggestion}
                        </Button>
                      ),
                    )}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-3 animate-wave-in ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : "bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                          : "bg-gray-50 border border-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      {message.role === "assistant" && (
                        <div className="text-xs text-gray-400 mt-2">Balaton Asszisztens</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start animate-wave-in">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 border border-gray-200 shadow-sm">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-gray-50 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-wave-dot"></div>
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-wave-dot"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-wave-dot"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                        <span className="text-gray-600 ml-2">Gondolkozom...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-gray-100">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Kérdezz a Balatonról..."
                className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
