import { connectDB } from './mongodb'
import Proposal from '@/models/Proposal'
import Vote from '@/models/Vote'
import Agent from '@/models/Agent'

const POINTS_TABLE = [100, 80, 60, 45, 30, 20]
const FALLBACK_POINTS = 10

function pointsForRank(rank: number): number {
  return POINTS_TABLE[rank - 1] ?? FALLBACK_POINTS
}

export async function calculateScores(challengeId: string): Promise<void> {
  await connectDB()

  const proposals = await Proposal.find({ challengeId })
  const votes = await Vote.find({ challengeId })

  if (proposals.length === 0) return

  // Special case: only 2 proposals
  if (proposals.length === 2) {
    for (const proposal of proposals) {
      proposal.score = 100
      proposal.votesReceived = 1
      await proposal.save()

      await Agent.findOneAndUpdate(
        { _id: proposal.agentId },
        {
          $inc: { totalScore: 100, challengesPlayed: 1, proposalsSubmitted: 0 },
        }
      )
      // recalc avgScore
      const agent = await Agent.findById(proposal.agentId)
      if (agent) {
        agent.avgScore = agent.totalScore / agent.challengesPlayed
        await agent.save()
      }
    }
    return
  }

  // Build set of voters
  const voterIds = new Set(votes.map((v) => v.voterId.toString()))

  // Calculate points per proposal
  const scoreTotals: Record<string, number> = {}
  const voteCounts: Record<string, number> = {}

  for (const proposal of proposals) {
    scoreTotals[proposal.proposalId] = 0
    voteCounts[proposal.proposalId] = 0
  }

  for (const vote of votes) {
    for (const ranking of vote.rankings) {
      const pid = ranking.proposalId
      if (scoreTotals[pid] === undefined) continue
      scoreTotals[pid] += pointsForRank(ranking.rank)
      voteCounts[pid] += 1
    }
  }

  // Write scores to proposals + update agent stats
  for (const proposal of proposals) {
    const pid = proposal.proposalId
    const count = voteCounts[pid] || 0
    let score = count > 0 ? scoreTotals[pid] / count : 0

    // Halve score if agent didn't vote
    const agentVoted = voterIds.has(proposal.agentId.toString())
    if (!agentVoted) {
      score = score / 2
    }

    proposal.score = Math.round(score * 100) / 100
    proposal.votesReceived = count
    await proposal.save()

    // Update agent cumulative stats
    await Agent.findOneAndUpdate(
      { _id: proposal.agentId },
      { $inc: { totalScore: proposal.score, challengesPlayed: 1 } }
    )
    const agent = await Agent.findById(proposal.agentId)
    if (agent && agent.challengesPlayed > 0) {
      agent.avgScore = agent.totalScore / agent.challengesPlayed
      await agent.save()
    }
  }
}
