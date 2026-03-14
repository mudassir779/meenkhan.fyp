import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import UserSettings from '@/lib/models/UserSettings'
import Trip from '@/lib/models/Trip'
import { requireAuth } from '@/lib/auth'

// Update location for active trip
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { lat, lng } = await req.json()

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ success: false, error: 'lat and lng required' }, { status: 400 })
    }

    await connectDB()

    const trip = await Trip.findOneAndUpdate(
      { userId: user.id, status: 'active' },
      { $push: { locations: { lat, lng, timestamp: new Date() } } },
      { new: true }
    )

    return NextResponse.json({
      success: true,
      data: { updated: !!trip, tripId: trip?._id || null },
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// Get/update location sharing setting
export async function GET() {
  try {
    const user = await requireAuth()
    await connectDB()

    const settings = await UserSettings.findOne({ userId: user.id })
    return NextResponse.json({
      success: true,
      data: { locationSharing: settings?.locationSharing ?? false },
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { locationSharing } = await req.json()

    await connectDB()
    await UserSettings.findOneAndUpdate(
      { userId: user.id },
      { locationSharing: !!locationSharing },
      { upsert: true }
    )

    return NextResponse.json({ success: true, data: { locationSharing: !!locationSharing } })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
