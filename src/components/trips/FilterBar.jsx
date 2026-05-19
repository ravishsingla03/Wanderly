import useFilterStore from '../../store/filterStore'

const FILTERS = [
  { id: 'all', label: 'All trips' },
  { id: 'solo', label: 'Solo travel' },
  { id: 'budget', label: 'Budget ₹5k–20k' },
  { id: 'couple', label: 'Couples' },
  { id: 'group', label: 'Backpacking' },
  { id: 'family', label: 'Family' },
  { id: 'luxury', label: 'Luxury' },
]

export default function FilterBar() {
  const { activeFilter, setFilter } = useFilterStore()

  return (
    <div className="flex flex-wrap gap-2 justify-center" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {FILTERS.map((f) => {
        const isActive = activeFilter === f.id
        return (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-white text-[#0a0a0a] border-white'
                : 'bg-transparent text-white/70 border-white/20 hover:border-white/50 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
}
