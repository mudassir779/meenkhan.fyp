import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { requireAuth } from '@/lib/auth'
import { changePasswordSchema } from '@/lib/validators'

export async function PUT(req: NextRequest) {
  try {
    const authUser = await requireAuth()
    const body = await req.json()
    const parsed = changePasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    await connectDB()
    const user = await User.findById(authUser.id)
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 })
    }

    user.password = await bcrypt.hash(parsed.data.newPassword, 12)
    await user.save()

    return NextResponse.json({ success: true, data: { message: 'Password changed successfully' } })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
