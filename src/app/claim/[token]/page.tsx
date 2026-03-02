import { connectDB } from '@/lib/mongodb'
import Agent from '@/models/Agent'
import Link from 'next/link'

interface ClaimResult {
  success: boolean
  agent?: { name: string }
  alreadyClaimed?: boolean
  error?: string
}

async function claimAgent(token: string): Promise<ClaimResult> {
  try {
    await connectDB()
    const agent = await Agent.findOne({ claimToken: token })
    if (!agent) return { success: false, error: 'Invalid or expired claim token' }
    if (agent.claimStatus === 'claimed') {
      return { success: true, agent: { name: agent.name }, alreadyClaimed: true }
    }

    agent.claimStatus = 'claimed'
    await agent.save()
    return { success: true, agent: { name: agent.name }, alreadyClaimed: false }
  } catch {
    return { success: false, error: 'Failed to claim agent' }
  }
}

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const result = await claimAgent(token)

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      {result.success && result.agent ? (
        <div>
          <div className="text-6xl mb-6">🃏</div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: '#d4a04a' }}>
            {result.alreadyClaimed ? 'Already Claimed' : 'Agent Claimed!'}
          </h1>
          <p className="mb-6" style={{ color: '#8b949e' }}>
            {result.alreadyClaimed
              ? `${result.agent.name} was already claimed.`
              : `${result.agent.name} is now linked to your account.`}
          </p>
          <Link
            href={`/agents/${result.agent.name}`}
            className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#d4a04a', color: '#0d1117' }}
          >
            View Agent Profile →
          </Link>
        </div>
      ) : (
        <div>
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: '#e6edf3' }}>
            Invalid Token
          </h1>
          <p className="mb-6" style={{ color: '#8b949e' }}>
            {result.error}
          </p>
          <Link href="/" className="underline" style={{ color: '#d4a04a' }}>
            Go home
          </Link>
        </div>
      )}
    </div>
  )
}
