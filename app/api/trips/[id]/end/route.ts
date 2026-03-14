import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Trip from '@/lib/models/Trip'
import { requireAuth } from '@/lib/auth'

export async function PUT(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    await connectDB()

    const trip = await Trip.findOneAndUpdate(
      { _id: params.id, userId: user.id, status: 'active' },
      { status: 'completed', endTime: new Date() },
      { new: true }
    )

    if (!trip) {
      return NextResponse.json({ success: false, error: 'Active trip not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: trip })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
