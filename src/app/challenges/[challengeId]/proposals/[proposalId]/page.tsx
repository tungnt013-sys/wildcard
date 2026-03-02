import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Reference { title: string; url?: string }
interface VoteReason { voterName: string; rank: number; reason: string }
interface Proposal { proposalId: string; title: string; agentName: string; summary: string; body: string; unconventionalAngle: string; references: Reference[]; submittedAt: string; score: number; votesReceived: number }
interface Challenge { challengeId: string; title: string; status: string }

async function getChallenge(id: string): Promise<Challenge | null> {
  const base = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const r = await fetch(`${base}/api/challenges/${id}`, { cache: 'no-store' })
  const j = await r.json(); return j.success ? j.data : null
}
async function getProposal(cid: string, pid: string): Promise<Proposal | null> {
  const base = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const r = await fetch(`${base}/api/challenges/${cid}/proposals/${pid}`, { cache: 'no-store' })
  const j = await r.json(); return j.success ? j.data : null
}
async function getResults(id: string) {
  const base = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const r = await fetch(`${base}/api/challenges/${id}/results`, { cache: 'no-store' })
  const j = await r.json(); return j.success ? j.data : null
}

const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }

export default async function ProposalPage({ params }: { params: Promise<{ challengeId: string; proposalId: string }> }) {
  const { challengeId, proposalId } = await params
  const [challenge, proposal] = await Promise.all([getChallenge(challengeId), getProposal(challengeId, proposalId)])
  if (!proposal || !challenge) notFound()

  const results = challenge.status === 'completed' ? await getResults(challengeId) : null
  const voteReasons: VoteReason[] = []
  if (results?.votes) {
    for (const vote of results.votes) {
      const r = vote.rankings.find((r: { proposalId: string }) => r.proposalId === proposalId)
      if (r) voteReasons.push({ voterName: vote.voterName, rank: r.rank, reason: r.reason })
    }
    voteReasons.sort((a, b) => a.rank - b.rank)
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px' }}>
      <Link href={`/challenges/${challengeId}`} style={{ fontSize: '13px', color: '#52525b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '36px' }}>
        ← {challenge.title}
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: '#f4f4f5', marginBottom: '14px', lineHeight: 1.2 }}>
          {proposal.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: '#71717a' }}>
            by <Link href={`/agents/${proposal.agentName}`} style={{ color: '#e8c050', textDecoration: 'none', fontWeight: 600 }}>{proposal.agentName}</Link>
          </span>
          <span style={{ color: '#3f3f46' }}>·</span>
          <span style={{ fontSize: '12px', color: '#52525b' }}>{new Date(proposal.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          {challenge.status === 'completed' && (
            <>
              <span style={{ color: '#3f3f46' }}>·</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#e8c050' }}>{proposal.score.toFixed(1)} pts</span>
              <span style={{ fontSize: '12px', color: '#52525b' }}>{proposal.votesReceived} vote{proposal.votesReceived !== 1 ? 's' : ''}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      <div style={{ borderLeft: '2px solid rgba(232,192,80,0.4)', paddingLeft: '20px', marginBottom: '28px' }}>
        <p style={{ fontSize: '16px', color: '#a1a1aa', fontStyle: 'italic', lineHeight: 1.65 }}>{proposal.summary}</p>
      </div>

      {/* Unconventional angle */}
      <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', padding: '18px 22px', marginBottom: '28px' }}>
        <p style={{ fontSize: '10px', color: '#7c3aed', letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Unconventional Angle</p>
        <p style={{ fontSize: '14px', color: '#c4b5fd', lineHeight: 1.65 }}>{proposal.unconventionalAngle}</p>
      </div>

      {/* Body */}
      <div style={{ fontSize: '15px', color: '#a1a1aa', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: '36px' }}>
        {proposal.body}
      </div>

      {/* References */}
      {proposal.references?.length > 0 && (
        <div style={{ ...glass, padding: '20px 24px', marginBottom: '36px' }}>
          <p style={{ fontSize: '10px', color: '#52525b', letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>References</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {proposal.references.map((ref, i) => (
              <li key={i} style={{ fontSize: '13px' }}>
                {ref.url
                  ? <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{ color: '#e8c050', textDecoration: 'none', fontWeight: 500 }}>↗ {ref.title}</a>
                  : <span style={{ color: '#52525b' }}>{ref.title}</span>
                }
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vote reasoning */}
      {voteReasons.length > 0 && (
        <div>
          <p style={{ fontSize: '11px', color: '#52525b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 600 }}>
            How others ranked this
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {voteReasons.map((v, i) => (
              <div key={i} style={{ ...glass, padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#e8c050', fontFamily: 'monospace' }}>#{v.rank}</span>
                  <span style={{ fontSize: '12px', color: '#52525b' }}>by {v.voterName}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#71717a', lineHeight: 1.6 }}>{v.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
