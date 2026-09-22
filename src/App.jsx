import { useMemo, useState } from 'react'
import { SCHOOL, SPORTS, GAMES } from './data.js'

const fmtDay = (d) => d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
const fmtDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const fmtTime = (d) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '')

function weekRange() {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const sameMonth = monday.getMonth() === sunday.getMonth()
  return sameMonth
    ? `${monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${sunday.getDate()}`
    : `${fmtDate(monday)} – ${fmtDate(sunday)}`
}

function outcome(game) {
  if (game.scoreUs == null) return null
  if (game.scoreUs > game.scoreThem) return 'W'
  if (game.scoreUs < game.scoreThem) return 'L'
  return 'T'
}

function UpcomingCard({ game }) {
  return (
    <article className="card">
      <div className="card-date">
        <span className="card-dow">{fmtDay(game.date)}</span>
        <span className="card-daynum">{fmtDate(game.date)}</span>
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span className="pill">{game.sport}</span>
          <span className="level">{game.level}</span>
        </div>
        <h3 className="card-title">
          <span className="vs">vs</span> {game.opponent}
        </h3>
      </div>
      <div className="card-right">
        <span className="card-time">{fmtTime(game.date)}</span>
        <span className="card-venue">{game.venue}</span>
        <span className={`ha ha-${game.homeAway.toLowerCase()}`}>{game.homeAway}</span>
      </div>
    </article>
  )
}

function FinalCard({ game }) {
  const result = outcome(game)
  return (
    <article className="card final">
      <div className={`badge ${result ? `badge-${result.toLowerCase()}` : 'badge-place'}`}>
        {result ?? '–'}
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span className="pill">{game.sport}</span>
          <span className="level">{game.level}</span>
        </div>
        <h3 className="card-title">
          <span className="vs">vs</span> {game.opponent}
        </h3>
      </div>
      <div className="card-right">
        {game.scoreUs != null ? (
          <span className="score">
            {game.scoreUs} – {game.scoreThem}
          </span>
        ) : (
          <span className="score">
            {game.placementUs}
            {game.placementUs === 2 ? 'nd' : game.placementUs === 3 ? 'rd' : 'th'} of{' '}
            {game.fieldSize}
          </span>
        )}
        <span className="final-tag">Final</span>
        <span>{fmtDate(game.date)}</span>
      </div>
    </article>
  )
}

export default function App() {
  const [sport, setSport] = useState('All')
  const range = useMemo(weekRange, [])

  const upcoming = GAMES.filter(
    (g) => g.status === 'upcoming' && (sport === 'All' || g.sport === sport),
  ).sort((a, b) => a.date - b.date)
  const finals = GAMES.filter(
    (g) => g.status === 'final' && (sport === 'All' || g.sport === sport),
  ).sort((a, b) => b.date - a.date)

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="mark" aria-hidden="true">S</div>
          <div>
            <div className="school-name">{SCHOOL.name}</div>
            <div className="school-sub">{SCHOOL.mascot} Athletics</div>
          </div>
        </div>
        <div className="topbar-right">
          <span className="demo-pill">Demo data</span>
          <div className="endorsement">
            <span className="endorsement-name">Fieldhouse</span>
            <span className="endorsement-by">by Flux Athletics</span>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <p className="hero-kicker">Gameday Scoreboard</p>
          <h1>{SCHOOL.tagline}</h1>
          <p className="hero-range">{range}</p>
        </section>

        <nav className="filters" aria-label="Filter by sport">
          {['All', ...SPORTS].map((s) => (
            <button
              key={s}
              className={`chip ${sport === s ? 'chip-active' : ''}`}
              onClick={() => setSport(s)}
            >
              {s}
            </button>
          ))}
        </nav>

        <section>
          <h2 className="section-title">Upcoming</h2>
          {upcoming.length === 0 ? (
            <p className="empty">No upcoming games for this filter.</p>
          ) : (
            <div className="list">
              {upcoming.map((g) => (
                <UpcomingCard key={g.id} game={g} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="section-title">Recent results</h2>
          {finals.length === 0 ? (
            <p className="empty">No results yet for this filter.</p>
          ) : (
            <div className="list">
              {finals.map((g) => (
                <FinalCard key={g.id} game={g} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <span className="endorsement-name">Fieldhouse</span>
          <span className="endorsement-by">by Flux Athletics</span>
        </div>
        <p className="footer-note">
          Concept demo for a side-by-side build comparison. All schools, teams,
          opponents, scores, and dates are fictional.
        </p>
      </footer>
    </div>
  )
}
