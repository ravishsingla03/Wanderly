import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'

export default function AuthModal({ isOpen, onClose, defaultTab = 'signin' }) {
  const [tab, setTab] = useState(defaultTab)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser, setProfile } = useAuthStore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const switchTab = (t) => {
    setTab(t)
    setError('')
    reset()
  }

  const onSignIn = async ({ email, password }) => {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError(err.message); return }
    setUser(data.user)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
    setProfile(profile)
    onClose()
  }

  const onSignUp = async ({ name, email, password }) => {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (err) { setError(err.message); return }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        trips_count: 0,
      })
      setUser(data.user)
      setProfile({ id: data.user.id, name, trips_count: 0 })
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="relative w-full max-w-sm rounded-2xl p-7 border border-white/10"
              style={{ background: '#141414', pointerEvents: 'auto', fontFamily: 'DM Sans, sans-serif' }}
            >
              {/* Tabs */}
              <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ background: '#1a1a1a' }}>
                {['signin', 'signup'].map((t) => (
                  <button
                    key={t}
                    onClick={() => switchTab(t)}
                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      tab === t ? 'bg-white text-[#0a0a0a]' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {t === 'signin' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {tab === 'signin' ? (
                <form onSubmit={handleSubmit(onSignIn)} className="space-y-4">
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Email</label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/10 focus:border-[#1D9E75] focus:outline-none transition-colors"
                      style={{ background: '#1a1a1a' }}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Password</label>
                    <input
                      type="password"
                      {...register('password', { required: 'Password is required' })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/10 focus:border-[#1D9E75] focus:outline-none transition-colors"
                      style={{ background: '#1a1a1a' }}
                    />
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-[#1D9E75] text-white text-sm font-medium hover:bg-[#17856A] transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit(onSignUp)} className="space-y-4">
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Name</label>
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      placeholder="Your name"
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/10 focus:border-[#1D9E75] focus:outline-none transition-colors"
                      style={{ background: '#1a1a1a' }}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Email</label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/10 focus:border-[#1D9E75] focus:outline-none transition-colors"
                      style={{ background: '#1a1a1a' }}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Password</label>
                    <input
                      type="password"
                      {...register('password', { required: true, minLength: { value: 6, message: 'Minimum 6 characters' } })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/10 focus:border-[#1D9E75] focus:outline-none transition-colors"
                      style={{ background: '#1a1a1a' }}
                    />
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-[#1D9E75] text-white text-sm font-medium hover:bg-[#17856A] transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>
                </form>
              )}

              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer text-lg leading-none"
              >
                ✕
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
