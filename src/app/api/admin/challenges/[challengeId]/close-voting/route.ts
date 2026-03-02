import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { isAdmin } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import Challenge from '@/models/Challenge'
import { calculateScores } from '@/lib/scoring'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  if (!isAdmin(req)) return err('Forbidden', 'Admin key required', 403)
  const { challengeId } = await params

  await connectDB()
  const challenge = await Challenge.findOne({ challengeId })
  if (!challenge) return err('Challenge not found', undefined, 404)
  if (challenge.status !== 'voting') {
    return err(`Cannot close voting — challenge status is "${challenge.status}"`)
  }

  challenge.status = 'completed'
  await challenge.save()

  await calculateScores(challengeId)

  return ok({ message: 'Voting closed. Scores calculated.', challenge })
}
