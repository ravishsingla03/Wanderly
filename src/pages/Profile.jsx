import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { fetchProfile, fetchUserTrips, updateProfile } from '../lib/queries'
import TripCard from '../components/trips/TripCard'
import Avatar from '../components/ui/Avatar'
import useAuthStore from '../store/authStore'

export default function Profile() {
  const { userId } = useParams()
  const { user, profile: currentProfile, setProfile } = useAuthStore()
  const isOwn = user?.id === userId
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId),
    retry: 1,
  })

  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ['userTrips', userId],
    queryFn: () => fetchUserTrips(userId),
    retry: 1,
  })

  const { mutate: saveEdit, isPending } = useMutation({
    mutationFn: () => updateProfile(userId, { name: editName, bio: editBio }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['profile', userId])
      setProfile({ ...currentProfile, ...data })
      setEditing(false)
    },
  })

  const startEdit = () => {
    setEditName(profile?.name || '')
    setEditBio(profile?.bio || '')
    setEditing(true)
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-white/40 animate-pulse">Loading profile…</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <p className="text-white/50">Profile not found.</p>
        <button onClick={() => navigate('/')} className="text-[#1D9E75] text-sm underline cursor-pointer">Home</button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-20 pb-16 px-4"
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-start gap-6 mb-10 pt-8">
          <Avatar name={profile.name || 'User'} src={profile.avatar_url} size="xl" />
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-white text-lg border border-white/10 focus:border-[#1D9E75] focus:outline-none"
                  style={{ background: '#141414', fontFamily: 'DM Serif Display, serif' }}
                  placeholder="Your name"
                />
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white/70 border border-white/10 focus:border-[#1D9E75] focus:outline-none resize-none"
                  style={{ background: '#141414' }}
                  placeholder="A short bio…"
                />
                <div className="flex gap-3">
                  <button onClick={() => saveEdit()} disabled={isPending}
                    className="bg-[#1D9E75] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#17856A] disabled:opacity-60 cursor-pointer">
                    {isPending ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} className="text-white/50 text-sm hover:text-white cursor-pointer">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl text-white mb-1" style={{ fontFamily: 'DM Serif Display, serif' }}>
                  {profile.name || 'Traveler'}
                </h1>
                {profile.bio && <p className="text-white/50 text-sm mb-3">{profile.bio}</p>}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-white/50">
                    <span className="text-white font-semibold">{trips.length}</span> {trips.length === 1 ? 'trip' : 'trips'} shared
                  </span>
                  {isOwn && (
                    <button onClick={startEdit} className="text-xs text-[#1D9E75] border border-[#1D9E75]/40 px-3 py-1 rounded-lg hover:bg-[#1D9E75]/10 transition-colors cursor-pointer">
                      Edit profile
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Trips Grid */}
        <div>
          <h2 className="text-lg text-white mb-5" style={{ fontFamily: 'DM Serif Display, serif' }}>
            {isOwn ? 'Your Journals' : 'Trip Journals'}
          </h2>
          {tripsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i => <div key={i} className="h-72 rounded-2xl bg-[#141414] animate-pulse" />)}
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-14 text-white/30">
              <p className="mb-4">No trips shared yet.</p>
              {isOwn && (
                <button onClick={() => navigate('/create')} className="bg-[#1D9E75] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#17856A] transition-colors cursor-pointer">
                  Write your first journal
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {trips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
