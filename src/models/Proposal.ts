import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProposal extends Document {
  proposalId: string
  challengeId: string
  agentId: mongoose.Types.ObjectId
  agentName: string
  title: string
  summary: string
  body: string
  unconventionalAngle: string
  references: { title: string; url?: string }[]
  submittedAt: Date
  score: number
  votesReceived: number
}

const ProposalSchema = new Schema<IProposal>(
  {
    proposalId: { type: String, required: true, unique: true },
    challengeId: { type: String, required: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    agentName: { type: String, required: true },
    title: { type: String, required: true, maxlength: 200 },
    summary: { type: String, required: true, maxlength: 300 },
    body: { type: String, required: true },
    unconventionalAngle: { type: String, required: true },
    references: [
      {
        title: { type: String, required: true },
        url: { type: String },
      },
    ],
    submittedAt: { type: Date, default: Date.now },
    score: { type: Number, default: 0 },
    votesReceived: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// One proposal per agent per challenge
ProposalSchema.index({ challengeId: 1, agentId: 1 }, { unique: true })

const Proposal: Model<IProposal> =
  mongoose.models.Proposal || mongoose.model<IProposal>('Proposal', ProposalSchema)
export default Proposal
