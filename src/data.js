// Synthetic demo data — every school, team, opponent, score, and date is fictional.
// Game dates are generated relative to "today" so the board always looks current.
const DAY = 24 * 60 * 60 * 1000

const at = (dayOffset, hour, minute = 0) => {
  const d = new Date(Date.now() + dayOffset * DAY)
  d.setHours(hour, minute, 0, 0)
  return d
}

export const SCHOOL = {
  name: 'Sampleton High School',
  mascot: 'Sabers',
  tagline: 'This week in Sabers athletics',
}

export const SPORTS = ['Football', 'Volleyball', 'Girls Soccer', 'Cross Country']

// status: 'upcoming' | 'final'
// scored games carry scoreUs/scoreThem; invitationals carry placementUs/fieldSize.
export const GAMES = [
  // ---- Upcoming ----
  { id: 'u1', sport: 'Football', level: 'Varsity', opponent: 'Riverside Raiders',
    date: at(4, 19), venue: 'Sabers Stadium', homeAway: 'Home', status: 'upcoming' },
  { id: 'u2', sport: 'Volleyball', level: 'Varsity', opponent: 'Oakdale Eagles',
    date: at(1, 18), venue: 'Sabers Gymnasium', homeAway: 'Home', status: 'upcoming' },
  { id: 'u3', sport: 'Girls Soccer', level: 'Varsity', opponent: 'Brookfield Bears',
    date: at(3, 17, 30), venue: 'Brookfield Community Park', homeAway: 'Away', status: 'upcoming' },
  { id: 'u4', sport: 'Football', level: 'JV', opponent: 'Riverside Raiders',
    date: at(3, 18), venue: 'Sabers Stadium', homeAway: 'Home', status: 'upcoming' },
  { id: 'u5', sport: 'Cross Country', level: 'Varsity', opponent: 'Maplewood Invitational',
    date: at(5, 9), venue: 'Maplewood Park', homeAway: 'Away', status: 'upcoming' },
  { id: 'u6', sport: 'Volleyball', level: 'JV', opponent: 'Hillcrest Hawks',
    date: at(6, 12), venue: 'Hillcrest High School', homeAway: 'Away', status: 'upcoming' },

  // ---- Final ----
  { id: 'f1', sport: 'Football', level: 'Varsity', opponent: 'Cedar Grove Cardinals',
    date: at(-3, 19), venue: 'Sabers Stadium', homeAway: 'Home',
    status: 'final', scoreUs: 28, scoreThem: 21 },
  { id: 'f2', sport: 'Volleyball', level: 'Varsity', opponent: 'Cedar Grove Cardinals',
    date: at(-2, 18), venue: 'Cedar Grove High School', homeAway: 'Away',
    status: 'final', scoreUs: 2, scoreThem: 3 },
  { id: 'f3', sport: 'Girls Soccer', level: 'Varsity', opponent: 'Hillcrest Hawks',
    date: at(-4, 17, 30), venue: 'Sabers Field', homeAway: 'Home',
    status: 'final', scoreUs: 3, scoreThem: 1 },
  { id: 'f4', sport: 'Cross Country', level: 'Varsity', opponent: 'Sabers Early-Bird Invite',
    date: at(-5, 9), venue: 'Sabers Trail Course', homeAway: 'Home',
    status: 'final', placementUs: 2, fieldSize: 12 },
  { id: 'f5', sport: 'Football', level: 'JV', opponent: 'Cedar Grove Cardinals',
    date: at(-6, 18), venue: 'Cedar Grove High School', homeAway: 'Away',
    status: 'final', scoreUs: 14, scoreThem: 17 },
]
