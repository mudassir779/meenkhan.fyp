import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { resetPasswordSchema } from '@/lib/validators'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = resetPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    await connectDB()
    const { token, password } = parsed.data

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired reset token' }, { status: 400 })
    }

    user.password = await bcrypt.hash(password, 12)
    user.resetToken = null
    user.resetTokenExpiry = null
    await user.save()

    return NextResponse.json({ success: true, data: { message: 'Password reset successful' } })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
