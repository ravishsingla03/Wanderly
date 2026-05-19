export default function Button({ children, variant = 'primary', onClick, type = 'button', disabled = false, className = '' }) {
  const variants = {
    primary: 'bg-[#1D9E75] hover:bg-[#17856A] text-white',
    secondary: 'border border-white/30 text-white hover:bg-white/10',
    ghost: 'text-white/70 hover:text-white hover:bg-white/10',
    dark: 'bg-[#1a1a1a] border border-[#333] text-white hover:bg-[#222]',
    outline: 'border border-[#1D9E75] text-[#1D9E75] hover:bg-[#1D9E75] hover:text-white',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant]} ${className}`}
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      {children}
    </button>
  )
}
