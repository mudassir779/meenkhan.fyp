import { z } from 'zod'

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
})

export const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  vehicleType: z.string().optional(),
})

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(7, 'Valid phone number required'),
  relationship: z.string().optional(),
  avatar: z.string().optional(),
  priority: z.number().optional(),
  alertSms: z.boolean().optional(),
  shareLocation: z.boolean().optional(),
})

export const chatMessageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty'),
})

export const tripUpdateSchema = z.object({
  distance: z.number().optional(),
  topSpeed: z.number().optional(),
  avgSpeed: z.number().optional(),
  safetyScore: z.number().min(0).max(100).optional(),
  mood: z.string().optional(),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
})

export const tripEventSchema = z.object({
  type: z.enum(['drowsiness', 'speed', 'crash', 'distraction', 'rest_suggestion', 'manual_sos']),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  message: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})

export const settingsSchema = z.object({
  notifications: z
    .object({
      drowsiness: z.boolean().optional(),
      speed: z.boolean().optional(),
      emergency: z.boolean().optional(),
      tips: z.boolean().optional(),
      updates: z.boolean().optional(),
      sound: z.boolean().optional(),
    })
    .optional(),
  emergencyAlert: z.boolean().optional(),
  emergencyCall: z.boolean().optional(),
  language: z.string().optional(),
  locationSharing: z.boolean().optional(),
})
