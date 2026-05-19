import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { supabase } from './lib/supabase'
import useAuthStore from './store/authStore'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AuthModal from './components/auth/AuthModal'
import Landing from './pages/Landing'
import TripDetail from './pages/TripDetail'
import CreateTrip from './pages/CreateTrip'
import Profile from './pages/Profile'
import Explore from './pages/Explore'

export default function App() {
  const location = useLocation()
  const { setUser, setProfile, setLoading } = useAuthStore()
  const [authModal, setAuthModal] = useState({ open: false, tab: 'signin' })

  const openAuth = (tab = 'signin') => setAuthModal({ open: true, tab })
  const closeAuth = () => setAuthModal((s) => ({ ...s, open: false }))

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        setProfile(data)
      }
      setLoading(false)
    }).catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        // Fetch profile; create one if it doesn't exist yet (e.g. after email confirmation)
        let { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (!profile) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .upsert({ id: session.user.id, name: session.user.email?.split('@')[0], trips_count: 0 })
            .select()
            .single()
          profile = newProfile
        }
        setProfile(profile)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setProfile, setLoading])

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Navbar onAuthOpen={openAuth} />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing onAuthOpen={openAuth} />} />
          <Route path="/trip/:id" element={<TripDetail onAuthOpen={openAuth} />} />
          <Route path="/create" element={<CreateTrip onAuthOpen={openAuth} />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/explore" element={<Explore />} />
        </Routes>
      </AnimatePresence>

      <Footer />

      <AuthModal isOpen={authModal.open} onClose={closeAuth} defaultTab={authModal.tab} />
    </div>
  )
}
