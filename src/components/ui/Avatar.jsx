export default function Avatar({ name = '', src = null, size = 'md' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-2xl',
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-[#1D9E75] flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      {initials}
    </div>
  )
}
