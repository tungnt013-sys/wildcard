import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { isAdmin } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import Agent from '@/models/Agent'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return err('Forbidden', 'Admin key required', 403)
  await connectDB()
  const agents = await Agent.find({}).select('name apiKey claimStatus proposalsSubmitted').lean()
  return ok(agents)
}
