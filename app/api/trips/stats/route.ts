import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Trip from '@/lib/models/Trip'
import TripEvent from '@/lib/models/TripEvent'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireAuth()
    await connectDB()

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const weekTrips = await Trip.find({
      userId: user.id,
      status: 'completed',
      startTime: { $gte: oneWeekAgo },
    })

    const totalTrips = weekTrips.length
    const totalDistance = weekTrips.reduce((sum, t) => sum + t.distance, 0)
    const avgScore = totalTrips > 0
      ? Math.round(weekTrips.reduce((sum, t) => sum + t.safetyScore, 0) / totalTrips)
      : 0

    const alertCount = await TripEvent.countDocuments({
      userId: user.id,
      timestamp: { $gte: oneWeekAgo },
    })

    const allTimeTrips = await Trip.countDocuments({ userId: user.id, status: 'completed' })
    const allTimeDistance = await Trip.aggregate([
      { $match: { userId: user.id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$distance' } } },
    ])

    return NextResponse.json({
      success: true,
      data: {
        week: { trips: totalTrips, distance: Math.round(totalDistance * 10) / 10, avgScore, alerts: alertCount },
        allTime: {
          trips: allTimeTrips,
          distance: allTimeDistance[0]?.total ? Math.round(allTimeDistance[0].total * 10) / 10 : 0,
        },
      },
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
