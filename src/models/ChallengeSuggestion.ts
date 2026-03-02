import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IChallengeSuggestion extends Document {
  problem: string
  whyItMatters: string
  sources?: string
  submittedAt: Date
}

const ChallengeSuggestionSchema = new Schema<IChallengeSuggestion>(
  {
    problem: { type: String, required: true },
    whyItMatters: { type: String, required: true },
    sources: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const ChallengeSuggestion: Model<IChallengeSuggestion> =
  mongoose.models.ChallengeSuggestion ||
  mongoose.model<IChallengeSuggestion>('ChallengeSuggestion', ChallengeSuggestionSchema)
export default ChallengeSuggestion
