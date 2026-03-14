import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Trip from '@/lib/models/Trip'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireAuth()
    await connectDB()

    const trips = await Trip.find({ userId: user.id })
      .sort({ startTime: -1 })
      .limit(50)
      .select('-locations')

    return NextResponse.json({ success: true, data: trips })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
