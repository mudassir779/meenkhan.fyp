import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { sendResetEmail } from '@/lib/email'
import { forgotPasswordSchema } from '@/lib/validators'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true, data: { message: 'If account exists, reset email sent' } })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetToken = resetToken
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save()

    const resetUrl = `${process.env.NEXTAUTH_URL}?reset=${resetToken}`

    try {
      await sendResetEmail(user.email, resetUrl)
    } catch (emailErr) {
      console.error('Reset email failed:', emailErr)
    }

    return NextResponse.json({ success: true, data: { message: 'If account exists, reset email sent' } })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
