import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import ChatMessage from '@/lib/models/ChatMessage'
import { requireAuth } from '@/lib/auth'
import { chatMessageSchema } from '@/lib/validators'

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

    // Bot auto-reply (placeholder — user will add AI model later)
    const botReplies: Record<string, string> = {
      hello: "Hello! I'm Alex, your SAFORA AI assistant. How can I help you drive safely today?",
      help: "I can help you with: driving tips, safety alerts, rest suggestions, and emergency assistance. What do you need?",
      tired: "If you're feeling tired, I recommend taking a break at the nearest rest stop. Your safety is the priority!",
      speed: "Please maintain a safe speed. Remember, the speed limit is there for everyone's safety.",
    }

    const lowerText = parsed.data.text.toLowerCase()
    let botReply = "I'm here to help keep you safe on the road. Feel free to ask me anything about driving safety!"

    for (const [keyword, reply] of Object.entries(botReplies)) {
      if (lowerText.includes(keyword)) {
        botReply = reply
        break
      }
    }

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
