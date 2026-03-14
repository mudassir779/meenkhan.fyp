import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { sendOTPEmail, generateOTP } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ success: false, error: 'Already verified' }, { status: 400 })
    }

    const otp = generateOTP()
    user.otp = otp
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    try {
      await sendOTPEmail(email, otp)
    } catch (emailErr) {
      console.error('Email send failed:', emailErr)
    }

    return NextResponse.json({ success: true, data: { message: 'OTP resent' } })
  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
