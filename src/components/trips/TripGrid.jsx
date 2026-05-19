import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import TripCard from './TripCard'

function CTACard({ onAuthOpen }) {
  const navigate = useNavigate()

  return (
    <motion.div
      whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}
      onClick={onAuthOpen}
      className="rounded-2xl border border-white/10 bg-[#141414] flex flex-col items-center justify-center p-8 cursor-pointer min-h-64"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-4"
      >
        <svg width="20" height="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      </div>
      <p className="text-white/70 text-sm font-medium mb-0.5" style={{ fontFamily: 'DM Serif Display, serif' }}>
        Share your trip
      </p>
      <p className="text-white/40 text-xs mb-5 text-center">Help others plan smarter</p>
      <button
        onClick={(e) => { e.stopPropagation(); onAuthOpen && onAuthOpen() }}
        className="border border-white/30 text-white/80 text-xs px-4 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        style={{ fontFamily: 'DM Sans, sans-serif' }}
      >
        Write a journal
      </button>
    </motion.div>
  )
}

export default function TripGrid({ trips, isLoading, error, onAuthOpen }) {
  if (error) {
    return (
      <div className="text-center py-12 text-white/40 text-sm">
        Failed to load trips. Please try again.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-[#141414] h-80 animate-pulse" />
        ))}
      </div>
    )
  }

  const showCTA = trips.length < 6

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {trips.map((trip, i) => (
        <TripCard key={trip.id} trip={trip} index={i} />
      ))}
      {showCTA && <CTACard onAuthOpen={onAuthOpen} />}
    </div>
  )
}
