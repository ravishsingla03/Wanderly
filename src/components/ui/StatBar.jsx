export default function StatBar() {
  const stats = [
    { value: '12,400+', label: 'trip journals' },
    { value: '94', label: 'countries covered' },
    { value: '₹800', label: 'avg daily budget shared' },
  ]

  return (
    <div className="flex items-center justify-center gap-10 py-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {stats.map((stat, i) => (
        <div key={i} className="text-center">
          <div className="text-2xl font-semibold text-white leading-tight">{stat.value}</div>
          <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
