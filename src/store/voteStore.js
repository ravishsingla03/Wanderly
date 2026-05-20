import { create } from 'zustand'
import { castVote, removeVote } from '../lib/queries'

/**
 * Tracks per-trip vote state for optimistic UI.
 *
 * counts: { [tripId]: { up: number, down: number } }
 * userVotes: { [tripId]: 'up' | 'down' | null }
 */
const useVoteStore = create((set, get) => ({
  counts: {},
  userVotes: {},

  initCounts: (trips) => {
    const counts = {}
    trips.forEach((t) => {
      counts[t.id] = { up: t.likes_count ?? 0, down: t.dislikes_count ?? 0 }
    })
    set((state) => ({ counts: { ...state.counts, ...counts } }))
  },

  setUserVotes: (votesMap) => {
    set((state) => ({ userVotes: { ...state.userVotes, ...votesMap } }))
  },

  vote: async (userId, tripId, direction) => {
    if (!userId) return
    const { counts, userVotes } = get()
    const current = userVotes[tripId] ?? null
    const tripCounts = counts[tripId] ?? { up: 0, down: 0 }

    const newCounts = { ...tripCounts }
    let newVote = direction

    if (current === direction) {
      // Toggle off — remove vote
      newVote = null
      if (direction === 'up') newCounts.up = Math.max(0, newCounts.up - 1)
      else newCounts.down = Math.max(0, newCounts.down - 1)
    } else {
      // Switch or new vote
      if (current === 'up') newCounts.up = Math.max(0, newCounts.up - 1)
      if (current === 'down') newCounts.down = Math.max(0, newCounts.down - 1)
      if (direction === 'up') newCounts.up += 1
      else newCounts.down += 1
    }

    // Optimistic update
    set((state) => ({
      counts: { ...state.counts, [tripId]: newCounts },
      userVotes: { ...state.userVotes, [tripId]: newVote },
    }))

    try {
      if (newVote === null) {
        await removeVote(userId, tripId)
      } else {
        await castVote(userId, tripId, newVote === 'up')
      }
    } catch {
      // Rollback on failure
      set((state) => ({
        counts: { ...state.counts, [tripId]: tripCounts },
        userVotes: { ...state.userVotes, [tripId]: current },
      }))
    }
  },
}))

export default useVoteStore
