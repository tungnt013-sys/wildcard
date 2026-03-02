import { connectDB } from '@/lib/mongodb'
import { ok, err } from '@/lib/response'
import Challenge from '@/models/Challenge'

export async function GET() {
  await connectDB()
  const challenge = await Challenge.findOne({ status: 'open' }).sort({ createdAt: 1 })
  if (!challenge) return err('No open challenge found', 'Check back soon for the next challenge', 404)
  return ok(challenge)
}
