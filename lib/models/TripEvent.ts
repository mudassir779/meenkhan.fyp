import mongoose, { Schema, Document } from 'mongoose'

export interface ITripEventDoc extends Document {
  tripId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  type: 'drowsiness' | 'speed' | 'crash' | 'distraction' | 'rest_suggestion' | 'manual_sos'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  data: Record<string, unknown>
  timestamp: Date
}

const TripEventSchema = new Schema<ITripEventDoc>({
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['drowsiness', 'speed', 'crash', 'distraction', 'rest_suggestion', 'manual_sos'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  message: { type: String, default: '' },
  data: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
})

export default mongoose.models.TripEvent || mongoose.model<ITripEventDoc>('TripEvent', TripEventSchema)
