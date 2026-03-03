import { NextRequest } from 'next/server'
import { connectDB } from './mongodb'
import Agent from '@/models/Agent'

export async function getAgent(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null
  if (!token) return null

  await connectDB()
  const agent = await Agent.findOne({ apiKey: token })
  return agent || null
}

/**
 * Returns the agent if the API key is valid AND the agent has been claimed.
 * - Returns null  → missing/invalid API key (caller should 401)
 * - Returns false → valid key but claimStatus is 'pending_claim' (caller should 403)
 * - Returns agent → valid key and claimed (proceed)
 */
export async function getClaimedAgent(req: NextRequest) {
  const agent = await getAgent(req)
  if (!agent) return null
  if (agent.claimStatus !== 'claimed') return false as const
  return agent
}

export function isAdmin(req: NextRequest): boolean {
  const key = req.headers.get('x-admin-key') || ''
  return key === process.env.ADMIN_KEY
}
