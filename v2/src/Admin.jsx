import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isConfigured } from './lib/supabase.js'
import { fetchTeams } from './lib/games.js'

const emptyForm = {
  team_id: '',
  opponent: '',
  date: '',
  time: '',
  venue: '',
  home_away: 'Home',
  status: 'upcoming',
  score_us: '',
  score_them: '',
  placement_us: '',
  field_size: '',
}

const fmtDT = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Admin() {
  const [session, setSession] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [teams, setTeams] = useState([])
  const [games, setGames] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!isConfigured) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthChecked(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) load()
  }, [session])

  async function load() {
    const t = await fetchTeams()
    setTeams(t.teams)
    const { data } = await supabase
      .from('games')
      .select(
        'id, team_id, opponent, starts_at, venue, home_away, status, score_us, score_them, placement_us, field_size, teams(sport, level)',
      )
      .order('starts_at', { ascending: false })
    setGames(data || [])
  }

  async function login(e) {
    e.preventDefault()
    setLoginError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setLoginError(error.message)
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  function editGame(g) {
    const d = new Date(g.starts_at)
    setEditingId(g.id)
    setForm({
      team_id: g.team_id,
      opponent: g.opponent,
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
      venue: g.venue || '',
      home_away: g.home_away,
      status: g.status,
      score_us: g.score_us ?? '',
      score_them: g.score_them ?? '',
      placement_us: g.placement_us ?? '',
      field_size: g.field_size ?? '',
    })
    window.scrollTo(0, 0)
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function submit(e) {
    e.preventDefault()
    setNotice('')
    if (!form.team_id || !form.opponent.trim() || !form.date) {
      setNotice('Team, opponent, and date are required.')
      return
    }
    const starts_at = new Date(`${form.date}T${form.time || '00:00'}`).toISOString()
    const num = (v) => (v === '' ? null : Number(v))
    const row = {
      team_id: form.team_id,
      opponent: form.opponent.trim(),
      starts_at,
      venue: form.venue.trim() || null,
      home_away: form.home_away,
      status: form.status,
      score_us: form.status === 'final' ? num(form.score_us) : null,
      score_them: form.status === 'final' ? num(form.score_them) : null,
      placement_us: num(form.placement_us),
      field_size: num(form.field_size),
    }
    const { error } = editingId
      ? await supabase.from('games').update(row).eq('id', editingId)
      : await supabase.from('games').insert(row)
    if (error) setNotice('Error: ' + error.message)
    else {
      setNotice(editingId ? 'Game updated.' : 'Game added.')
      cancelEdit()
      load()
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this game?')) return
    const { error } = await supabase.from('games').delete().eq('id', id)
    if (error) setNotice('Error: ' + error.message)
    else {
      setNotice('Game deleted.')
      load()
    }
  }

  if (!isConfigured) {
    return (
      <div className="page">
        <main className="main">
          <div className="notice">
            <strong>Backend not connected yet.</strong>
            <p>Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> and redeploy.</p>
            <p><Link to="/">Back to scoreboard</Link></p>
          </div>
        </main>
      </div>
    )
  }

  if (!authChecked) {
    return (
      <div className="page">
        <main className="main"><p className="empty">Loading…</p></main>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="page">
        <main className="main admin-narrow">
          <h1 className="admin-title">Team admin</h1>
          <form className="admin-form" onSubmit={login}>
            <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
            {loginError && <p className="admin-error">{loginError}</p>}
            <button type="submit" className="btn">Sign in</button>
          </form>
          <p><Link to="/">Back to scoreboard</Link></p>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <main className="main">
        <div className="admin-head">
          <h1 className="admin-title">{editingId ? 'Edit game' : 'Add a game'}</h1>
          <div className="admin-head-right">
            <span className="admin-user">{session.user.email}</span>
            <button className="btn btn-ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>
          </div>
        </div>

        {notice && <p className="admin-notice">{notice}</p>}

        <form className="admin-form" onSubmit={submit}>
          <div className="form-grid">
            <label>Team
              <select value={form.team_id} onChange={(e) => set('team_id', e.target.value)} required>
                <option value="">Select…</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.sport} — {t.level}</option>
                ))}
              </select>
            </label>
            <label>Opponent<input value={form.opponent} onChange={(e) => set('opponent', e.target.value)} required /></label>
            <label>Date<input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required /></label>
            <label>Time<input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} /></label>
            <label>Venue<input value={form.venue} onChange={(e) => set('venue', e.target.value)} /></label>
            <label>Home / Away
              <select value={form.home_away} onChange={(e) => set('home_away', e.target.value)}>
                <option>Home</option><option>Away</option><option>Neutral</option>
              </select>
            </label>
            <label>Status
              <select value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="upcoming">Upcoming</option><option value="final">Final</option>
              </select>
            </label>
            {form.status === 'final' && (
              <>
                <label>Our score<input type="number" min="0" value={form.score_us} onChange={(e) => set('score_us', e.target.value)} /></label>
                <label>Their score<input type="number" min="0" value={form.score_them} onChange={(e) => set('score_them', e.target.value)} /></label>
              </>
            )}
            <label>Placement (invite)<input type="number" min="1" value={form.placement_us} onChange={(e) => set('placement_us', e.target.value)} /></label>
            <label>Field size<input type="number" min="1" value={form.field_size} onChange={(e) => set('field_size', e.target.value)} /></label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn">{editingId ? 'Save changes' : 'Add game'}</button>
            {editingId && <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>

        <h2 className="section-title">All games</h2>
        <div className="admin-list">
          {games.map((g) => (
            <div key={g.id} className="admin-row">
              <div className="admin-row-main">
                <span className={`status-dot status-${g.status}`} />
                <strong>{fmtDT(g.starts_at)}</strong>
                <span className="pill">{g.teams.sport}</span>
                <span>vs {g.opponent}</span>
                {g.status === 'final' && g.score_us != null && (
                  <span className="score">{g.score_us} – {g.score_them}</span>
                )}
              </div>
              <div className="admin-row-actions">
                <button className="btn btn-small" onClick={() => editGame(g)}>Edit</button>
                <button className="btn btn-small btn-danger" onClick={() => remove(g.id)}>Delete</button>
              </div>
            </div>
          ))}
          {games.length === 0 && <p className="empty">No games yet.</p>}
        </div>

        <p><Link to="/">Back to scoreboard</Link></p>
      </main>
    </div>
  )
}
