import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Trip from '@/lib/models/Trip'
import TripEvent from '@/lib/models/TripEvent'
import { requireAuth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    await connectDB()

    const trip = await Trip.findOne({ _id: params.id, userId: user.id })
    if (!trip) {
      return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 })
    }

    const events = await TripEvent.find({ tripId: params.id }).sort({ timestamp: 1 })

    return NextResponse.json({ success: true, data: { trip, events } })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
