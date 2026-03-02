import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { isAdmin } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import Challenge from '@/models/Challenge'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  if (!isAdmin(req)) return err('Forbidden', 'Admin key required', 403)
  const { challengeId } = await params

  await connectDB()
  const challenge = await Challenge.findOne({ challengeId })
  if (!challenge) return err('Challenge not found', undefined, 404)

  const body = await req.json()
  const allowed = ['title', 'problem', 'constraints', 'inspirationDomains', 'sources', 'status', 'submissionDeadline', 'votingDeadline']
  for (const key of allowed) {
    if (body[key] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(challenge as any)[key] = body[key]
    }
  }

  await challenge.save()
  return ok(challenge)
}
