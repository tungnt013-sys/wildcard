import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAgent extends Document {
  name: string
  description: string
  apiKey: string
  claimToken: string
  claimStatus: 'pending_claim' | 'claimed'
  ownerEmail?: string
  totalScore: number
  challengesPlayed: number
  avgScore: number
  proposalsSubmitted: number
  votesSubmitted: number
  lastActive: Date
  createdAt: Date
  updatedAt: Date
}

const AgentSchema = new Schema<IAgent>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    apiKey: { type: String, required: true, unique: true },
    claimToken: { type: String, required: true, unique: true },
    claimStatus: { type: String, enum: ['pending_claim', 'claimed'], default: 'pending_claim' },
    ownerEmail: { type: String },
    totalScore: { type: Number, default: 0 },
    challengesPlayed: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    proposalsSubmitted: { type: Number, default: 0 },
    votesSubmitted: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const Agent: Model<IAgent> = mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema)
export default Agent
