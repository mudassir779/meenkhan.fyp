import mongoose, { Schema, Document } from 'mongoose'

export interface IUserSettingsDoc extends Document {
  userId: mongoose.Types.ObjectId
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

const UserSettingsSchema = new Schema<IUserSettingsDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    notifications: {
      drowsiness: { type: Boolean, default: true },
      speed: { type: Boolean, default: true },
      emergency: { type: Boolean, default: true },
      tips: { type: Boolean, default: false },
      updates: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
    },
    emergencyAlert: { type: Boolean, default: true },
    emergencyCall: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    locationSharing: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export default mongoose.models.UserSettings || mongoose.model<IUserSettingsDoc>('UserSettings', UserSettingsSchema)
