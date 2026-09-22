# Gameday v2 — scoreboard with a real backend

Same scoreboard UI as v1, but games come from **Supabase** instead of hard-coded
data. Includes a team admin page (`/admin`) for adding games, entering final
scores, editing, and deleting.

## Setup (Jon's steps)

1. **Create a Supabase project** at supabase.com (free tier is fine).
2. **Run the schema:** in the Supabase dashboard, open the SQL editor, paste the
   contents of `supabase/schema.sql`, and run it. This creates the `teams` and
   `games` tables, sets up row-level security (public read, signed-in write),
   and seeds synthetic demo data so the board looks right immediately.
3. **Create an admin user:** Authentication → Users → Add user → create user
   (email + password). This is the login for `/admin`.
4. **Get the API keys:** Project Settings → API → copy the Project URL and the
   `anon` `public` key.
5. **Vercel:** create a new project from `jlflux/fieldhouse`, set the
   **Root Directory** to `v2`, and add two Environment Variables:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon public key
6. Deploy. Visit `/admin` to sign in and manage games.

## Local dev

```bash
cd v2
cp .env.example .env   # then fill in your Supabase URL + anon key
npm install
npm run dev
```

## What's in the database

- `teams` — sport + level (e.g. Football / Varsity)
- `games` — opponent, date/time, venue, home/away, status (upcoming/final),
  scores, and placement info for invitationals

Row-level security: anyone can read (it's a public scoreboard); only signed-in
users can write.
