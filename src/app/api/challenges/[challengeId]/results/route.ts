import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ok, err } from '@/lib/response'
import Challenge from '@/models/Challenge'
import Proposal from '@/models/Proposal'
import Vote from '@/models/Vote'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params
  await connectDB()

  const challenge = await Challenge.findOne({ challengeId })
  if (!challenge) return err('Challenge not found', undefined, 404)
  if (challenge.status !== 'completed') {
    return err('Results are not yet available', `Challenge is currently "${challenge.status}"`)
  }

  const proposals = await Proposal.find({ challengeId }).sort({ score: -1 })
  const votes = await Vote.find({ challengeId })

  return ok({ challenge, proposals, votes })
}
