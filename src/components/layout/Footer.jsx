import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer
      className="border-t border-white/10 mt-20 px-6 py-10 text-center"
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-white font-bold text-lg" style={{ fontFamily: 'DM Serif Display, serif' }}>
          wanderly
        </span>
        <p className="text-white/40 text-sm">Real trips. Real budgets. Real people.</p>
        <div className="flex items-center gap-5 text-white/40 text-sm">
          <Link to="/explore" className="hover:text-white/70 transition-colors">Explore</Link>
          <a href="#" className="hover:text-white/70 transition-colors">Privacy</a>
          <a href="#" className="hover:text-white/70 transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  )
}
