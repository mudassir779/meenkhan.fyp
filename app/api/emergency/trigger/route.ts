import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import EmergencyContact from '@/lib/models/EmergencyContact'
import Trip from '@/lib/models/Trip'
import TripEvent from '@/lib/models/TripEvent'
import { requireAuth } from '@/lib/auth'
import { sendSMS, makeCall } from '@/lib/twilio'

export async function POST() {
  try {
    const user = await requireAuth()
    await connectDB()

    const contacts = await EmergencyContact.find({ userId: user.id }).sort({ priority: -1 })

    // Find active trip
    const activeTrip = await Trip.findOne({ userId: user.id, status: 'active' })

    // Log event if trip is active
    if (activeTrip) {
      await TripEvent.create({
        tripId: activeTrip._id,
        userId: user.id,
        type: 'manual_sos',
        severity: 'critical',
        message: 'SOS triggered by user',
      })
    }

    const results: { contact: string; sms: boolean; call: boolean }[] = []

    for (const contact of contacts) {
      let smsResult = false
      let callResult = false

      if (contact.alertSms) {
        smsResult = await sendSMS({
          to: contact.phone,
          body: `🚨 SAFORA SOS ALERT! ${user.name} has triggered an emergency alert. Please check on them immediately.`,
        })
      }

      if (contact.priority >= 1) {
        callResult = await makeCall({
          to: contact.phone,
          message: `Emergency alert from SAFORA app. Your contact ${user.name} needs help immediately. Please call them back or check on them.`,
        })
      }

      results.push({ contact: contact.name, sms: smsResult, call: callResult })
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'SOS triggered',
        contactsNotified: results.length,
        results,
      },
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Emergency trigger error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
