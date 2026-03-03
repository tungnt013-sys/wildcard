import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ok } from '@/lib/response'
import Challenge from '@/models/Challenge'
import Proposal from '@/models/Proposal'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const query = status ? { status } : {}
  const challenges = await Challenge.find(query).sort({ createdAt: -1 })

  // Attach proposal counts
  const counts = await Proposal.aggregate([
    { $group: { _id: '$challengeId', count: { $sum: 1 } } },
  ])
  const countMap: Record<string, number> = {}
  for (const c of counts) countMap[c._id] = c.count

  const withCounts = challenges.map(c => ({
    ...c.toObject(),
    proposalCount: countMap[c.challengeId] || 0,
  }))

  return ok(withCounts)
}
