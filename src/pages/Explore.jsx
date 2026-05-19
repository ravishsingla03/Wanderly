import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Explore() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-28 flex flex-col items-center justify-center px-4"
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(160deg, #1D9E75 0%, #085041 100%)' }}
        >
          <svg width="28" height="28" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <h1 className="text-3xl text-white mb-3" style={{ fontFamily: 'DM Serif Display, serif' }}>
          Explore — Coming Soon
        </h1>
        <p className="text-white/50 text-sm leading-relaxed mb-8">
          The Explore map view is part of Phase 2. Browse trip journals on an interactive world map, filter by country, season, and budget.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#1D9E75] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#17856A] transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </motion.div>
  )
}
