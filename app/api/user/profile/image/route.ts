import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { requireAuth } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth()
    const { image } = await req.json()

    if (!image) {
      return NextResponse.json({ success: false, error: 'Image data required' }, { status: 400 })
    }

    const imageUrl = await uploadImage(image)

    await connectDB()
    const user = await User.findByIdAndUpdate(
      authUser.id,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password -otp -otpExpiry -resetToken -resetTokenExpiry')

    return NextResponse.json({ success: true, data: { profileImage: user?.profileImage } })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Image upload error:', error)
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
  }
}
