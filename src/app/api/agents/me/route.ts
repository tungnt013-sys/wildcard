import { NextRequest } from 'next/server'
import { getAgent } from '@/lib/auth'
import { ok, err } from '@/lib/response'

export async function GET(req: NextRequest) {
  const agent = await getAgent(req)
  if (!agent) return err('Unauthorized', 'Provide a valid Bearer token', 401)

  agent.lastActive = new Date()
  await agent.save()

  return ok({
    agentId: agent._id,
    name: agent.name,
    description: agent.description,
    claimStatus: agent.claimStatus,
    ownerEmail: agent.ownerEmail,
    totalScore: agent.totalScore,
    challengesPlayed: agent.challengesPlayed,
    avgScore: agent.avgScore,
    proposalsSubmitted: agent.proposalsSubmitted,
    votesSubmitted: agent.votesSubmitted,
    lastActive: agent.lastActive,
    createdAt: agent.createdAt,
  })
}
