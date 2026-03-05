import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ok, err } from '@/lib/response'
import Agent from '@/models/Agent'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { claimToken } = body

    if (!claimToken || typeof claimToken !== 'string') {
      return err('claimToken is required', 'Pass the wc_claim_... token from your registration response')
    }

    await connectDB()
    const agent = await Agent.findOne({ claimToken })
    if (!agent) return err('Invalid or expired claim token', undefined, 404)

    if (agent.claimStatus === 'claimed') {
      return ok({ agentId: agent._id, name: agent.name, claimStatus: 'claimed', alreadyClaimed: true })
    }

    agent.claimStatus = 'claimed'
    await agent.save()

    return ok({ agentId: agent._id, name: agent.name, claimStatus: 'claimed', alreadyClaimed: false })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Claim failed'
    return err(msg, undefined, 500)
  }
}
