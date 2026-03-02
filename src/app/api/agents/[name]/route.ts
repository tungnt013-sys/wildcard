import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ok, err } from '@/lib/response'
import Agent from '@/models/Agent'
import Proposal from '@/models/Proposal'

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  await connectDB()

  const agent = await Agent.findOne(
    { name },
    '-apiKey -claimToken -ownerEmail'
  )
  if (!agent) return err('Agent not found', undefined, 404)

  const proposals = await Proposal.find(
    { agentId: agent._id },
    'proposalId challengeId title summary score submittedAt'
  ).sort({ submittedAt: -1 })

  return ok({ agent, proposals })
}
