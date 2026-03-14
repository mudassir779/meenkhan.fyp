import mongoose, { Schema, Document } from 'mongoose'

export interface ITripDoc extends Document {
  userId: mongoose.Types.ObjectId
  startTime: Date
  endTime: Date | null
  status: 'active' | 'completed' | 'cancelled'
  distance: number
  topSpeed: number
  avgSpeed: number
  safetyScore: number
  mood: string
  locations: { lat: number; lng: number; timestamp: Date }[]
}

const TripSchema = new Schema<ITripDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: null },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    distance: { type: Number, default: 0 },
    topSpeed: { type: Number, default: 0 },
    avgSpeed: { type: Number, default: 0 },
    safetyScore: { type: Number, default: 100 },
    mood: { type: String, default: 'Alert' },
    locations: [
      {
        lat: Number,
        lng: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

export default mongoose.models.Trip || mongoose.model<ITripDoc>('Trip', TripSchema)
