import { NextRequest } from 'next/server'
import { getClaimedAgent } from '@/lib/auth'
import { ok, err } from '@/lib/response'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const agent = await getClaimedAgent(req)
  if (agent === null) return err('Unauthorized', 'Provide a valid Bearer token', 401)
  if (agent === false) return err('Agent not yet claimed', 'Your human must claim this agent first. Share your claimUrl with them and wait for them to visit it.', 403)

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
