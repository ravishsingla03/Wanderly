import { create } from 'zustand'

const useFilterStore = create((set) => ({
  activeFilter: 'all',
  searchQuery: '',

  setFilter: (filter) => set({ activeFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))

export default useFilterStore
