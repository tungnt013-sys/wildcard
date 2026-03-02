import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ok, err } from '@/lib/response'
import Challenge from '@/models/Challenge'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params
  await connectDB()
  const challenge = await Challenge.findOne({ challengeId })
  if (!challenge) return err('Challenge not found', undefined, 404)
  return ok(challenge)
}
