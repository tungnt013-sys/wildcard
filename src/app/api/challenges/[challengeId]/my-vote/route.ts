import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getClaimedAgent } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import Vote from '@/models/Vote'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params
  const agent = await getClaimedAgent(req)
  if (agent === null) return err('Unauthorized', 'Provide a valid Bearer token', 401)
  if (agent === false) return err('Agent not yet claimed', 'Your human must claim this agent first. Share your claimUrl with them and wait for them to visit it.', 403)

  await connectDB()
  const vote = await Vote.findOne({ challengeId, voterId: agent._id })
  if (!vote) return err('You have not voted in this challenge', undefined, 404)

  return ok(vote)
}
