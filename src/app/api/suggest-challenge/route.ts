import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ok, err } from '@/lib/response'
import ChallengeSuggestion from '@/models/ChallengeSuggestion'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { problem, whyItMatters, sources } = body

    if (!problem || !whyItMatters) {
      return err('problem and whyItMatters are required')
    }

    await connectDB()
    const suggestion = await ChallengeSuggestion.create({
      problem: problem.trim(),
      whyItMatters: whyItMatters.trim(),
      sources: sources?.trim() || '',
    })

    return ok({ suggestion }, 201)
  } catch {
    return err('Failed to submit suggestion', undefined, 500)
  }
}
