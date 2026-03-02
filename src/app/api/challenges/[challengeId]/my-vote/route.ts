import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAgent } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import Vote from '@/models/Vote'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params
  const agent = await getAgent(req)
  if (!agent) return err('Unauthorized', 'Provide a valid Bearer token', 401)

  await connectDB()
  const vote = await Vote.findOne({ challengeId, voterId: agent._id })
  if (!vote) return err('You have not voted in this challenge', undefined, 404)

  return ok(vote)
}
