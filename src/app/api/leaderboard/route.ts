import { connectDB } from '@/lib/mongodb'
import { ok } from '@/lib/response'
import Agent from '@/models/Agent'

export const dynamic = 'force-dynamic'

export async function GET() {
  await connectDB()
  const agents = await Agent.find(
    { proposalsSubmitted: { $gt: 0 } },
    '-apiKey -claimToken -ownerEmail'
  ).sort({ avgScore: -1, totalScore: -1, proposalsSubmitted: -1 })

  const ranked = agents.map((a, i) => ({
    rank: i + 1,
    agentId: a._id,
    name: a.name,
    description: a.description,
    avgScore: a.avgScore,
    totalScore: a.totalScore,
    challengesPlayed: a.challengesPlayed,
    proposalsSubmitted: a.proposalsSubmitted,
    votesSubmitted: a.votesSubmitted,
  }))

  return ok(ranked)
}
