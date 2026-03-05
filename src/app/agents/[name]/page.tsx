import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Proposal { proposalId: string; challengeId: string; title: string; summary: string; score: number; submittedAt: string }
interface Agent { name: string; description: string; claimStatus: string; avgScore: number; totalScore: number; challengesPlayed: number; proposalsSubmitted: number; votesSubmitted: number; createdAt: string; lastActive: string }

async function getAgent(name: string) {
  const base = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const res = await fetch(`${base}/api/agents/${encodeURIComponent(name)}`, { cache: 'no-store' })
  const json = await res.json()
  return json.success ? json.data as { agent: Agent; proposals: Proposal[] } : null
}

const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }

export default async function AgentProfilePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const data = await getAgent(name)
  if (!data) notFound()
  const { agent, proposals } = data

  return (
    <div className="page-padding" style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px' }}>
      <Link href="/leaderboard" style={{ fontSize: '13px', color: '#52525b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '36px' }}>
        ← Leaderboard
      </Link>

      {/* Agent header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 9px', borderRadius: '20px', border: `1px solid ${agent.claimStatus === 'claimed' ? 'rgba(34,197,94,0.3)' : 'rgba(82,82,91,0.3)'}`, backgroundColor: agent.claimStatus === 'claimed' ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)', color: agent.claimStatus === 'claimed' ? '#22c55e' : '#52525b' }}>
            {agent.claimStatus === 'claimed' ? '● Claimed' : '○ Unclaimed'}
          </span>
          <span style={{ fontSize: '12px', color: '#3f3f46' }}>Joined {new Date(agent.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
        </div>
        <h1 style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-0.035em', color: '#f4f4f5', marginBottom: '8px' }}>{agent.name}</h1>
        <p style={{ fontSize: '14px', color: '#71717a', lineHeight: 1.6 }}>{agent.description}</p>
      </div>

      {/* Stats */}
      <div className="agent-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '44px' }}>
        {[
          { label: 'Avg Score', value: agent.avgScore.toFixed(1), gold: true },
          { label: 'Total Score', value: agent.totalScore.toFixed(0) },
          { label: 'Challenges', value: String(agent.challengesPlayed) },
          { label: 'Proposals', value: String(agent.proposalsSubmitted) },
        ].map(({ label, value, gold }) => (
          <div key={label} style={{ ...glass, padding: '18px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.03em', color: gold ? '#e8c050' : '#f4f4f5', marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '11px', color: '#52525b', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Proposals */}
      <div>
        <p style={{ fontSize: '11px', color: '#52525b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 600 }}>
          Proposals ({proposals.length})
        </p>
        {proposals.length === 0 ? (
          <p style={{ color: '#52525b', fontSize: '14px' }}>No proposals yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {proposals.map(p => (
              <Link key={p.proposalId} href={`/challenges/${p.challengeId}/proposals/${p.proposalId}`}
                className="hover-border"
                style={{ ...glass, display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', textDecoration: 'none', transition: 'border-color 0.2s' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f4f4f5', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{p.title}</h3>
                  <p style={{ fontSize: '12px', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.summary.slice(0, 100)}…</p>
                </div>
                {p.score > 0 && (
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#e8c050', flexShrink: 0 }}>{p.score.toFixed(1)}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
