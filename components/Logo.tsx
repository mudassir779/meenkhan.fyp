'use client'

export function Logo({ size = 'md', variant = 'dark' }: { size?: 'sm' | 'md' | 'lg'; variant?: 'dark' | 'light' }) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  const colors = {
    dark: 'text-safora-800',
    light: 'text-white',
  }

  const iconSize = size === 'lg' ? 36 : size === 'md' ? 28 : 22
  const stroke = variant === 'dark' ? '#1A8FA6' : 'white'

  return (
    <div className={`font-bold ${sizes[size]} ${colors[variant]} flex items-center gap-0.5`}
         style={{ fontFamily: 'Poppins, sans-serif' }}>
      <span>SAF</span>
      <span className="relative inline-flex items-center justify-center">
        {/* Steering wheel as 'O' */}
        <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="16" stroke={stroke} strokeWidth="2.5" fill="none"/>
          <circle cx="20" cy="20" r="4" stroke={stroke} strokeWidth="2" fill="none"/>
          <line x1="20" y1="4" x2="20" y2="16" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
          <line x1="7" y1="28" x2="16.5" y2="22" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
          <line x1="33" y1="28" x2="23.5" y2="22" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </span>
      <span>RA</span>
    </div>
  )
}

export function LogoIcon({ size = 60, variant = 'dark' }: { size?: number; variant?: 'dark' | 'light' }) {
  const stroke = variant === 'dark' ? '#3B8EA5' : 'rgba(255,255,255,0.85)'
  const strokeLight = variant === 'dark' ? '#5FADBF' : 'rgba(255,255,255,0.5)'
  const sw = '2'

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background arc lines (behind person) */}
      <path d="M25 95 C25 55, 50 25, 60 20 C70 25, 95 55, 95 95"
            stroke={strokeLight} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4"/>
      <path d="M20 100 C20 52, 48 18, 60 12 C72 18, 100 52, 100 100"
            stroke={strokeLight} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.25"/>

      {/* ── Helmet ── */}
      {/* Helmet dome */}
      <path d="M38 52 C38 34, 47 22, 60 22 C73 22, 82 34, 82 52"
            stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round"/>
      {/* Helmet brim */}
      <path d="M35 54 L85 54" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
      {/* Helmet stripes */}
      <path d="M42 32 L78 32" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M40 38 L80 38" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <path d="M39 44 L81 44" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M38 50 L82 50" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>

      {/* Visor / face area */}
      <path d="M42 54 L42 62 C42 66, 50 72, 60 72 C70 72, 78 66, 78 62 L78 54"
            stroke={stroke} strokeWidth={sw} fill="none"/>

      {/* ── Body / shoulders ── */}
      <path d="M42 68 C32 72, 26 80, 26 90"
            stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round"/>
      <path d="M78 68 C88 72, 94 80, 94 90"
            stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round"/>
      {/* Shoulder line */}
      <path d="M26 90 L38 85" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M94 90 L82 85" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>

      {/* ── Arms going to steering wheel ── */}
      {/* Left arm */}
      <path d="M34 86 C34 90, 36 96, 42 100"
            stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round"/>
      {/* Right arm */}
      <path d="M86 86 C86 90, 84 96, 78 100"
            stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round"/>

      {/* Left hand area */}
      <path d="M42 100 C40 102, 39 104, 40 106"
            stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Right hand area */}
      <path d="M78 100 C80 102, 81 104, 80 106"
            stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* ── Steering Wheel ── */}
      {/* Outer ring */}
      <circle cx="60" cy="104" r="18" stroke={stroke} strokeWidth={sw} fill="none"/>
      {/* Center hub */}
      <circle cx="60" cy="104" r="5" stroke={stroke} strokeWidth="1.8" fill="none"/>
      {/* Spokes */}
      <line x1="60" y1="86" x2="60" y2="99" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="43.5" y1="112" x2="55.5" y2="107" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="76.5" y1="112" x2="64.5" y2="107" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}
