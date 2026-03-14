import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import EmergencyContact from '@/lib/models/EmergencyContact'
import { requireAuth } from '@/lib/auth'
import { sendSMS } from '@/lib/twilio'

export async function POST() {
  try {
    const user = await requireAuth()
    await connectDB()

    const contacts = await EmergencyContact.find({ userId: user.id, alertSms: true })

    for (const contact of contacts) {
      await sendSMS({
        to: contact.phone,
        body: `✅ SAFORA: ${user.name} has cancelled the emergency alert. They are safe.`,
      })
    }

    return NextResponse.json({
      success: true,
      data: { message: 'SOS cancelled', contactsNotified: contacts.length },
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
