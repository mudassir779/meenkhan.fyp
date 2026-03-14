'use client'

export function StatusBar({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const color = variant === 'dark' ? 'text-safora-900' : 'text-white'

  return (
    <div className={`flex justify-between items-center px-6 pt-3 pb-1 ${color}`}>
      <span className="text-sm font-semibold">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <rect x="0" y="6" width="3" height="6" rx="0.5" opacity="0.4"/>
          <rect x="4.5" y="4" width="3" height="8" rx="0.5" opacity="0.6"/>
          <rect x="9" y="2" width="3" height="10" rx="0.5" opacity="0.8"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.5"/>
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
          <path d="M7.5 3.5C9.4 3.5 11.1 4.2 12.4 5.4L13.8 4C12.1 2.4 9.9 1.5 7.5 1.5S2.9 2.4 1.2 4L2.6 5.4C3.9 4.2 5.6 3.5 7.5 3.5z"/>
          <path d="M7.5 6.5C8.7 6.5 9.8 7 10.6 7.7L12 6.3C10.8 5.2 9.2 4.5 7.5 4.5S4.2 5.2 3 6.3L4.4 7.7C5.2 7 6.3 6.5 7.5 6.5z"/>
          <circle cx="7.5" cy="10" r="1.5"/>
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
          <rect x="0" y="1" width="21" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
          <rect x="22" y="4" width="2" height="4" rx="0.5" opacity="0.4"/>
          <rect x="1.5" y="2.5" width="16" height="7" rx="1" fill="currentColor"/>
        </svg>
      </div>
    </div>
  )
}
