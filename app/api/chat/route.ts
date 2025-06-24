import type { NextRequest } from "next/server"

// Replace this with your actual n8n webhook URL
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://your-n8n-instance.com/webhook/lake-balaton-chat"

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId } = await req.json()

    // Get the latest user message
    const userMessage = messages[messages.length - 1]?.content

    if (!userMessage) {
      return new Response("No message provided", { status: 400 })
    }

    console.log("Session ID:", sessionId)
    console.log("Sending message to n8n:", userMessage)
    console.log("n8n webhook URL:", N8N_WEBHOOK_URL)

    // Send the message to n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        conversation_history: messages,
        sessionId: sessionId || `fallback_${Date.now()}`,
        timestamp: new Date().toISOString(),
      }),
    })

    console.log("n8n response status:", response.status)

    if (!response.ok) {
      throw new Error(`n8n webhook responded with status: ${response.status}`)
    }

    // Get the response text first
    const responseText = await response.text()
    console.log("n8n raw response:", responseText)

    let assistantMessage = "Sorry, I could not process your request."

    // Try to parse as JSON, but handle cases where it might not be JSON
    if (responseText.trim()) {
      try {
        const data = JSON.parse(responseText)
        console.log("n8n parsed response:", data)

        // Extract the assistant's response from n8n - prioritize 'message.output' field
        assistantMessage =
          data.message?.output ||
          data.message ||
          data.response ||
          data.reply ||
          data.output ||
          data.text ||
          (typeof data === "string" ? data : JSON.stringify(data))
      } catch (jsonError) {
        console.log("Response is not JSON, treating as plain text")
        assistantMessage = responseText
      }
    } else {
      console.log("Empty response from n8n")
      assistantMessage = "I received your message but got an empty response. Please try again."
    }

    console.log("Final assistant message:", assistantMessage)

    // Create a proper streaming response for the AI SDK
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      start(controller) {
        // Send the message content
        const textChunk = `0:"${assistantMessage.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"\n`
        controller.enqueue(encoder.encode(textChunk))

        // Send the finish chunk
        const finishChunk = `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`
        controller.enqueue(encoder.encode(finishChunk))

        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error communicating with n8n webhook:", error)

    // Return an error response in the expected format
    const encoder = new TextEncoder()
    const errorMessage = `Sorry, I'm having trouble connecting to my knowledge base. Error: ${error.message}`

    const errorStream = new ReadableStream({
      start(controller) {
        const textChunk = `0:"${errorMessage.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"\n`
        controller.enqueue(encoder.encode(textChunk))

        const finishChunk = `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`
        controller.enqueue(encoder.encode(finishChunk))

        controller.close()
      },
    })

    return new Response(errorStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  }
}
