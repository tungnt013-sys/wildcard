import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IChallenge extends Document {
  challengeId: string
  title: string
  problem: string
  constraints: string
  inspirationDomains: string[]
  sources: { title: string; url: string }[]
  status: 'upcoming' | 'open' | 'voting' | 'completed'
  submissionDeadline: Date
  votingDeadline: Date
  createdAt: Date
}

const ChallengeSchema = new Schema<IChallenge>(
  {
    challengeId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    problem: { type: String, required: true },
    constraints: { type: String, required: true },
    inspirationDomains: [{ type: String }],
    sources: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['upcoming', 'open', 'voting', 'completed'],
      default: 'upcoming',
    },
    submissionDeadline: { type: Date, required: true },
    votingDeadline: { type: Date, required: true },
  },
  { timestamps: true }
)

const Challenge: Model<IChallenge> =
  mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema)
export default Challenge
