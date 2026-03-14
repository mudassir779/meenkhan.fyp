interface TwilioMessage {
  to: string
  body: string
}

interface TwilioCall {
  to: string
  message: string
}

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhone = process.env.TWILIO_PHONE_NUMBER

let twilioClient: any = null

async function getTwilioClient() {
  if (!accountSid || !authToken || accountSid === 'your-twilio-sid') return null
  if (twilioClient) return twilioClient
  try {
    // Dynamic require to avoid webpack bundling
    const mod = await eval("import('twilio')")
    twilioClient = mod.default(accountSid, authToken)
    return twilioClient
  } catch {
    return null
  }
}

export async function sendSMS({ to, body }: TwilioMessage): Promise<boolean> {
  try {
    const client = await getTwilioClient()
    if (!client) {
      console.log(`[SMS Mock] To: ${to} | Body: ${body}`)
      return true
    }
    await client.messages.create({
      body,
      from: twilioPhone,
      to,
    })
    return true
  } catch (error) {
    console.error('SMS send failed:', error)
    return false
  }
}

export async function makeCall({ to, message }: TwilioCall): Promise<boolean> {
  try {
    const client = await getTwilioClient()
    if (!client) {
      console.log(`[Call Mock] To: ${to} | Message: ${message}`)
      return true
    }
    await client.calls.create({
      twiml: `<Response><Say voice="alice">${message}</Say><Pause length="2"/><Say voice="alice">${message}</Say></Response>`,
      from: twilioPhone,
      to,
    })
    return true
  } catch (error) {
    console.error('Call failed:', error)
    return false
  }
}
