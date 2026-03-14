import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import EmergencyContact from '@/lib/models/EmergencyContact'
import { requireAuth } from '@/lib/auth'
import { contactSchema } from '@/lib/validators'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    await connectDB()
    const contact = await EmergencyContact.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      { $set: parsed.data },
      { new: true }
    )

    if (!contact) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: contact })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    await connectDB()

    const contact = await EmergencyContact.findOneAndDelete({ _id: params.id, userId: user.id })
    if (!contact) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { message: 'Contact deleted' } })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
