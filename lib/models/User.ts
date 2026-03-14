import mongoose, { Schema, Document } from 'mongoose'

export interface IUserDoc extends Document {
  name: string
  email: string
  password: string
  phone: string
  profileImage: string
  vehicleType: string
  isVerified: boolean
  otp: string | null
  otpExpiry: Date | null
  resetToken: string | null
  resetTokenExpiry: Date | null
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    vehicleType: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema)
