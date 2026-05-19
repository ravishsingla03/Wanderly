-- ============================================================
-- WANDERLY — Supabase Setup SQL
-- Run this entire file in the Supabase SQL editor
-- ============================================================

-- 1. SCHEMA

create table if not exists profiles (
  id uuid references auth.users primary key,
  name text,
  avatar_url text,
  bio text,
  trips_count integer default 0,
  created_at timestamp default now()
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  destination text not null,
  state_country text,
  duration_days integer,
  trip_type text check (trip_type in ('solo','couple','family','group')),
  month_year text,
  total_budget integer,
  budget_breakdown jsonb,
  stay_type text,
  stay_cost_per_night integer,
  weather_min integer,
  weather_max integer,
  best_months text[],
  itinerary jsonb,
  places_to_visit text[],
  tags text[],
  overall_rating numeric(2,1),
  experience_summary text,
  tips text,
  cover_gradient text,
  created_at timestamp default now()
);

create table if not exists saved_trips (
  user_id uuid references profiles(id),
  trip_id uuid references trips(id),
  primary key (user_id, trip_id)
);

-- 2. ROW LEVEL SECURITY

alter table profiles enable row level security;
alter table trips enable row level security;
alter table saved_trips enable row level security;

-- Drop existing policies first (safe to re-run)
drop policy if exists "Public profiles" on profiles;
drop policy if exists "Own profile" on profiles;
drop policy if exists "Public trips" on trips;
drop policy if exists "Own trips" on trips;
drop policy if exists "Own saved" on saved_trips;

create policy "Public profiles" on profiles for select using (true);
create policy "Own profile" on profiles for all using (auth.uid() = id);
create policy "Public trips" on trips for select using (true);
create policy "Own trips" on trips for all using (auth.uid() = user_id);
create policy "Own saved" on saved_trips for all using (auth.uid() = user_id);

-- 3. HELPER FUNCTION (increments trips_count on CreateTrip submit)

create or replace function increment_trips_count(user_id uuid)
returns void language sql security definer as $$
  update profiles set trips_count = trips_count + 1 where id = user_id;
$$;

-- 4. SEED TRIPS (uses a placeholder user — update user_id after you create an account)
-- These are inserted WITHOUT a user_id so they show publicly without auth.
-- The app falls back to hardcoded seed data if the DB is empty, but you can
-- also run this block after creating your first account to attach them properly.

-- To insert with no user (works because user_id is nullable):
insert into trips (destination, state_country, duration_days, trip_type, month_year, total_budget, budget_breakdown, stay_type, stay_cost_per_night, weather_min, weather_max, best_months, places_to_visit, tags, overall_rating, experience_summary, tips, cover_gradient)
values
(
  'Manali, Himachal Pradesh', 'Himachal Pradesh, India', 7, 'solo', 'June 2024', 12000,
  '{"transport": 4000, "stay": 2800, "food": 3000, "activities": 2200}'::jsonb,
  'Hostel', 400, 12, 18,
  ARRAY['May','June','September'],
  ARRAY['Solang Valley','Old Manali','Hadimba Temple'],
  ARRAY['Mountains','Rohtang Pass','Cafe culture'],
  4.8,
  'An unforgettable solo trip through the mountains of Manali with stunning views and great cafe culture.',
  'Book accommodation in advance during summer. Carry warm clothes even in June.',
  'linear-gradient(160deg, #1D9E75 0%, #085041 100%)'
),
(
  'Rajasthan Circuit', 'Rajasthan, India', 10, 'couple', 'Nov 2024', 45000,
  '{"transport": 8000, "stay": 22000, "food": 8000, "activities": 7000}'::jsonb,
  'Heritage Hotel', 2200, 22, 30,
  ARRAY['October','November','December'],
  ARRAY['Jaipur','Jodhpur','Jaisalmer'],
  ARRAY['Heritage','Deserts','Forts'],
  4.9,
  'A royal journey through the heritage cities of Rajasthan with stunning forts and desert sunsets.',
  'November is peak season. Book heritage hotels well in advance. Negotiate rates for longer stays.',
  'linear-gradient(160deg, #D85A30 0%, #4A1B0C 100%)'
),
(
  'Andaman Islands', 'Andaman & Nicobar, India', 8, 'solo', 'Feb 2025', 28000,
  '{"transport": 10000, "stay": 7200, "food": 6000, "activities": 4800}'::jsonb,
  'Guesthouse', 900, 26, 32,
  ARRAY['November','December','January','February'],
  ARRAY['Radhanagar Beach','Neil Island','Ross Island'],
  ARRAY['Beach','Snorkeling','Islands'],
  4.7,
  'Crystal clear waters and pristine beaches make Andaman a true paradise for solo travelers.',
  'Carry cash as ATMs are limited on remote islands. Book ferries in advance.',
  'linear-gradient(160deg, #378ADD 0%, #042C53 100%)'
),
(
  'Coorg, Karnataka', 'Karnataka, India', 4, 'solo', 'Aug 2024', 8500,
  '{"transport": 2500, "stay": 4400, "food": 1000, "activities": 600}'::jsonb,
  'Homestay', 1100, 18, 24,
  ARRAY['July','August','October'],
  ARRAY['Abbey Falls','Raja''s Seat','Dubare Elephant Camp'],
  ARRAY['Monsoon','Waterfalls','Coffee estates'],
  4.6,
  'Lush green coffee estates and misty waterfalls make Coorg magical in the monsoon season.',
  'Monsoon makes roads slippery. Drive carefully on the ghats. Carry a rain jacket.',
  'linear-gradient(160deg, #D4537E 0%, #4B1528 100%)'
),
(
  'Kerala Backwaters', 'Kerala, India', 6, 'family', 'Dec 2024', 65000,
  '{"transport": 12000, "stay": 36000, "food": 10000, "activities": 7000}'::jsonb,
  'Houseboat', 6000, 24, 30,
  ARRAY['October','November','December','January'],
  ARRAY['Alleppey','Kumarakom','Munnar'],
  ARRAY['Houseboat','Backwaters','Ayurveda'],
  5.0,
  'A serene family retreat on the backwaters of Kerala. The houseboat experience is absolutely magical.',
  'Book premium houseboats early for December. Ideal for families. Try the Kerala cuisine on the houseboat.',
  'linear-gradient(160deg, #7F77DD 0%, #26215C 100%)'
);
