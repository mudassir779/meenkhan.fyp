import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import EmergencyContact from '@/lib/models/EmergencyContact'
import { requireAuth } from '@/lib/auth'
import { contactSchema } from '@/lib/validators'

export async function GET() {
  try {
    const user = await requireAuth()
    await connectDB()

    const contacts = await EmergencyContact.find({ userId: user.id }).sort({ priority: -1, createdAt: -1 })
    return NextResponse.json({ success: true, data: contacts })
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
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    await connectDB()
    const contact = await EmergencyContact.create({ ...parsed.data, userId: user.id })
    return NextResponse.json({ success: true, data: contact }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
