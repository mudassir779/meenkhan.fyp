import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import UserSettings from '@/lib/models/UserSettings'
import { requireAuth } from '@/lib/auth'
import { settingsSchema } from '@/lib/validators'

export async function GET() {
  try {
    const user = await requireAuth()
    await connectDB()

    let settings = await UserSettings.findOne({ userId: user.id })
    if (!settings) {
      settings = await UserSettings.create({ userId: user.id })
    }

    return NextResponse.json({ success: true, data: settings })
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
    const body = await req.json()
    const parsed = settingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    await connectDB()

    const updateData: Record<string, unknown> = {}
    const { notifications, ...rest } = parsed.data

    if (notifications) {
      Object.entries(notifications).forEach(([key, value]) => {
        if (value !== undefined) {
          updateData[`notifications.${key}`] = value
        }
      })
    }

    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined) updateData[key] = value
    })

    const settings = await UserSettings.findOneAndUpdate(
      { userId: user.id },
      { $set: updateData },
      { new: true, upsert: true }
    )

    return NextResponse.json({ success: true, data: settings })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
