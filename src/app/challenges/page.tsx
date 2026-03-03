import Link from 'next/link'

interface Challenge {
  challengeId: string
  title: string
  problem: string
  inspirationDomains: string[]
  status: string
  proposalCount: number
}

async function getChallenges(status?: string) {
  const base = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const url = status && status !== 'all' ? `${base}/api/challenges?status=${status}` : `${base}/api/challenges`
  const res = await fetch(url, { cache: 'no-store' })
  const json = await res.json()
  if (!json.success) return []
  const challenges = json.data as Challenge[]
  return [...challenges].sort((a, b) => b.proposalCount - a.proposalCount)
}

const STATUS_COLORS: Record<string, string> = {
  open: '#22c55e', voting: '#e8c050', completed: '#52525b', upcoming: '#8b5cf6',
}
const STATUS_LABELS: Record<string, string> = {
  open: 'Open', voting: 'Voting', completed: 'Completed', upcoming: 'Upcoming',
}

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '14px',
}

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const challenges = await getChallenges(status)
  const active = status || 'all'

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ marginBottom: '44px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.035em', color: '#f4f4f5', marginBottom: '8px' }}>
          Challenges
        </h1>
        <p style={{ fontSize: '15px', color: '#52525b' }}>
          Real environmental problems. Unconventional solutions required.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {['all', 'open', 'completed'].map(s => (
          <Link key={s} href={s === 'all' ? '/challenges' : `/challenges?status=${s}`}
            style={{ padding: '6px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.02em', border: '1px solid', transition: 'all 0.15s', backgroundColor: active === s ? 'rgba(232,192,80,0.12)' : 'rgba(255,255,255,0.03)', borderColor: active === s ? 'rgba(232,192,80,0.38)' : 'rgba(255,255,255,0.08)', color: active === s ? '#e8c050' : '#52525b' }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      {challenges.length === 0 ? (
        <p style={{ color: '#52525b', fontSize: '14px' }}>No challenges found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {challenges.map(challenge => (
            <Link key={challenge.challengeId} href={`/challenges/${challenge.challengeId}`}
              className="hover-border"
              style={{ ...glass, display: 'block', padding: '22px 26px', textDecoration: 'none', transition: 'border-color 0.2s' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 9px', borderRadius: '20px', border: `1px solid ${STATUS_COLORS[challenge.status]}44`, backgroundColor: `${STATUS_COLORS[challenge.status]}10`, color: STATUS_COLORS[challenge.status], letterSpacing: '0.03em' }}>
                      {STATUS_LABELS[challenge.status] || challenge.status}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', color: challenge.proposalCount > 0 ? '#a1a1aa' : '#3f3f46', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span>💬</span>
                      {challenge.proposalCount}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.02em', color: '#f4f4f5', marginBottom: '6px', lineHeight: 1.3 }}>
                    {challenge.title}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#71717a', lineHeight: 1.6, marginBottom: '12px' }}>
                    {challenge.problem.slice(0, 180)}…
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {challenge.inspirationDomains.slice(0, 4).map(d => (
                      <span key={d} style={{ fontSize: '11px', padding: '2px 9px', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.22)', backgroundColor: 'rgba(139,92,246,0.07)', color: '#a78bfa', fontWeight: 500 }}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <span style={{ color: '#3f3f46', fontSize: '16px', flexShrink: 0, marginTop: '4px' }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
