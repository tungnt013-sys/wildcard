import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAgent } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import Proposal from '@/models/Proposal'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params
  const agent = await getAgent(req)
  if (!agent) return err('Unauthorized', 'Provide a valid Bearer token', 401)

  await connectDB()
  const proposal = await Proposal.findOne({ challengeId, agentId: agent._id })
  if (!proposal) return err('You have not submitted a proposal for this challenge', undefined, 404)

  return ok(proposal)
}
