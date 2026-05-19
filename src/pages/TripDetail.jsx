import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { fetchTripById, saveTrip, unsaveTrip, isTripSaved } from '../lib/queries'
import { PRESET_GRADIENTS } from '../lib/seedData'
import { SEED_TRIPS } from '../lib/seedData'
import Avatar from '../components/ui/Avatar'
import useAuthStore from '../store/authStore'

function StarRating({ rating, size = 'md' }) {
  const stars = Math.round(rating)
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size === 'lg' ? 18 : 14} height={size === 'lg' ? 18 : 14} viewBox="0 0 24 24"
          fill={s <= stars ? '#1D9E75' : 'rgba(255,255,255,0.15)'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="text-sm text-white/70 ml-1">{Number(rating).toFixed(1)}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="border-t border-white/10 pt-7 pb-3">
      <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function TripDetail({ onAuthOpen }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [saved, setSaved] = useState(false)
  const queryClient = useQueryClient()

  const isSeedId = id?.startsWith('seed-')

  const seedTrip = isSeedId ? SEED_TRIPS.find((t) => t.id === id) : null

  const { data: dbTrip, isLoading, error } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => fetchTripById(id),
    enabled: !isSeedId,
    retry: 1,
  })

  const trip = isSeedId ? seedTrip : dbTrip

  useEffect(() => {
    if (user && trip && !isSeedId) {
      isTripSaved(user.id, id).then(setSaved).catch(() => {})
    }
  }, [user, id, trip, isSeedId])

  const { mutate: toggleSave } = useMutation({
    mutationFn: () => saved ? unsaveTrip(user.id, id) : saveTrip(user.id, id),
    onSuccess: () => setSaved((s) => !s),
  })

  const handleSave = () => {
    if (!user) { onAuthOpen?.('signin'); return }
    if (isSeedId) return
    toggleSave()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-white/40 animate-pulse">Loading trip…</div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4">
        <p className="text-white/50">Trip not found.</p>
        <button onClick={() => navigate('/')} className="text-[#1D9E75] text-sm underline cursor-pointer">
          Back to home
        </button>
      </div>
    )
  }

  const gradient = trip.cover_gradient || PRESET_GRADIENTS[0]
  const authorName = trip.profiles?.name || 'Traveler'

  const tripTypeLabel = { solo: 'Solo', couple: 'Couple', family: 'Family', group: 'Group' }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      {/* Hero gradient banner */}
      <div className="h-64 md:h-80 relative flex items-end" style={{ background: gradient }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 60%)' }} />
        <div className="relative max-w-3xl mx-auto px-6 pb-8 w-full">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                {trip.total_budget && (
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', color: '#ddd' }}>
                    ₹{trip.total_budget.toLocaleString('en-IN')} total
                  </span>
                )}
                {trip.trip_type && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.9)', color: '#111' }}>
                    {tripTypeLabel[trip.trip_type] || trip.trip_type}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl text-white" style={{ fontFamily: 'DM Serif Display, serif' }}>
                {trip.destination}
              </h1>
              {trip.state_country && (
                <p className="text-white/60 text-sm mt-1">{trip.state_country}</p>
              )}
            </div>
            <button
              onClick={handleSave}
              className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                saved ? 'bg-red-500 border-red-500' : 'border-white/30 hover:border-white/60'
              }`}
              style={{ background: saved ? '#ef4444' : 'rgba(0,0,0,0.4)' }}
              title={saved ? 'Unsave' : 'Save trip'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'white' : 'none'} stroke="white" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-0">
        {/* Overview */}
        <Section title="Overview">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Trip Type', value: tripTypeLabel[trip.trip_type] || trip.trip_type },
              { label: 'Duration', value: `${trip.duration_days} days` },
              { label: 'When', value: trip.month_year },
              { label: 'Rating', value: <StarRating rating={trip.overall_rating} /> },
            ].filter(i => i.value).map((item) => (
              <div key={item.label} className="rounded-xl p-3.5" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1.5">{item.label}</p>
                {typeof item.value === 'string'
                  ? <p className="text-white text-sm font-medium">{item.value}</p>
                  : item.value}
              </div>
            ))}
          </div>
        </Section>

        {/* Budget */}
        {trip.total_budget && (
          <Section title="Budget Breakdown">
            <div className="rounded-xl p-5 space-y-3" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-white/60 text-sm">Total Budget</span>
                <span className="text-white font-semibold">₹{trip.total_budget.toLocaleString('en-IN')}</span>
              </div>
              {trip.budget_breakdown && Object.entries(trip.budget_breakdown).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-white/50 text-sm capitalize">{key}</span>
                  <span className="text-white/80 text-sm">₹{Number(val).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Itinerary */}
        {trip.itinerary && Array.isArray(trip.itinerary) && trip.itinerary.length > 0 && (
          <Section title="Day-by-Day Itinerary">
            <div className="space-y-3">
              {trip.itinerary.map((day, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1D9E75]/15 border border-[#1D9E75]/30 flex items-center justify-center">
                    <span className="text-xs font-semibold text-[#1D9E75]">{i + 1}</span>
                  </div>
                  <div className="flex-1 pb-3 border-b border-white/6">
                    <p className="text-white/80 text-sm font-medium">{day.title || `Day ${i + 1}`}</p>
                    {day.description && <p className="text-white/50 text-sm mt-0.5">{day.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Places to visit */}
        {trip.places_to_visit && trip.places_to_visit.length > 0 && (
          <Section title="Places to Visit">
            <div className="flex flex-wrap gap-2">
              {trip.places_to_visit.map((place) => (
                <span
                  key={place}
                  className="px-3 py-1.5 rounded-full text-sm border text-white/70"
                  style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  📍 {place}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Stay */}
        {trip.stay_type && (
          <Section title="Stay Details">
            <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <p className="text-white font-medium">{trip.stay_type}</p>
                {trip.stay_cost_per_night && (
                  <p className="text-white/50 text-sm mt-0.5">₹{trip.stay_cost_per_night.toLocaleString('en-IN')} per night</p>
                )}
              </div>
              <svg width="24" height="24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          </Section>
        )}

        {/* Weather */}
        {(trip.weather_min != null || trip.best_months) && (
          <Section title="Weather & Best Time to Visit">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trip.weather_min != null && (
                <div className="rounded-xl p-4" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[10px] uppercase tracking-wide text-white/40 mb-2">Temperature</p>
                  <p className="text-white text-lg font-medium">{trip.weather_min}–{trip.weather_max}°C</p>
                </div>
              )}
              {trip.best_months && trip.best_months.length > 0 && (
                <div className="rounded-xl p-4" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[10px] uppercase tracking-wide text-white/40 mb-2">Best Months</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {trip.best_months.map((m) => (
                      <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-[#1D9E75]/15 text-[#1D9E75] border border-[#1D9E75]/25">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Experience & Tips */}
        {(trip.experience_summary || trip.tips) && (
          <Section title="Tips & Experience">
            {trip.experience_summary && (
              <p className="text-white/70 text-sm leading-relaxed mb-4">{trip.experience_summary}</p>
            )}
            {trip.tips && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)' }}>
                <p className="text-[10px] uppercase tracking-wide text-[#1D9E75] mb-2 font-semibold">Pro Tips</p>
                <p className="text-white/70 text-sm leading-relaxed">{trip.tips}</p>
              </div>
            )}
          </Section>
        )}

        {/* Author */}
        <section className="border-t border-white/10 pt-7">
          <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-4">
              <Avatar name={authorName} src={trip.profiles?.avatar_url} size="lg" />
              <div>
                <p className="text-white font-medium">{authorName}</p>
                <p className="text-white/40 text-xs mt-0.5">Trip author</p>
              </div>
            </div>
            {trip.user_id && (
              <Link
                to={`/profile/${trip.user_id}`}
                className="text-xs text-[#1D9E75] border border-[#1D9E75]/40 px-3 py-1.5 rounded-lg hover:bg-[#1D9E75]/10 transition-colors"
              >
                View profile
              </Link>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  )
}
