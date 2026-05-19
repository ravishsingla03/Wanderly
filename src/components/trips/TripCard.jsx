import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Avatar from '../ui/Avatar'
import { PRESET_GRADIENTS } from '../../lib/seedData'

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-1 text-sm text-[#1D9E75] font-semibold">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#1D9E75">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {Number(rating).toFixed(1)}
    </span>
  )
}

export default function TripCard({ trip, index = 0 }) {
  const navigate = useNavigate()

  const gradient = trip.cover_gradient || PRESET_GRADIENTS[index % PRESET_GRADIENTS.length]

  const formatBudget = (budget) => {
    if (!budget) return ''
    if (budget >= 1000) return `₹${(budget / 1000).toFixed(budget % 1000 === 0 ? 0 : 1)}k total`
    return `₹${budget} total`
  }

  const tripTypeLabel = {
    solo: 'Solo',
    couple: 'Couple',
    family: 'Family',
    group: 'Group',
  }

  const places = trip.places_to_visit || []
  const itineraryHighlight = places.join(' → ')

  const authorName = trip.profiles?.name || 'Traveler'

  return (
    <motion.div
      whileHover={{ borderColor: 'rgba(255,255,255,0.25)' }}
      onClick={() => navigate(`/trip/${trip.id}`)}
      className="rounded-2xl overflow-hidden cursor-pointer border border-white/8 bg-[#141414] flex flex-col"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      transition={{ duration: 0.15 }}
    >
      {/* Gradient Header */}
      <div
        className="h-28 relative flex-shrink-0"
        style={{ background: gradient }}
      >
        <div className="absolute inset-0 flex items-end p-3 gap-2">
          {trip.total_budget && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.45)', color: '#eee', backdropFilter: 'blur(4px)' }}
            >
              {formatBudget(trip.total_budget)}
            </span>
          )}
          {trip.trip_type && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.9)', color: '#111' }}
            >
              {tripTypeLabel[trip.trip_type] || trip.trip_type}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col gap-2.5 flex-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        {/* Destination */}
        <div>
          <h3
            className="text-lg leading-tight text-white"
            style={{ fontFamily: 'DM Serif Display, serif' }}
          >
            {trip.destination}
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            {trip.duration_days} days · {trip.month_year}
          </p>
        </div>

        {/* Tags */}
        {trip.tags && trip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {trip.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-md border border-white/10 text-white/60"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stay + Weather row */}
        <div className="grid grid-cols-2 gap-2 mt-0.5">
          <div className="rounded-lg p-2.5" style={{ background: '#1a1a1a' }}>
            <p className="text-[10px] uppercase tracking-wide text-white/40 font-medium mb-0.5">STAY</p>
            <p className="text-xs text-white/80 font-medium">{trip.stay_type}</p>
            {trip.stay_cost_per_night && (
              <p className="text-xs text-white/50">
                ₹{trip.stay_cost_per_night >= 1000
                  ? `${(trip.stay_cost_per_night / 1000).toFixed(trip.stay_cost_per_night % 1000 === 0 ? 0 : 1)}k`
                  : trip.stay_cost_per_night}/n
              </p>
            )}
          </div>
          <div className="rounded-lg p-2.5" style={{ background: '#1a1a1a' }}>
            <p className="text-[10px] uppercase tracking-wide text-white/40 font-medium mb-0.5">WEATHER</p>
            {trip.weather_min != null && trip.weather_max != null ? (
              <p className="text-xs text-white/80 font-medium">{trip.weather_min}–{trip.weather_max}°C</p>
            ) : (
              <p className="text-xs text-white/50">–</p>
            )}
          </div>
        </div>

        {/* Itinerary highlights */}
        {itineraryHighlight && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-white/40 font-medium mb-1">ITINERARY HIGHLIGHTS</p>
            <p className="text-xs text-white/60 leading-snug">{itineraryHighlight}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/8" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2">
            <Avatar name={authorName} src={trip.profiles?.avatar_url} size="sm" />
            <span className="text-xs text-white/60">{authorName}</span>
          </div>
          {trip.overall_rating && <StarRating rating={trip.overall_rating} />}
        </div>
      </div>
    </motion.div>
  )
}
