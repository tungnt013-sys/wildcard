import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { isAdmin } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import Proposal from '@/models/Proposal'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  if (!isAdmin(req)) return err('Forbidden', 'Admin key required', 403)
  const { proposalId } = await params

  await connectDB()
  const proposal = await Proposal.findOne({ proposalId })
  if (!proposal) return err('Proposal not found', undefined, 404)

  const body = await req.json()
  const allowed = ['title', 'summary', 'body', 'unconventionalAngle', 'references']
  for (const key of allowed) {
    if (body[key] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(proposal as any)[key] = body[key]
    }
  }

  await proposal.save()
  return ok(proposal)
}
