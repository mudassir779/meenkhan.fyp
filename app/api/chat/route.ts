import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import ChatMessage from '@/lib/models/ChatMessage'
import { requireAuth } from '@/lib/auth'
import { chatMessageSchema } from '@/lib/validators'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const SYSTEM_PROMPT = `You are Alex, the SAFORA AI driving safety assistant. Your role is to help drivers stay safe on the road.

Key responsibilities:
- Provide driving safety tips and advice
- Alert about drowsy/distracted driving dangers
- Suggest rest stops when drivers are tired
- Give emergency assistance guidance
- Share road safety rules and best practices
- Help with route safety information

Personality:
- Friendly, calm, and supportive
- Always prioritize driver safety
- Keep responses concise (2-3 sentences max) since drivers shouldn't read long texts
- Use simple, clear language
- If someone seems tired or impaired, strongly recommend stopping

Important: You are ONLY a driving safety assistant. If asked about unrelated topics, politely redirect to driving safety.`

async function getAIResponse(userMessage: string, chatHistory: { role: string; text: string }[]): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const history = chatHistory.slice(-10).map((msg) => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.text }],
    }))

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.7,
      },
    })

    const result = await chat.sendMessage(`${SYSTEM_PROMPT}\n\nUser message: ${userMessage}`)
    const response = result.response.text()

    return response || "I'm here to help keep you safe on the road. Could you please repeat that?"
  } catch (error) {
    console.error('Gemini API error:', error)
    return "I'm having trouble connecting right now. Please stay safe and try again in a moment!"
  }
}

export async function GET() {
  try {
    const user = await requireAuth()
    await connectDB()

    const messages = await ChatMessage.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(100)

    return NextResponse.json({ success: true, data: messages.reverse() })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = chatMessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    await connectDB()

    // Save user message
    const userMsg = await ChatMessage.create({
      userId: user.id,
      role: 'user',
      text: parsed.data.text,
    })

    // Get recent chat history for context
    const recentMessages = await ChatMessage.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(10)

    const chatHistory = recentMessages.reverse().map((msg) => ({
      role: msg.role,
      text: msg.text,
    }))

    // Get AI response from Gemini
    const botReply = await getAIResponse(parsed.data.text, chatHistory)

    const botMsg = await ChatMessage.create({
      userId: user.id,
      role: 'bot',
      text: botReply,
    })

    return NextResponse.json({
      success: true,
      data: { userMessage: userMsg, botMessage: botMsg },
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
