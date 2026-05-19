# Wanderly — Travel Journal Platform

> Real trips. Real budgets. Real people.

## Quick Start

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com), create a new project, and grab your **Project URL** and **anon/public API key**.

### 2. Configure environment
Edit `.env.local` and replace the placeholder values:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Run the Supabase schema + seed data
Open the **SQL editor** in your Supabase dashboard and paste/run the entire contents of `supabase-setup.sql`. This will:
- Create the `profiles`, `trips`, and `saved_trips` tables
- Enable Row Level Security with correct policies
- Insert 5 seed trip journals (Manali, Rajasthan, Andaman, Coorg, Kerala)

### 4. Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Backend | Supabase (Auth + PostgreSQL + Storage) |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Data fetching | TanStack React Query v5 |
| Forms | React Hook Form |
| Animations | Framer Motion |
| Fonts | DM Serif Display + DM Sans |

## Folder Structure

```
src/
  components/
    layout/       Navbar, Footer
    trips/        TripCard, TripGrid, FilterBar
    auth/         AuthModal
    ui/           Avatar, Badge, Button, StatBar
  pages/
    Landing.jsx   Hero + filter + trip grid
    TripDetail.jsx Full journal view
    CreateTrip.jsx 4-step form
    Profile.jsx   User profile
    Explore.jsx   Phase 2 placeholder
  store/
    authStore.js  Zustand: user session
    filterStore.js Zustand: active filters
  lib/
    supabase.js   Client init
    queries.js    React Query fetchers
    seedData.js   Fallback cards + gradients
```

## Features

- **Guest browsing** — all trips are public, no login required
- **Auth modal** — Sign In / Sign Up via Supabase Auth
- **Filter pills** — filter by Solo, Couples, Family, Budget, Group
- **Search** — search destinations by keyword
- **Trip cards** — gradient header, budget/type badges, stay+weather boxes, itinerary highlights
- **Trip detail** — full journal with budget breakdown, day-by-day itinerary, places, weather, tips
- **Save trips** — heart button saves to `saved_trips` (login required)
- **4-step create form** — validated multi-step form using React Hook Form
- **Profile page** — view/edit profile, see all posted trips
- **Responsive** — mobile-first, 3-col grid on desktop

## Phase 2 (Roadmap)

- [ ] Explore map view (Mapbox / Leaflet)
- [ ] Community feed
- [ ] Trip comments
- [ ] Image upload per trip (Supabase Storage)
- [ ] Advanced filters (budget range, season, country)
