import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import EmergencyContact from '@/lib/models/EmergencyContact'
import TripEvent from '@/lib/models/TripEvent'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireAuth()
    await connectDB()

    const contactCount = await EmergencyContact.countDocuments({ userId: user.id })

    const recentSOS = await TripEvent.findOne({
      userId: user.id,
      type: 'manual_sos',
    }).sort({ timestamp: -1 })

    return NextResponse.json({
      success: true,
      data: {
        emergencyContactsCount: contactCount,
        lastSOS: recentSOS?.timestamp || null,
        isActive: recentSOS
          ? Date.now() - recentSOS.timestamp.getTime() < 5 * 60 * 1000
          : false,
      },
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
