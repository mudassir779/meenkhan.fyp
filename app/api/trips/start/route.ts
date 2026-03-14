import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Trip from '@/lib/models/Trip'
import { requireAuth } from '@/lib/auth'

export async function POST() {
  try {
    const user = await requireAuth()
    await connectDB()

    // End any currently active trip
    await Trip.updateMany(
      { userId: user.id, status: 'active' },
      { status: 'cancelled', endTime: new Date() }
    )

    const trip = await Trip.create({
      userId: user.id,
      startTime: new Date(),
      status: 'active',
    })

    return NextResponse.json({ success: true, data: trip }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
