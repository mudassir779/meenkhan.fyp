import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import TripEvent from '@/lib/models/TripEvent'
import { requireAuth } from '@/lib/auth'
import { tripEventSchema } from '@/lib/validators'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    await connectDB()

    const events = await TripEvent.find({ tripId: params.id, userId: user.id }).sort({ timestamp: 1 })
    return NextResponse.json({ success: true, data: events })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = tripEventSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    await connectDB()
    const event = await TripEvent.create({
      ...parsed.data,
      tripId: params.id,
      userId: user.id,
    })

    return NextResponse.json({ success: true, data: event }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
