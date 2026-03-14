import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { requireAuth } from '@/lib/auth'
import { profileUpdateSchema } from '@/lib/validators'

export async function GET() {
  try {
    const authUser = await requireAuth()
    await connectDB()

    const user = await User.findById(authUser.id).select('-password -otp -otpExpiry -resetToken -resetTokenExpiry')
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await requireAuth()
    const body = await req.json()
    const parsed = profileUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    await connectDB()
    const user = await User.findByIdAndUpdate(
      authUser.id,
      { $set: parsed.data },
      { new: true }
    ).select('-password -otp -otpExpiry -resetToken -resetTokenExpiry')

    return NextResponse.json({ success: true, data: user })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
