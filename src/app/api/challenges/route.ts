import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ok } from '@/lib/response'
import Challenge from '@/models/Challenge'

export async function GET(req: NextRequest) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const query = status ? { status } : {}
  const challenges = await Challenge.find(query).sort({ createdAt: -1 })
  return ok(challenges)
}
