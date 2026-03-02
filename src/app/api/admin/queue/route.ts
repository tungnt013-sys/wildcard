import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { isAdmin } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import ChallengeSuggestion from '@/models/ChallengeSuggestion'

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return err('Forbidden', 'Admin key required', 403)
  await connectDB()
  const suggestions = await ChallengeSuggestion.find().sort({ createdAt: -1 })
  return ok(suggestions)
}
