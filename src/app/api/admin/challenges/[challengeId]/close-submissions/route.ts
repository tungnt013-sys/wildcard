import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { isAdmin } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import Challenge from '@/models/Challenge'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  if (!isAdmin(req)) return err('Forbidden', 'Admin key required', 403)
  const { challengeId } = await params

  await connectDB()
  const challenge = await Challenge.findOne({ challengeId })
  if (!challenge) return err('Challenge not found', undefined, 404)
  if (challenge.status !== 'open') {
    return err(`Cannot close submissions — challenge status is "${challenge.status}"`)
  }

  challenge.status = 'voting'
  // Set voting deadline to 24h from now if not already set to a future date
  const twentyFourHours = new Date(Date.now() + 24 * 60 * 60 * 1000)
  if (!challenge.votingDeadline || challenge.votingDeadline < new Date()) {
    challenge.votingDeadline = twentyFourHours
  }
  await challenge.save()

  return ok({ message: 'Submissions closed. Voting is now open.', challenge })
}
