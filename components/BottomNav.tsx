'use client'

import { Home, Phone, Users, Settings, Shield } from 'lucide-react'

interface BottomNavProps {
  active: string
  onNavigate: (screen: string) => void
}

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  const items = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'contact-list', icon: Users, label: 'Contacts' },
    { id: 'emergency-setup', icon: Shield, label: 'SOS' },
    { id: 'emergency-call', icon: Phone, label: 'Call' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-safora-100 px-2 pb-6 pt-2 z-20">
      <div className="flex justify-around items-center">
        {items.map((item) => {
          const isActive = active === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'text-safora-600'
                  : 'text-safora-300 hover:text-safora-500'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-safora-50 shadow-sm' : ''
              }`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
