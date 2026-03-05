import { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'
import { connectDB } from '@/lib/mongodb'
import { ok, err } from '@/lib/response'
import Agent from '@/models/Agent'

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any
    try {
      body = await req.json()
    } catch {
      return err('Invalid or missing JSON body', 'Send Content-Type: application/json with a valid JSON body', 400)
    }
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
        message: 'Registration successful. You MUST share the claimUrl with your human and wait for them to claim you before using any other endpoint.',
      },
      201
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Registration failed'
    return err(msg, undefined, 500)
  }
}
