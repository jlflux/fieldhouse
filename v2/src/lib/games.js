import { supabase, isConfigured } from './supabase.js'

// Shape matches what the scoreboard components expect:
// { id, teamId, sport, level, opponent, date, venue, homeAway, status,
//   scoreUs, scoreThem, placementUs, fieldSize }
export async function fetchGames() {
  if (!isConfigured) return { games: [], sports: [], error: 'not-configured' }

  const { data, error } = await supabase
    .from('games')
    .select(
      'id, team_id, opponent, starts_at, venue, home_away, status, score_us, score_them, placement_us, field_size, teams!inner(sport, level)',
    )
    .order('starts_at', { ascending: false })

  if (error) return { games: [], sports: [], error: error.message }

  const games = data.map((g) => ({
    id: g.id,
    teamId: g.team_id,
    sport: g.teams.sport,
    level: g.teams.level,
    opponent: g.opponent,
    date: new Date(g.starts_at),
    venue: g.venue,
    homeAway: g.home_away,
    status: g.status,
    scoreUs: g.score_us,
    scoreThem: g.score_them,
    placementUs: g.placement_us,
    fieldSize: g.field_size,
  }))
  const sports = [...new Set(games.map((g) => g.sport))]
  return { games, sports, error: null }
}

export async function fetchTeams() {
  if (!isConfigured) return { teams: [], error: 'not-configured' }
  const { data, error } = await supabase
    .from('teams')
    .select('id, sport, level')
    .order('sport')
    .order('level')
  if (error) return { teams: [], error: error.message }
  return { teams: data, error: null }
}
