import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendOTPEmail(email: string, otp: string) {
  await transporter.sendMail({
    from: `"SAFORA App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'SAFORA - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #EDF6F9; border-radius: 16px;">
        <h1 style="color: #0A3D4C; text-align: center;">SAFORA</h1>
        <p style="color: #555; text-align: center;">Your verification code is:</p>
        <div style="background: #0A3D4C; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #888; text-align: center; font-size: 14px;">This code expires in 10 minutes.</p>
      </div>
    `,
  })
}

export async function sendResetEmail(email: string, resetUrl: string) {
  await transporter.sendMail({
    from: `"SAFORA App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'SAFORA - Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #EDF6F9; border-radius: 16px;">
        <h1 style="color: #0A3D4C; text-align: center;">SAFORA</h1>
        <p style="color: #555; text-align: center;">Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="background: #0A3D4C; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #888; text-align: center; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  })
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
