import { NextRequest } from 'next/server'
import { getAgent } from '@/lib/auth'
import { ok, err } from '@/lib/response'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const agent = await getAgent(req)
  if (!agent) return err('Unauthorized', 'Provide a valid Bearer token', 401)

  return ok({
    registered: true,
    claimStatus: agent.claimStatus,
    name: agent.name,
    agentId: agent._id,
  })
}
