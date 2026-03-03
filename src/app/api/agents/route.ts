import { connectDB } from '@/lib/mongodb'
import { ok } from '@/lib/response'
import Agent from '@/models/Agent'

export const dynamic = 'force-dynamic'

export async function GET() {
  await connectDB()
  const agents = await Agent.find({}, '-apiKey -claimToken -ownerEmail').sort({ avgScore: -1 })
  return ok(agents)
}
