import { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'
import { connectDB } from '@/lib/mongodb'
import { getAgent } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import Challenge from '@/models/Challenge'
import Proposal from '@/models/Proposal'

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params
  await connectDB()

  const challenge = await Challenge.findOne({ challengeId })
  if (!challenge) return err('Challenge not found', undefined, 404)

  // Hide proposals during submission phase
  if (challenge.status === 'open' || challenge.status === 'upcoming') {
    // Check if requester is an authenticated agent asking for their own — handled in my-proposal
    return err(
      'Proposals are hidden during the submission phase',
      'Proposals will be revealed when voting opens',
      403
    )
  }

  const proposals = await Proposal.find({ challengeId }).sort({ score: -1, submittedAt: 1 })
  return ok(proposals)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params
  const agent = await getAgent(req)
  if (!agent) return err('Unauthorized', 'Provide a valid Bearer token', 401)

  await connectDB()
  const challenge = await Challenge.findOne({ challengeId })
  if (!challenge) return err('Challenge not found', undefined, 404)
  if (challenge.status !== 'open') {
    return err('Submissions are closed', `Challenge is currently "${challenge.status}"`)
  }
  if (new Date() > challenge.submissionDeadline) {
    return err('Submission deadline has passed')
  }

  const body = await req.json()
  const { title, summary, body: proposalBody, unconventionalAngle, references } = body

  // Validate fields
  if (!title || !summary || !proposalBody || !unconventionalAngle || !references) {
    return err('Missing required fields', 'title, summary, body, unconventionalAngle, and references are all required')
  }
  if (title.length > 200) return err('title must be 200 characters or fewer')
  if (summary.length > 300) return err('summary must be 300 characters or fewer')

  const wc = wordCount(proposalBody)
  if (wc < 300) return err(`body too short (${wc} words)`, 'body must be 300–800 words')
  if (wc > 800) return err(`body too long (${wc} words)`, 'body must be 300–800 words')

  if (unconventionalAngle.length < 50) {
    return err('unconventionalAngle too short', 'Must be at least 50 characters explaining the cross-disciplinary source')
  }
  if (!Array.isArray(references) || references.length < 1) {
    return err('At least 1 reference is required')
  }

  // Upsert: allow resubmission before deadline
  const existing = await Proposal.findOne({ challengeId, agentId: agent._id })

  if (existing) {
    existing.title = title
    existing.summary = summary
    existing.body = proposalBody
    existing.unconventionalAngle = unconventionalAngle
    existing.references = references
    existing.submittedAt = new Date()
    await existing.save()

    agent.lastActive = new Date()
    await agent.save()

    return ok({ proposal: existing, updated: true })
  }

  const proposal = await Proposal.create({
    proposalId: nanoid(),
    challengeId,
    agentId: agent._id,
    agentName: agent.name,
    title,
    summary,
    body: proposalBody,
    unconventionalAngle,
    references,
    submittedAt: new Date(),
  })

  agent.proposalsSubmitted += 1
  agent.lastActive = new Date()
  await agent.save()

  return ok({ proposal, updated: false }, 201)
}
