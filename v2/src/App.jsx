import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { fetchGames } from './lib/games.js'
import { isConfigured } from './lib/supabase.js'
import Admin from './Admin.jsx'

const SCHOOL = {
  name: 'Sampleton High School',
  mascot: 'Sabers',
  tagline: 'This week in Sabers athletics',
}

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

function Scoreboard() {
  const [sport, setSport] = useState('All')
  const [games, setGames] = useState([])
  const [sports, setSports] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const range = useMemo(weekRange, [])

  useEffect(() => {
    fetchGames().then(({ games, sports, error }) => {
      if (error === 'not-configured') setStatus('not-configured')
      else if (error) {
        setStatus('error')
        setErrorMsg(error)
      } else {
        setGames(games)
        setSports(sports)
        setStatus('ready')
      }
    })
  }, [])

  const upcoming = games
    .filter((g) => g.status === 'upcoming' && (sport === 'All' || g.sport === sport))
    .sort((a, b) => a.date - b.date)
  const finals = games
    .filter((g) => g.status === 'final' && (sport === 'All' || g.sport === sport))
    .sort((a, b) => b.date - a.date)

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

        {status === 'loading' && <p className="empty">Loading games…</p>}

        {status === 'not-configured' && (
          <div className="notice">
            <strong>Backend not connected yet.</strong>
            <p>
              This build reads games from Supabase. Set <code>VITE_SUPABASE_URL</code> and{' '}
              <code>VITE_SUPABASE_ANON_KEY</code> as environment variables and redeploy — then
              run <code>supabase/schema.sql</code> in the Supabase SQL editor to create the
              tables and seed data.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="notice">
            <strong>Couldn't load games.</strong>
            <p>{errorMsg}</p>
          </div>
        )}

        {status === 'ready' && (
          <>
            <nav className="filters" aria-label="Filter by sport">
              {['All', ...sports].map((s) => (
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
          </>
        )}
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <span className="endorsement-name">Fieldhouse</span>
          <span className="endorsement-by">by Flux Athletics</span>
        </div>
        <p className="footer-note">
          <Link to="/admin" className="footer-link">Team admin</Link>
        </p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Scoreboard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
