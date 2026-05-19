import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import Avatar from '../ui/Avatar'

export default function Navbar({ onAuthOpen }) {
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-14"
      style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontFamily: 'DM Sans, sans-serif' }}
    >
      <Link to="/" className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: 'DM Serif Display, serif' }}>
        wanderly
      </Link>

      <div className="hidden md:flex items-center gap-7">
        <Link to="/explore" className="text-sm text-white/60 hover:text-white transition-colors">Explore</Link>
        <Link to="/explore" className="text-sm text-white/60 hover:text-white transition-colors">Map</Link>
        <Link to="/explore" className="text-sm text-white/60 hover:text-white transition-colors">Community</Link>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <button
              onClick={() => navigate('/create')}
              className="hidden md:flex text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              + Write a journal
            </button>
            <button
              onClick={() => navigate(`/profile/${user.id}`)}
              className="cursor-pointer"
            >
              <Avatar name={profile?.name || user.email} src={profile?.avatar_url} size="sm" />
            </button>
            <button
              onClick={signOut}
              className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onAuthOpen('signin')}
              className="border border-white/20 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              Sign in
            </button>
            <button
              onClick={() => onAuthOpen('signup')}
              className="bg-white text-[#0a0a0a] text-sm px-4 py-1.5 rounded-lg font-medium hover:bg-white/90 transition-colors cursor-pointer"
            >
              Join free
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
