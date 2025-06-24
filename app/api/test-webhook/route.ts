import type { NextRequest } from "next/server"

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://your-n8n-instance.com/webhook/lake-balaton-chat"

export async function GET() {
  return Response.json({
    webhookUrl: N8N_WEBHOOK_URL,
    message: "Test endpoint - check if webhook URL is configured",
  })
}

export async function POST(req: NextRequest) {
  try {
    const testMessage = {
      message: "Test message from Lake Balaton chatbot",
      conversation_history: [],
      sessionId: `test_session_${Date.now()}`,
      timestamp: new Date().toISOString(),
    }

    console.log("Testing n8n webhook with:", testMessage)
    console.log("Webhook URL:", N8N_WEBHOOK_URL)

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testMessage),
    })

    console.log("Test response status:", response.status)
    console.log("Test response headers:", Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log("Test response body:", responseText)

    let parsedResponse = null
    try {
      parsedResponse = JSON.parse(responseText)
    } catch (e) {
      console.log("Response is not JSON")
    }

    return Response.json({
      success: response.ok,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      rawResponse: responseText,
      parsedResponse: parsedResponse,
      webhookUrl: N8N_WEBHOOK_URL,
    })
  } catch (error) {
    console.error("Test webhook error:", error)
    return Response.json(
      {
        success: false,
        error: error.message,
        webhookUrl: N8N_WEBHOOK_URL,
      },
      { status: 500 },
    )
  }
}
