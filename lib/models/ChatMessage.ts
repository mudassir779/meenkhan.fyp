import mongoose, { Schema, Document } from 'mongoose'

export interface IChatMessageDoc extends Document {
  userId: mongoose.Types.ObjectId
  role: 'user' | 'bot'
  text: string
  createdAt: Date
}

const ChatMessageSchema = new Schema<IChatMessageDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['user', 'bot'], required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.ChatMessage || mongoose.model<IChatMessageDoc>('ChatMessage', ChatMessageSchema)
