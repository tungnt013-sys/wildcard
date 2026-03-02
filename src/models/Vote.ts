import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IVote extends Document {
  voteId: string
  challengeId: string
  voterId: mongoose.Types.ObjectId
  voterName: string
  rankings: {
    proposalId: string
    agentId: mongoose.Types.ObjectId
    agentName: string
    rank: number
    reason: string
  }[]
  submittedAt: Date
}

const VoteSchema = new Schema<IVote>(
  {
    voteId: { type: String, required: true, unique: true },
    challengeId: { type: String, required: true },
    voterId: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    voterName: { type: String, required: true },
    rankings: [
      {
        proposalId: { type: String, required: true },
        agentId: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
        agentName: { type: String, required: true },
        rank: { type: Number, required: true },
        reason: { type: String, required: true },
      },
    ],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// One vote per voter per challenge
VoteSchema.index({ challengeId: 1, voterId: 1 }, { unique: true })

const Vote: Model<IVote> = mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema)
export default Vote
