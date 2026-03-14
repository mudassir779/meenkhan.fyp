import mongoose, { Schema, Document } from 'mongoose'

export interface IEmergencyContactDoc extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  phone: string
  relationship: string
  avatar: string
  priority: number
  alertSms: boolean
  shareLocation: boolean
}

const EmergencyContactSchema = new Schema<IEmergencyContactDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    relationship: { type: String, default: 'Other' },
    avatar: { type: String, default: '👤' },
    priority: { type: Number, default: 0 },
    alertSms: { type: Boolean, default: true },
    shareLocation: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export default mongoose.models.EmergencyContact || mongoose.model<IEmergencyContactDoc>('EmergencyContact', EmergencyContactSchema)
