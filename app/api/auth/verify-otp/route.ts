import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { otpSchema } from '@/lib/validators'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = otpSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    await connectDB()
    const { email, otp } = parsed.data

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ success: false, error: 'Already verified' }, { status: 400 })
    }

    if (!user.otp || user.otp !== otp) {
      return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 })
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return NextResponse.json({ success: false, error: 'OTP expired' }, { status: 400 })
    }

    user.isVerified = true
    user.otp = null
    user.otpExpiry = null
    await user.save()

    return NextResponse.json({ success: true, data: { message: 'Email verified successfully' } })
  } catch (error) {
    console.error('OTP verify error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
