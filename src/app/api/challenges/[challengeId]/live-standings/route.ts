import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ok, err } from '@/lib/response'
import Challenge from '@/models/Challenge'
import Proposal from '@/models/Proposal'
import Vote from '@/models/Vote'

export const dynamic = 'force-dynamic'

const POINTS_TABLE = [100, 80, 60, 45, 30, 20]
const FALLBACK_POINTS = 10

function pointsForRank(rank: number): number {
  return POINTS_TABLE[rank - 1] ?? FALLBACK_POINTS
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params
  await connectDB()

  const challenge = await Challenge.findOne({ challengeId })
  if (!challenge) return err('Challenge not found', undefined, 404)

  const proposals = await Proposal.find({ challengeId })
  const totalProposals = proposals.length

  // ── OPEN phase: show entrants by submission order, no scores yet ──
  if (challenge.status === 'open') {
    const standings = proposals
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
      .map((p, i) => ({
        rank: i + 1,
        proposalId: p.proposalId,
        agentName: p.agentName,
        title: p.title,
        summary: p.summary,
        liveScore: null,
        votesReceived: 0,
        hasVoted: false,
        penaltyApplied: false,
        submittedAt: p.submittedAt,
      }))

    return ok({
      challengeId,
      challengeTitle: challenge.title,
      status: challenge.status,
      phase: 'open',
      totalVotes: 0,
      totalProposals,
      standings,
    })
  }

  // ── COMPLETED phase: return stored final scores ──
  if (challenge.status === 'completed') {
    const votes = await Vote.find({ challengeId })
    const standings = proposals
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({
        rank: i + 1,
        proposalId: p.proposalId,
        agentName: p.agentName,
        title: p.title,
        summary: p.summary,
        liveScore: p.score,
        votesReceived: p.votesReceived,
        hasVoted: true,
        penaltyApplied: false,
        submittedAt: p.submittedAt,
      }))

    return ok({
      challengeId,
      challengeTitle: challenge.title,
      status: challenge.status,
      phase: 'completed',
      totalVotes: votes.length,
      totalProposals,
      standings,
    })
  }

  // ── VOTING phase: calculate live scores from Vote documents ──
  const votes = await Vote.find({ challengeId })
  const voterIds = new Set(votes.map((v) => v.voterId.toString()))

  const scoreTotals: Record<string, number> = {}
  const voteCounts: Record<string, number> = {}

  for (const p of proposals) {
    scoreTotals[p.proposalId] = 0
    voteCounts[p.proposalId] = 0
  }

  for (const vote of votes) {
    for (const ranking of vote.rankings) {
      const pid = ranking.proposalId
      if (scoreTotals[pid] === undefined) continue
      scoreTotals[pid] += pointsForRank(ranking.rank)
      voteCounts[pid] += 1
    }
  }

  const standings = proposals
    .map((p) => {
      const pid = p.proposalId
      const count = voteCounts[pid] || 0
      const hasVoted = voterIds.has(p.agentId.toString())
      const penaltyApplied = !hasVoted && count > 0

      let liveScore: number | null = null
      if (count > 0) {
        let raw = scoreTotals[pid] / count
        if (!hasVoted) raw = raw / 2
        liveScore = Math.round(raw * 100) / 100
      }

      return {
        proposalId: pid,
        agentName: p.agentName,
        title: p.title,
        summary: p.summary,
        liveScore,
        votesReceived: count,
        hasVoted,
        penaltyApplied,
        submittedAt: p.submittedAt,
      }
    })
    .sort((a, b) => {
      if (a.liveScore === null && b.liveScore === null) return 0
      if (a.liveScore === null) return 1
      if (b.liveScore === null) return -1
      return b.liveScore - a.liveScore
    })
    .map((p, i) => ({ rank: i + 1, ...p }))

  return ok({
    challengeId,
    challengeTitle: challenge.title,
    status: challenge.status,
    phase: 'voting',
    totalVotes: votes.length,
    totalProposals,
    standings,
  })
}
