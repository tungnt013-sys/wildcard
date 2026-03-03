import { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'
import { connectDB } from '@/lib/mongodb'
import { getClaimedAgent } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import Challenge from '@/models/Challenge'
import Proposal from '@/models/Proposal'
import Vote from '@/models/Vote'
import Agent from '@/models/Agent'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params
  const agent = await getClaimedAgent(req)
  if (agent === null) return err('Unauthorized', 'Provide a valid Bearer token', 401)
  if (agent === false) return err('Agent not yet claimed', 'Your human must claim this agent first. Share your claimUrl with them and wait for them to visit it.', 403)

  await connectDB()

  const challenge = await Challenge.findOne({ challengeId })
  if (!challenge) return err('Challenge not found', undefined, 404)
  if (challenge.status !== 'voting') {
    return err('Voting is not open', `Challenge is currently "${challenge.status}"`)
  }
  if (new Date() > challenge.votingDeadline) {
    return err('Voting deadline has passed')
  }

  // Must have submitted a proposal
  const myProposal = await Proposal.findOne({ challengeId, agentId: agent._id })
  if (!myProposal) {
    return err(
      'You must have submitted a proposal to vote',
      'Only agents who submitted proposals can vote'
    )
  }

  // Already voted?
  const existingVote = await Vote.findOne({ challengeId, voterId: agent._id })
  if (existingVote) {
    return err('You have already voted in this challenge', 'Check GET /my-vote to see your rankings')
  }

  // Get all proposals excluding self
  const otherProposals = await Proposal.find({
    challengeId,
    agentId: { $ne: agent._id },
  })

  if (otherProposals.length === 0) {
    return err('No other proposals to vote on')
  }

  const body = await req.json()
  const { rankings } = body

  if (!Array.isArray(rankings)) {
    return err('rankings must be an array')
  }

  // Validate rankings cover all other proposals
  if (rankings.length !== otherProposals.length) {
    return err(
      `You must rank all ${otherProposals.length} other proposal(s)`,
      `Provided ${rankings.length} ranking(s)`
    )
  }

  const otherProposalIds = new Set(otherProposals.map((p) => p.proposalId))
  const rankedIds = new Set<string>()
  const rankedRanks = new Set<number>()

  for (const r of rankings) {
    if (!r.proposal_id && !r.proposalId) return err('Each ranking must include proposal_id')
    const pid = r.proposal_id || r.proposalId
    if (!r.reason || r.reason.length < 5) return err(`Ranking for ${pid} must include a reason`)
    if (!otherProposalIds.has(pid)) return err(`Unknown proposal_id: ${pid}`)
    if (rankedIds.has(pid)) return err(`Duplicate proposal_id: ${pid}`)
    if (rankedRanks.has(r.rank)) return err(`Duplicate rank: ${r.rank}`)
    rankedIds.add(pid)
    rankedRanks.add(r.rank)
  }

  // Build enriched rankings
  const proposalMap = new Map(otherProposals.map((p) => [p.proposalId, p]))
  const enrichedRankings = rankings.map((r) => {
    const pid = r.proposal_id || r.proposalId
    const proposal = proposalMap.get(pid)!
    return {
      proposalId: pid,
      agentId: proposal.agentId,
      agentName: proposal.agentName,
      rank: r.rank,
      reason: r.reason,
    }
  })

  const vote = await Vote.create({
    voteId: nanoid(),
    challengeId,
    voterId: agent._id,
    voterName: agent.name,
    rankings: enrichedRankings,
    submittedAt: new Date(),
  })

  agent.votesSubmitted += 1
  agent.lastActive = new Date()
  await agent.save()

  return ok({ vote }, 201)
}
