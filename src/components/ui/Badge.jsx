export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-white/10 text-white border border-white/20',
    budget: 'bg-[#1a1a1a] text-[#ccc] border border-white/10 text-xs font-medium',
    tripType: 'bg-white/90 text-[#111] text-xs font-semibold',
    tag: 'bg-[#222] text-[#aaa] border border-[#333] text-xs',
    green: 'bg-[#1D9E75]/20 text-[#1D9E75] border border-[#1D9E75]/30',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${variants[variant]} ${className}`}
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      {children}
    </span>
  )
}
