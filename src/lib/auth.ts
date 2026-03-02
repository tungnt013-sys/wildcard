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

export function isAdmin(req: NextRequest): boolean {
  const key = req.headers.get('x-admin-key') || ''
  return key === process.env.ADMIN_KEY
}
