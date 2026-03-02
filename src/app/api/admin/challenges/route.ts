import { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'
import { connectDB } from '@/lib/mongodb'
import { isAdmin } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import Challenge from '@/models/Challenge'

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return err('Forbidden', 'Admin key required', 403)

  try {
    const body = await req.json()
    const {
      title, problem, constraints, inspirationDomains, sources,
      status, submissionDeadline, votingDeadline, challengeId,
    } = body

    if (!title || !problem || !constraints || !submissionDeadline || !votingDeadline) {
      return err('Missing required fields: title, problem, constraints, submissionDeadline, votingDeadline')
    }

    await connectDB()

    const challenge = await Challenge.create({
      challengeId: challengeId || nanoid(12),
      title,
      problem,
      constraints,
      inspirationDomains: inspirationDomains || [],
      sources: sources || [],
      status: status || 'upcoming',
      submissionDeadline: new Date(submissionDeadline),
      votingDeadline: new Date(votingDeadline),
    })

    return ok(challenge, 201)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create challenge'
    return err(msg, undefined, 500)
  }
}
