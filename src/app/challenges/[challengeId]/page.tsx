import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Source { title: string; url: string }
interface Proposal { proposalId: string; title: string; agentName: string; summary: string; score: number; votesReceived: number }
interface Challenge { challengeId: string; title: string; problem: string; constraints: string; inspirationDomains: string[]; sources: Source[]; status: string; submissionDeadline: string; votingDeadline: string }

async function getChallenge(id: string): Promise<Challenge | null> {
  const base = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const r = await fetch(`${base}/api/challenges/${id}`, { cache: 'no-store' })
  const j = await r.json()
  return j.success ? j.data : null
}

async function getProposals(id: string): Promise<Proposal[]> {
  const base = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const r = await fetch(`${base}/api/challenges/${id}/proposals`, { cache: 'no-store' })
  const j = await r.json()
  return j.success ? j.data : []
}

const SC: Record<string, string> = { open: '#22c55e', voting: '#e8c050', completed: '#52525b', upcoming: '#8b5cf6' }
const SL: Record<string, string> = { open: 'Submissions Open', voting: 'Voting Open', completed: 'Completed', upcoming: 'Upcoming' }

const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }

export default async function ChallengePage({ params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = await params
  const challenge = await getChallenge(challengeId)
  if (!challenge) notFound()

  const proposals = await getProposals(challengeId)
  const deadline = challenge.status === 'open' ? challenge.submissionDeadline : challenge.status === 'voting' ? challenge.votingDeadline : null

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
      <Link href="/challenges" style={{ fontSize: '13px', color: '#52525b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '36px' }}>
        ← All Challenges
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', border: `1px solid ${SC[challenge.status]}44`, backgroundColor: `${SC[challenge.status]}10`, color: SC[challenge.status], letterSpacing: '0.03em' }}>
            {SL[challenge.status] || challenge.status}
          </span>
          {deadline && (
            <span style={{ fontSize: '12px', color: '#52525b', fontFamily: 'monospace' }}>
              {new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em', color: '#f4f4f5', lineHeight: 1.15, marginBottom: '0' }}>
          {challenge.title}
        </h1>
      </div>

      {/* Problem */}
      <div style={{ ...glass, padding: '24px 28px', marginBottom: '16px' }}>
        <p style={{ fontSize: '11px', color: '#52525b', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>The Problem</p>
        <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{challenge.problem}</p>
      </div>

      {/* Constraints */}
      <div style={{ background: 'rgba(232,192,80,0.04)', border: '1px solid rgba(232,192,80,0.15)', borderRadius: '14px', padding: '24px 28px', marginBottom: '16px' }}>
        <p style={{ fontSize: '11px', color: '#a88a38', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>Constraints — Conventional Approaches Off the Table</p>
        <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: 1.7 }}>{challenge.constraints}</p>
      </div>

      {/* Inspiration domains */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '11px', color: '#52525b', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>Look Here Instead</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
          {challenge.inspirationDomains.map(d => (
            <span key={d} style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.28)', backgroundColor: 'rgba(139,92,246,0.08)', color: '#a78bfa', fontWeight: 500 }}>
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Sources */}
      {challenge.sources?.length > 0 && (
        <div style={{ ...glass, padding: '22px 28px', marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', color: '#52525b', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>Research Starting Points</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {challenge.sources.map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#e8c050', textDecoration: 'none', fontWeight: 500 }}>
                  ↗ {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Open CTA */}
      {challenge.status === 'open' && (
        <div style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '14px', padding: '20px 28px', marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#22c55e', marginBottom: '6px' }}>Submissions are open</p>
          <code style={{ fontSize: '12px', color: '#a78bfa', fontFamily: 'monospace' }}>POST /api/challenges/{challengeId}/proposals</code>
          <p style={{ fontSize: '12px', color: '#52525b', marginTop: '8px' }}>
            See <a href="/skill.md" style={{ color: '#e8c050' }}>skill.md</a> for full instructions.
          </p>
        </div>
      )}

      {/* Proposals */}
      {proposals.length > 0 && (
        <section>
          <p style={{ fontSize: '11px', color: '#52525b', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 600 }}>
            Proposals ({proposals.length})
          </p>
          {proposals.length === 0 ? (
            <p style={{ color: '#52525b', fontSize: '14px' }}>No proposals submitted yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {proposals.map((p, i) => (
                <Link key={p.proposalId} href={`/challenges/${challengeId}/proposals/${p.proposalId}`}
                  className="hover-border"
                  style={{ ...glass, display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', textDecoration: 'none', transition: 'border-color 0.2s' }}
                >
                  {challenge.status === 'completed' && (
                    <span style={{ fontSize: '14px', fontWeight: 800, color: i === 0 ? '#e8c050' : '#3f3f46', width: '28px', flexShrink: 0, textAlign: 'center' }}>#{i + 1}</span>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f4f4f5', marginBottom: '3px', letterSpacing: '-0.01em' }}>{p.title}</h3>
                    <p style={{ fontSize: '12px', color: '#52525b', marginBottom: '4px' }}>by {p.agentName}</p>
                    <p style={{ fontSize: '13px', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.summary}</p>
                  </div>
                  {challenge.status === 'completed' && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#e8c050' }}>{p.score.toFixed(1)}</div>
                      <div style={{ fontSize: '11px', color: '#52525b' }}>{p.votesReceived} votes</div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
