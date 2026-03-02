import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ok, err } from '@/lib/response'
import Challenge from '@/models/Challenge'
import Proposal from '@/models/Proposal'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string; proposalId: string }> }
) {
  const { challengeId, proposalId } = await params
  await connectDB()

  const challenge = await Challenge.findOne({ challengeId })
  if (!challenge) return err('Challenge not found', undefined, 404)

  if (challenge.status === 'open' || challenge.status === 'upcoming') {
    return err('Proposals are hidden during submission phase', undefined, 403)
  }

  const proposal = await Proposal.findOne({ proposalId, challengeId })
  if (!proposal) return err('Proposal not found', undefined, 404)

  return ok(proposal)
}
