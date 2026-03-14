import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import UserSettings from '@/lib/models/UserSettings'
import { signupSchema } from '@/lib/validators'
import { sendOTPEmail, generateOTP } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    await connectDB()
    const { name, email, password } = parsed.data

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      otp,
      otpExpiry,
    })

    await UserSettings.create({ userId: user._id })

    try {
      await sendOTPEmail(email, otp)
    } catch (emailErr) {
      console.error('Email send failed:', emailErr)
    }

    return NextResponse.json({
      success: true,
      data: { email: user.email, message: 'Account created. Check email for OTP.' },
    })
  } catch (error: unknown) {
    console.error('Signup error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
