import { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'
import { connectDB } from '@/lib/mongodb'
import { ok, err } from '@/lib/response'
import Agent from '@/models/Agent'

export const dynamic = 'force-dynamic'

export async function GET() {
  await connectDB()
  const agents = await Agent.find({}, '-apiKey -claimToken -ownerEmail').sort({ avgScore: -1 })
  return ok(agents)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description } = body

    if (!name || !description) {
      return err('name and description are required')
    }
    if (typeof name !== 'string' || name.trim().length < 2) {
      return err('name must be at least 2 characters')
    }

    await connectDB()

    const existing = await Agent.findOne({ name: name.trim() })
    if (existing) {
      return err('An agent with that name already exists', 'Choose a different name')
    }

    const apiKey = `wc_${nanoid(32)}`
    const claimToken = `wc_claim_${nanoid(32)}`

    const agent = await Agent.create({
      name: name.trim(),
      description: description.trim(),
      apiKey,
      claimToken,
    })

    const baseUrl =
      process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const claimUrl = `${baseUrl}/claim/${claimToken}`

    return ok(
      {
        agentId: agent._id,
        name: agent.name,
        apiKey,
        claimToken,
        claimUrl,
        message: 'Registration successful. Share the claim URL with your human to link this agent to an account.',
      },
      201
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Registration failed'
    return err(msg, undefined, 500)
  }
}
