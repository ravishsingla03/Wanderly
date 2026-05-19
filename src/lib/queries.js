import { supabase } from './supabase'

export async function fetchTrips({ filter = 'all', search = '', limit = 6 } = {}) {
  let query = supabase
    .from('trips')
    .select(`*, profiles(name, avatar_url)`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (filter && filter !== 'all') {
    if (filter === 'budget') {
      query = query.lte('total_budget', 20000)
    } else {
      query = query.eq('trip_type', filter)
    }
  }

  if (search) {
    query = query.ilike('destination', `%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchTripById(id) {
  const { data, error } = await supabase
    .from('trips')
    .select(`*, profiles(id, name, avatar_url, bio, trips_count)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function fetchUserTrips(userId) {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchSavedTrips(userId) {
  const { data, error } = await supabase
    .from('saved_trips')
    .select(`trip_id, trips(*, profiles(name, avatar_url))`)
    .eq('user_id', userId)
  if (error) throw error
  return data?.map((row) => row.trips) ?? []
}

export async function saveTrip(userId, tripId) {
  const { error } = await supabase
    .from('saved_trips')
    .insert({ user_id: userId, trip_id: tripId })
  if (error) throw error
}

export async function unsaveTrip(userId, tripId) {
  const { error } = await supabase
    .from('saved_trips')
    .delete()
    .eq('user_id', userId)
    .eq('trip_id', tripId)
  if (error) throw error
}

export async function isTripSaved(userId, tripId) {
  const { data, error } = await supabase
    .from('saved_trips')
    .select('trip_id')
    .eq('user_id', userId)
    .eq('trip_id', tripId)
    .maybeSingle()
  if (error) throw error
  return !!data
}

export async function createTrip(tripData) {
  const { data, error } = await supabase
    .from('trips')
    .insert(tripData)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}
