export interface IUser {
  _id: string
  name: string
  email: string
  phone: string
  profileImage: string
  vehicleType: string
  isVerified: boolean
  createdAt: Date
}

export interface IEmergencyContact {
  _id: string
  userId: string
  name: string
  phone: string
  relationship: string
  avatar: string
  priority: number
  alertSms: boolean
  shareLocation: boolean
}

export interface ITrip {
  _id: string
  userId: string
  startTime: Date
  endTime?: Date
  status: 'active' | 'completed' | 'cancelled'
  distance: number
  topSpeed: number
  avgSpeed: number
  safetyScore: number
  mood: string
  locations: { lat: number; lng: number; timestamp: Date }[]
}

export interface ITripEvent {
  _id: string
  tripId: string
  userId: string
  type: 'drowsiness' | 'speed' | 'crash' | 'distraction' | 'rest_suggestion' | 'manual_sos'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  data: Record<string, unknown>
  timestamp: Date
}

export interface IChatMessage {
  _id: string
  userId: string
  role: 'user' | 'bot'
  text: string
  createdAt: Date
}

export interface IUserSettings {
  _id: string
  userId: string
  notifications: {
    drowsiness: boolean
    speed: boolean
    emergency: boolean
    tips: boolean
    updates: boolean
    sound: boolean
  }
  emergencyAlert: boolean
  emergencyCall: boolean
  language: string
  locationSharing: boolean
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
