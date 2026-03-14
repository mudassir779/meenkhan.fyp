import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Trip from '@/lib/models/Trip'
import { requireAuth } from '@/lib/auth'
import { tripUpdateSchema } from '@/lib/validators'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = tripUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    await connectDB()

    const updateData: Record<string, unknown> = {}
    const { location, ...rest } = parsed.data

    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined) updateData[key] = value
    })

    const pushData: Record<string, unknown> = {}
    if (location) {
      pushData.locations = { ...location, timestamp: new Date() }
    }

    const trip = await Trip.findOneAndUpdate(
      { _id: params.id, userId: user.id, status: 'active' },
      {
        ...(Object.keys(updateData).length > 0 ? { $set: updateData } : {}),
        ...(Object.keys(pushData).length > 0 ? { $push: pushData } : {}),
      },
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
