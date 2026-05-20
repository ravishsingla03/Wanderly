import { useState, useEffect, useRef, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import FilterBar from '../components/trips/FilterBar'
import TripGrid from '../components/trips/TripGrid'
import StatBar from '../components/ui/StatBar'
import useFilterStore from '../store/filterStore'
import useAuthStore from '../store/authStore'
import useVoteStore from '../store/voteStore'
import { fetchTrips, fetchUserVotesForTrips } from '../lib/queries'

const PAGE_SIZE = 6

export default function Landing({ onAuthOpen }) {
  const { activeFilter, searchQuery, setSearchQuery } = useFilterStore()
  const [inputValue, setInputValue] = useState('')
  const sentinelRef = useRef(null)

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['trips', activeFilter, searchQuery],
    queryFn: ({ pageParam }) =>
      fetchTrips({ filter: activeFilter, search: searchQuery, limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
    retry: 1,
  })

  const trips = data?.pages.flat() ?? []

  const { user } = useAuthStore()
  const { initCounts, setUserVotes } = useVoteStore()

  // Seed vote counts into the store whenever new pages arrive
  useEffect(() => {
    if (!trips.length) return
    initCounts(trips)
    if (user?.id) {
      fetchUserVotesForTrips(user.id, trips.map((t) => t.id))
        .then(setUserVotes)
        .catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchQuery(inputValue)
  }

  const onSentinel = useCallback(
    (entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(onSentinel, { rootMargin: '200px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [onSentinel])

  return (
    <div className="min-h-screen" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Hero */}
      <section className="pt-32 pb-10 px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-semibold tracking-widest text-[#1D9E75] mb-5 uppercase"
        >
          Real trips · Real budgets · Real people
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-4xl md:text-5xl font-normal leading-[1.15] text-white mb-5 max-w-2xl mx-auto"
          style={{ fontFamily: 'DM Serif Display, serif' }}
        >
          Travel smarter,<br />
          inspired by{' '}
          <em className="text-[#1D9E75] not-italic" style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic' }}>
            real stories
          </em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed mb-8"
        >
          Browse thousands of trip journals — with full itineraries,
          budgets, stays, and honest reviews from fellow travelers.
        </motion.p>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSearch}
          className="flex items-center max-w-md mx-auto mb-8 rounded-xl overflow-hidden border border-white/10 bg-[#141414]"
        >
          <span className="pl-4 text-white/30">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="4" height="4" rx="1" />
            </svg>
          </span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Where do you want to go?"
            className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
          />
          <button
            type="submit"
            className="m-1.5 px-5 py-2 rounded-lg bg-white text-[#0a0a0a] text-sm font-medium hover:bg-white/90 transition-colors cursor-pointer"
          >
            Search
          </button>
        </motion.form>

        {/* Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="mb-2"
        >
          <FilterBar />
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34 }}
        >
          <StatBar />
        </motion.div>
      </section>

      {/* Trip Grid */}
      <section className="px-4 pb-16 max-w-6xl mx-auto">
        <TripGrid
          trips={trips}
          isLoading={isLoading}
          error={error}
          onAuthOpen={() => onAuthOpen?.('signup')}
        />

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-1" />

        {isFetchingNextPage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-[#141414] h-80 animate-pulse" />
            ))}
          </div>
        )}

        {!hasNextPage && trips.length > 0 && !isLoading && (
          <p className="text-center text-white/20 text-xs mt-10 tracking-wide">
            You've seen it all
          </p>
        )}
      </section>
    </div>
  )
}
