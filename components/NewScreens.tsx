'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Shield, Zap, Coffee, MapPin, Navigation, Share2,
  HelpCircle, Info, Globe, Lock, Eye, EyeOff, CheckCircle2,
  Send, Bot, Phone, Star, Clock, Car, Fuel, MapPinned, User,
  ChevronRight, ChevronDown, ExternalLink, MessageCircle, FileText,
  AlertTriangle, TrendingUp, Route, Calendar, Volume2, Loader2,
  Settings, CircleStop
} from 'lucide-react'
import { Logo, LogoIcon } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
import type { IEmergencyContact, IUserSettings } from '@/types'

type Nav = (s: string) => void

const pageAnim = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
  transition: { duration: 0.35 },
}

/* ============================================================
   1. ONBOARDING (3 slides)
============================================================ */
export function OnboardingScreen({ nav }: { nav: Nav }) {
  const [slide, setSlide] = useState(0)

  const slides = [
    {
      icon: <Shield size={52} className="text-white" />,
      bg: 'from-safora-600 to-safora-800',
      title: 'Real-Time Monitoring',
      desc: 'Our AI watches your driving patterns, facial expressions, and mood to keep you safe on every journey.',
    },
    {
      icon: <AlertTriangle size={52} className="text-white" />,
      bg: 'from-amber-500 to-orange-600',
      title: 'Smart Alerts',
      desc: 'Get instant drowsiness warnings, speed alerts, and rest stop suggestions before danger strikes.',
    },
    {
      icon: <Phone size={52} className="text-white" />,
      bg: 'from-emerald-500 to-teal-600',
      title: 'Emergency Response',
      desc: 'Automatic crash detection and one-tap SOS calls to your emergency contacts when you need help most.',
    },
  ]

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <button onClick={() => nav('welcome')} className="self-end text-safora-400 text-sm mb-8 hover:text-safora-600 transition-colors">
          Skip
        </button>
        <motion.div
          key={slide}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${slides[slide].bg} flex items-center justify-center mb-10 shadow-xl`}
        >
          {slides[slide].icon}
        </motion.div>
        <motion.div key={`text-${slide}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-12">
          <h2 className="text-2xl font-bold text-safora-800 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {slides[slide].title}
          </h2>
          <p className="text-safora-500 text-sm leading-relaxed">{slides[slide].desc}</p>
        </motion.div>
        <div className="flex gap-2 mb-8">
          {slides.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === slide ? 'w-8 bg-safora-600' : 'w-2 bg-safora-200'}`} />
          ))}
        </div>
        <div className="w-full space-y-3">
          {slide < 2 ? (
            <button className="btn-primary" onClick={() => setSlide(s => s + 1)}>Next</button>
          ) : (
            <button className="btn-primary" onClick={() => nav('welcome')}>Get Started</button>
          )}
          {slide > 0 && (
            <button className="btn-secondary" onClick={() => setSlide(s => s - 1)}>Back</button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================================
   2. OTP VERIFICATION — wired to real API
============================================================ */
export function OTPScreen({ nav, email, onVerify, onResend, error, loading }: { nav: Nav; email?: string; onVerify?: (otp: string) => Promise<boolean>; onResend?: () => Promise<boolean>; error?: string; loading?: boolean }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(30)
  const [verified, setVerified] = useState(false)
  const [otpError, setOtpError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (timer > 0 && !verified) {
      const t = setTimeout(() => setTimer(s => s - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [timer, verified])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    if (otp.some(d => d === '')) {
      setOtpError('Please enter the complete 6-digit code')
      return
    }
    setOtpError('')
    const otpStr = otp.join('')

    if (onVerify) {
      const success = await onVerify(otpStr)
      if (success) {
        setVerified(true)
        setTimeout(() => nav('location-permission'), 1500)
      } else {
        setOtpError(error || 'Invalid OTP. Please try again.')
      }
    } else {
      setVerified(true)
      setTimeout(() => nav('location-permission'), 1500)
    }
  }

  const handleResend = async () => {
    if (onResend) {
      await onResend()
    }
    setTimer(30)
    setOtp(['', '', '', '', '', ''])
  }

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col">
      <div className="flex-1 flex flex-col px-8 pt-6">
        <button onClick={() => nav('signup')} className="flex items-center gap-1 text-safora-500 text-sm mb-6 hover:text-safora-700 transition-colors w-fit">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-safora-500 to-safora-700 flex items-center justify-center shadow-xl">
            <MessageCircle size={36} className="text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-safora-800 mb-2 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Verify Your Email
        </h2>
        <p className="text-safora-500 text-sm text-center mb-8">
          We sent a 6-digit code to<br /><span className="font-semibold text-safora-700">{email || 'your email'}</span>
        </p>

        {!verified ? (
          <>
            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-safora-200 bg-white text-safora-800 focus:border-safora-500 focus:ring-2 focus:ring-safora-200 outline-none transition-all"
                />
              ))}
            </div>

            {(otpError || error) && (
              <p className="text-center text-emergency text-xs mb-3 font-medium">{otpError || error}</p>
            )}

            <button className="btn-primary mb-4 flex items-center justify-center gap-2" onClick={handleVerify} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : null} Verify
            </button>

            <p className="text-center text-safora-400 text-sm">
              {timer > 0 ? (
                <>Resend code in <span className="font-semibold text-safora-600">{timer}s</span></>
              ) : (
                <button onClick={handleResend} className="text-safora-600 font-semibold hover:underline">Resend Code</button>
              )}
            </p>
          </>
        ) : (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <CheckCircle2 size={44} className="text-accent" />
            </div>
            <h3 className="text-xl font-bold text-safora-800 mb-1">Verified!</h3>
            <p className="text-safora-500 text-sm">Redirecting...</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

/* ============================================================
   3. TRIP SUMMARY — wired to real trip data
============================================================ */
export function TripSummaryScreen({ nav, trips }: { nav: Nav; trips?: any[] }) {
  const lastTrip = trips?.filter(t => t.status === 'completed')[0]

  const safetyScore = lastTrip?.safetyScore ?? 88
  const distance = lastTrip?.distance ?? 0
  const topSpeed = lastTrip?.topSpeed ?? 0
  const avgSpeed = lastTrip?.avgSpeed ?? 0
  const duration = lastTrip?.endTime && lastTrip?.startTime
    ? Math.round((new Date(lastTrip.endTime).getTime() - new Date(lastTrip.startTime).getTime()) / 60000)
    : 0

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col relative">
      <div className="flex-1 flex flex-col px-6 pt-6 pb-24 overflow-y-auto">
        <button onClick={() => nav('dashboard')} className="flex items-center gap-1 text-safora-500 text-sm mb-4 hover:text-safora-700 transition-colors w-fit">
          <ArrowLeft size={16} /> Dashboard
        </button>

        <h2 className="text-xl font-bold text-safora-800 mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>Trip Summary</h2>

        {!lastTrip ? (
          <div className="flex flex-col items-center py-12">
            <Route size={48} className="text-safora-300 mb-4" />
            <p className="text-safora-400 text-sm">No completed trips yet</p>
            <p className="text-safora-300 text-xs">Start a trip from the dashboard</p>
          </div>
        ) : (
          <>
            {/* Score circle */}
            <div className="flex justify-center mb-6">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#E8F4F8" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={safetyScore >= 80 ? '#2EC4B6' : safetyScore >= 60 ? '#F4A261' : '#E63946'} strokeWidth="8"
                    strokeDasharray={264} strokeDashoffset={264 * (1 - safetyScore / 100)} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-safora-800">{safetyScore}</span>
                  <span className="text-safora-400 text-xs">Safety Score</span>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Distance', value: `${distance} km`, icon: Route, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Duration', value: `${duration} min`, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50' },
                { label: 'Top Speed', value: `${topSpeed} km/h`, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Avg Speed', value: `${avgSpeed} km/h`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-3.5 border border-safora-100 shadow-sm">
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                    <stat.icon size={16} className={stat.color} />
                  </div>
                  <p className="text-xs text-safora-400">{stat.label}</p>
                  <p className="text-lg font-bold text-safora-800">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Mood */}
            <div className="p-4 bg-white rounded-xl border border-safora-100 shadow-sm">
              <p className="text-xs text-safora-400 mb-1">Overall Mood</p>
              <p className="text-sm font-semibold text-safora-800">{lastTrip.mood || 'Alert'}</p>
            </div>
          </>
        )}
      </div>
      <BottomNav active="dashboard" onNavigate={(s) => nav(s)} />
    </motion.div>
  )
}

/* ============================================================
   4. AI CHAT — wired to real chat API
============================================================ */
export function AIChatScreen({ nav }: { nav: Nav }) {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load chat history
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await fetch('/api/chat')
        const data = await res.json()
        if (data.success && data.data?.length > 0) {
          setMessages(data.data.map((m: any) => ({ role: m.role, text: m.text })))
        } else {
          setMessages([
            { role: 'bot', text: "Hi! I'm Alex, your driving safety assistant. How can I help you today?" },
          ])
        }
      } catch {
        setMessages([
          { role: 'bot', text: "Hi! I'm Alex, your driving safety assistant. How can I help you today?" },
        ])
      }
      setLoaded(true)
    }
    loadMessages()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async () => {
    if (!input.trim()) return
    const text = input.trim()
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      setIsTyping(false)
      if (data.success && data.data?.botMessage) {
        setMessages(prev => [...prev, { role: 'bot', text: data.data.botMessage.text }])
      }
    } catch {
      setIsTyping(false)
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't process that. Please try again." }])
    }
  }

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col relative">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 pt-6 pb-3 border-b border-safora-100">
          <div className="flex items-center gap-3">
            <button onClick={() => nav('dashboard')} className="text-safora-500 hover:text-safora-700 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-safora-400 to-safora-600 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-safora-800">Alex - AI Assistant</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-[10px] text-safora-400">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 pb-20">
          {!loaded ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-safora-400" size={24} /></div>
          ) : (
            messages.map((msg, i) => (
              <motion.div key={i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.03 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-safora-600 text-white rounded-br-sm'
                    : 'bg-white border border-safora-100 text-safora-800 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))
          )}
          {isTyping && (
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-start">
              <div className="max-w-[80%] px-4 py-3 rounded-2xl text-sm bg-white border border-safora-100 text-safora-400 rounded-bl-sm shadow-sm flex items-center gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                <span className="ml-1 text-xs">Alex is typing</span>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-white via-white to-transparent">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask Alex anything..."
              className="flex-1 px-4 py-3 bg-safora-50 border border-safora-200 rounded-2xl text-sm text-safora-800 outline-none focus:border-safora-500 focus:ring-2 focus:ring-safora-100 transition-all"
            />
            <button onClick={sendMessage} disabled={isTyping} className="w-12 h-12 rounded-2xl bg-safora-600 flex items-center justify-center hover:bg-safora-700 active:scale-95 transition-all shadow-md disabled:opacity-50">
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================================
   5. SPEED ALERT
============================================================ */
export function SpeedAlertScreen({ nav }: { nav: Nav }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center"
      style={{ background: 'linear-gradient(180deg, #7C2D12 0%, #DC2626 50%, #F87171 100%)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}
          className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
          <Zap size={48} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>SLOW DOWN!</h2>
        <p className="text-white/70 text-lg mb-2">Current Speed</p>
        <p className="text-6xl font-bold text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>120</p>
        <p className="text-white/60 text-sm mb-6">km/h</p>
        <div className="bg-white/15 backdrop-blur rounded-2xl p-4 mb-8 w-full border border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-xs">Speed Limit</p>
              <p className="text-white text-xl font-bold">80 km/h</p>
            </div>
            <div>
              <p className="text-white/60 text-xs">Over by</p>
              <p className="text-red-200 text-xl font-bold">+40 km/h</p>
            </div>
          </div>
        </div>
        <button className="btn-primary !bg-white !text-red-600 !shadow-xl" onClick={() => nav('dashboard')}>
          I&apos;ll Slow Down
        </button>
      </div>
    </motion.div>
  )
}

/* ============================================================
   6. REST STOP SUGGESTION
============================================================ */
export function RestStopScreen({ nav }: { nav: Nav }) {
  const stops = [
    { name: 'Shell Petrol Station', distance: '2.3 km', time: '3 min', type: 'Fuel + Coffee', rating: 4.2 },
    { name: 'Highway Rest Area', distance: '5.1 km', time: '6 min', type: 'Rest + Food', rating: 4.5 },
    { name: 'PSO Fuel Station', distance: '8.7 km', time: '10 min', type: 'Fuel + Shop', rating: 3.8 },
  ]

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col relative">
      <div className="flex-1 flex flex-col px-6 pt-6 pb-24 overflow-y-auto">
        <button onClick={() => nav('dashboard')} className="flex items-center gap-1 text-safora-500 text-sm mb-4 hover:text-safora-700 transition-colors w-fit">
          <ArrowLeft size={16} /> Dashboard
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Coffee size={20} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-safora-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Take a Break</h2>
            <p className="text-safora-400 text-xs">You&apos;ve been driving for 2 hours</p>
          </div>
        </div>
        <div className="w-full h-40 rounded-2xl bg-gradient-to-br from-safora-100 to-safora-200 mb-5 flex items-center justify-center border border-safora-200 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #1A8FA6 1px, transparent 1px), radial-gradient(circle at 70% 30%, #1A8FA6 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="flex flex-col items-center z-10">
            <MapPinned size={32} className="text-safora-500 mb-1" />
            <p className="text-safora-500 text-xs font-medium">Nearby Rest Stops</p>
          </div>
        </div>
        <div className="space-y-3">
          {stops.map((stop, i) => (
            <motion.div key={i} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className="p-4 bg-white rounded-xl border border-safora-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-safora-800">{stop.name}</p>
                  <p className="text-xs text-safora-400">{stop.type}</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50">
                  <Star size={10} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-medium text-amber-600">{stop.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <span className="text-xs text-safora-500 flex items-center gap-1"><MapPin size={12} />{stop.distance}</span>
                  <span className="text-xs text-safora-500 flex items-center gap-1"><Clock size={12} />{stop.time}</span>
                </div>
                <button onClick={() => nav('dashboard')} className="px-3 py-1.5 bg-safora-600 text-white text-xs rounded-lg font-medium hover:bg-safora-700 active:scale-95 transition-all">
                  Navigate
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav active="dashboard" onNavigate={(s) => nav(s)} />
    </motion.div>
  )
}

/* ============================================================
   7. CRASH / ACCIDENT DETECTION — wired to emergency API
============================================================ */
export function CrashDetectionScreen({ nav, onTriggerSOS }: { nav: Nav; onTriggerSOS?: () => void }) {
  const [countdown, setCountdown] = useState(15)

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    } else if (onTriggerSOS) {
      onTriggerSOS()
    }
  }, [countdown]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center"
      style={{ background: 'linear-gradient(180deg, #7C2D12 0%, #991B1B 40%, #DC2626 100%)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
          className="w-28 h-28 rounded-full bg-white/15 flex items-center justify-center mb-6 relative">
          <Car size={52} className="text-white" />
          <div className="absolute inset-[-8px] rounded-full border-2 border-white/20 animate-ping" style={{ animationDuration: '1.5s' }} />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>Crash Detected!</h2>
        <p className="text-white/60 text-sm mb-6 text-center">An impact has been detected.<br />Are you okay?</p>
        <div className="relative w-20 h-20 mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="6"
              strokeDasharray={264} strokeDashoffset={264 * (1 - countdown / 15)} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{countdown}</span>
          </div>
        </div>
        <p className="text-white/50 text-xs mb-8">Emergency services will be contacted<br />automatically if no response</p>
        <div className="w-full space-y-3">
          <button className="btn-primary !bg-white !text-red-600 !shadow-xl font-bold" onClick={() => nav('dashboard')}>
            I&apos;m Okay
          </button>
          <button className="w-full py-3.5 bg-white/15 border border-white/20 text-white rounded-2xl font-semibold text-sm hover:bg-white/25 transition-colors" onClick={() => nav('emergency-call')}>
            Call Emergency Now
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================================
   8. LIVE LOCATION SHARING — wired to contacts API
============================================================ */
export function LiveLocationScreen({ nav, contacts }: { nav: Nav; contacts?: IEmergencyContact[] }) {
  const [sharing, setSharing] = useState(true)

  const displayContacts = contacts && contacts.length > 0
    ? contacts.map(c => ({ name: c.name, sharing: c.shareLocation }))
    : [{ name: 'Dad', sharing: true }, { name: 'Mom', sharing: true }, { name: 'Aliya', sharing: false }]

  const handleToggleSharing = async () => {
    setSharing(!sharing)
    try {
      await fetch('/api/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationSharing: !sharing }),
      })
    } catch { /* silent */ }
  }

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col relative">
      <div className="flex-1 flex flex-col px-6 pt-6 pb-24 overflow-y-auto">
        <button onClick={() => nav('dashboard')} className="flex items-center gap-1 text-safora-500 text-sm mb-4 hover:text-safora-700 transition-colors w-fit">
          <ArrowLeft size={16} /> Dashboard
        </button>
        <h2 className="text-xl font-bold text-safora-800 mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>Live Location</h2>
        <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-safora-100 to-safora-200 mb-5 flex items-center justify-center border border-safora-200 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #1A8FA6 1px, transparent 1px)', backgroundSize: '25px 25px' }} />
          <div className="flex flex-col items-center z-10">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Navigation size={36} className="text-safora-600" />
            </motion.div>
            <p className="text-safora-600 text-xs font-medium mt-2">Your Live Location</p>
            <p className="text-safora-400 text-[10px]">Islamabad, Pakistan</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-safora-100 shadow-sm mb-4">
          <div className="flex items-center gap-3">
            <Share2 size={18} className="text-safora-600" />
            <div>
              <p className="text-sm font-medium text-safora-800">Share Location</p>
              <p className="text-xs text-safora-400">With emergency contacts</p>
            </div>
          </div>
          <button className={`toggle-track ${sharing ? 'active' : ''}`} onClick={handleToggleSharing}>
            <div className="toggle-thumb" />
          </button>
        </div>
        <h3 className="text-sm font-semibold text-safora-700 mb-3">Sharing With</h3>
        <div className="space-y-2.5">
          {displayContacts.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-safora-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-safora-100 flex items-center justify-center text-sm">
                  {c.name[0]}
                </div>
                <span className="text-sm font-medium text-safora-800">{c.name}</span>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.sharing ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {c.sharing ? 'Active' : 'Off'}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="dashboard" onNavigate={(s) => nav(s)} />
    </motion.div>
  )
}

/* ============================================================
   9. HELP & SUPPORT
============================================================ */
export function HelpScreen({ nav }: { nav: Nav }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    { q: 'How does drowsiness detection work?', a: 'SAFORA uses your phone camera to monitor your facial expressions and eye movements. When signs of fatigue are detected, it sends an immediate alert.' },
    { q: 'How do emergency contacts work?', a: 'You can add up to 5 emergency contacts. When a crash is detected or you trigger SOS, they receive an automatic call and your live location.' },
    { q: 'Does SAFORA work offline?', a: 'Core features like drowsiness detection and speed monitoring work offline. Emergency calls and location sharing require an internet connection.' },
    { q: 'How accurate is crash detection?', a: 'SAFORA uses accelerometer and GPS data to detect sudden impacts with 95% accuracy. You always get a countdown to cancel false alarms.' },
  ]

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col relative">
      <div className="flex-1 flex flex-col px-6 pt-6 pb-24 overflow-y-auto">
        <button onClick={() => nav('settings')} className="flex items-center gap-1 text-safora-500 text-sm mb-6 hover:text-safora-700 transition-colors w-fit">
          <ArrowLeft size={16} /> Settings
        </button>
        <h2 className="text-xl font-bold text-safora-800 mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>Help & Support</h2>
        <div className="bg-gradient-to-r from-safora-700 to-safora-500 rounded-2xl p-4 mb-5">
          <p className="text-white font-semibold text-sm mb-1">Need Help?</p>
          <p className="text-white/60 text-xs mb-3">Our support team is available 24/7</p>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 bg-white/20 rounded-xl text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/30 transition-colors">
              <MessageCircle size={14} /> Live Chat
            </button>
            <button className="flex-1 py-2.5 bg-white/20 rounded-xl text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/30 transition-colors">
              <Phone size={14} /> Call Us
            </button>
          </div>
        </div>
        <h3 className="text-sm font-semibold text-safora-700 mb-3">Frequently Asked Questions</h3>
        <div className="space-y-2.5">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}
              className="bg-white rounded-xl border border-safora-100 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                <span className="text-sm font-medium text-safora-800 pr-2">{faq.q}</span>
                <ChevronDown size={16} className={`text-safora-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-4 pb-4">
                  <p className="text-xs text-safora-500 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav active="settings" onNavigate={(s) => nav(s)} />
    </motion.div>
  )
}

/* ============================================================
   10. ABOUT APP
============================================================ */
export function AboutScreen({ nav }: { nav: Nav }) {
  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col relative">
      <div className="flex-1 flex flex-col px-6 pt-6 pb-24 overflow-y-auto">
        <button onClick={() => nav('settings')} className="flex items-center gap-1 text-safora-500 text-sm mb-6 hover:text-safora-700 transition-colors w-fit">
          <ArrowLeft size={16} /> Settings
        </button>
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-safora-100 to-safora-200 flex items-center justify-center mb-4 shadow-lg border border-safora-200">
            <LogoIcon size={70} variant="dark" />
          </div>
          <Logo size="md" variant="dark" />
          <p className="text-safora-400 text-xs mt-1">Version 1.0.0</p>
        </div>
        <p className="text-safora-500 text-sm text-center mb-8 leading-relaxed">
          SAFORA is an AI-powered road safety companion that monitors your driving, detects drowsiness, and ensures your safety on every journey.
        </p>
        <div className="space-y-2.5">
          {[
            { label: 'Privacy Policy', icon: FileText },
            { label: 'Terms of Service', icon: FileText },
            { label: 'Open Source Licenses', icon: ExternalLink },
            { label: 'Rate This App', icon: Star },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-safora-100 shadow-sm hover:shadow-md transition-shadow">
              <item.icon size={18} className="text-safora-500" />
              <span className="flex-1 text-left text-sm font-medium text-safora-800">{item.label}</span>
              <ChevronRight size={16} className="text-safora-300" />
            </button>
          ))}
        </div>
        <p className="text-center text-safora-300 text-xs mt-8">Made by Aiman</p>
      </div>
      <BottomNav active="settings" onNavigate={(s) => nav(s)} />
    </motion.div>
  )
}

/* ============================================================
   11. CHANGE PASSWORD — wired to real API
============================================================ */
export function ChangePasswordScreen({ nav }: { nav: Nav }) {
  const [show, setShow] = useState({ old: false, new1: false, new2: false })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (newPw !== confirmPw) {
      setError('New passwords do not match')
      return
    }
    if (newPw.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
      } else {
        setError(data.error || 'Failed to change password')
      }
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col">
      <div className="flex-1 flex flex-col px-8 pt-6">
        <button onClick={() => nav('settings')} className="flex items-center gap-1 text-safora-500 text-sm mb-6 hover:text-safora-700 transition-colors w-fit">
          <ArrowLeft size={16} /> Settings
        </button>
        <h2 className="text-xl font-bold text-safora-800 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Change Password</h2>

        {!saved ? (
          <div className="space-y-4">
            {error && <p className="text-emergency text-xs font-medium text-center bg-red-50 py-2 rounded-lg">{error}</p>}
            <div>
              <label className="text-xs font-medium text-safora-500 mb-1.5 block">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
                <input type={show.old ? 'text' : 'password'} placeholder="Enter current password" className="safora-input" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
                <button onClick={() => setShow({ ...show, old: !show.old })} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-safora-400">
                  {show.old ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-safora-500 mb-1.5 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
                <input type={show.new1 ? 'text' : 'password'} placeholder="Enter new password" className="safora-input" value={newPw} onChange={e => setNewPw(e.target.value)} />
                <button onClick={() => setShow({ ...show, new1: !show.new1 })} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-safora-400">
                  {show.new1 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-safora-500 mb-1.5 block">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
                <input type={show.new2 ? 'text' : 'password'} placeholder="Confirm new password" className="safora-input" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
                <button onClick={() => setShow({ ...show, new2: !show.new2 })} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-safora-400">
                  {show.new2 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button className="btn-primary mt-2 flex items-center justify-center gap-2" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : null} Update Password
            </button>
          </div>
        ) : (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center mt-10">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <CheckCircle2 size={44} className="text-accent" />
            </div>
            <h3 className="text-xl font-bold text-safora-800 mb-2">Password Updated!</h3>
            <p className="text-safora-500 text-sm mb-6">Your password has been changed successfully</p>
            <button className="btn-primary" onClick={() => nav('settings')}>Back to Settings</button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

/* ============================================================
   12. LANGUAGE SELECTION — wired to settings API
============================================================ */
export function LanguageScreen({ nav, settings, onSave }: { nav: Nav; settings?: IUserSettings | null; onSave?: (data: Partial<IUserSettings>) => Promise<any> }) {
  const [selected, setSelected] = useState(settings?.language || 'en')

  const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰' },
    { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  ]

  const handleSave = async () => {
    if (onSave) {
      await onSave({ language: selected })
    }
    nav('settings')
  }

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col relative">
      <div className="flex-1 flex flex-col px-6 pt-6 pb-24 overflow-y-auto">
        <button onClick={() => nav('settings')} className="flex items-center gap-1 text-safora-500 text-sm mb-6 hover:text-safora-700 transition-colors w-fit">
          <ArrowLeft size={16} /> Settings
        </button>
        <div className="flex items-center gap-3 mb-6">
          <Globe size={22} className="text-safora-600" />
          <h2 className="text-xl font-bold text-safora-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Language</h2>
        </div>
        <div className="space-y-2.5">
          {languages.map((lang, i) => (
            <motion.button key={lang.code} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}
              onClick={() => setSelected(lang.code)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                selected === lang.code
                  ? 'bg-safora-50 border-safora-500 shadow-sm'
                  : 'bg-white border-safora-100 hover:border-safora-200'
              }`}>
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-safora-800">{lang.name}</p>
                <p className="text-xs text-safora-400">{lang.native}</p>
              </div>
              {selected === lang.code && (
                <CheckCircle2 size={20} className="text-safora-600" />
              )}
            </motion.button>
          ))}
        </div>
        <button className="btn-primary mt-6" onClick={handleSave}>Save Language</button>
      </div>
      <BottomNav active="settings" onNavigate={(s) => nav(s)} />
    </motion.div>
  )
}

/* ============================================================
   13. HIGH SPEED ALERT (Critical - 150+ km/h)
============================================================ */
export function HighSpeedAlertScreen({ nav }: { nav: Nav }) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center"
      style={{ background: 'linear-gradient(180deg, #450A0A 0%, #7F1D1D 30%, #DC2626 70%, #EF4444 100%)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 0.6, repeat: Infinity }}
          className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm border-4 border-white/30">
          <AlertTriangle size={56} className="text-white" />
        </motion.div>
        <motion.h2 animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
          className="text-4xl font-black text-white mb-2 text-center tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
          DANGER!
        </motion.h2>
        <p className="text-white/80 text-base font-semibold mb-2">Extremely High Speed</p>
        <p className="text-7xl font-black text-white mb-0" style={{ fontFamily: 'Poppins, sans-serif' }}>156</p>
        <p className="text-white/50 text-sm mb-6">km/h</p>
        <div className="w-full grid grid-cols-3 gap-2 mb-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/10">
            <p className="text-white/50 text-[10px]">Speed Limit</p>
            <p className="text-white text-lg font-bold">80</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/10">
            <p className="text-white/50 text-[10px]">Over By</p>
            <p className="text-red-200 text-lg font-bold">+76</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/10">
            <p className="text-white/50 text-[10px]">Risk Level</p>
            <p className="text-red-300 text-lg font-bold">CRITICAL</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 w-full mb-6 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/30 flex items-center justify-center">
              <Phone size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-xs font-semibold">Emergency contacts will be notified</p>
              <p className="text-white/40 text-[10px]">in {countdown} seconds if speed not reduced</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <span className="text-white text-lg font-bold">{countdown}</span>
            </div>
          </div>
        </div>
        <button className="btn-primary !bg-white !text-red-700 !shadow-xl !font-black !text-lg" onClick={() => nav('dashboard')}>
          I&apos;ll Slow Down Now
        </button>
      </div>
    </motion.div>
  )
}

/* ============================================================
   14. ADD EMERGENCY CONTACT — wired to real API
============================================================ */
export function AddContactScreen({ nav, editingContact, onSave, loading }: { nav: Nav; editingContact?: IEmergencyContact | null; onSave?: (data: Partial<IEmergencyContact>) => Promise<void>; loading?: boolean }) {
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState(editingContact?.name || '')
  const [phone, setPhone] = useState(editingContact?.phone || '')
  const [relationship, setRelationship] = useState(editingContact?.relationship || '')
  const [priority, setPriority] = useState(editingContact?.priority || 0)
  const [alertSms, setAlertSms] = useState(editingContact?.alertSms ?? true)
  const [shareLoc, setShareLoc] = useState(editingContact?.shareLocation ?? true)

  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name || '')
      setPhone(editingContact.phone || '')
      setRelationship(editingContact.relationship || '')
      setPriority(editingContact.priority || 0)
      setAlertSms(editingContact.alertSms ?? true)
      setShareLoc(editingContact.shareLocation ?? true)
    } else {
      setName('')
      setPhone('')
      setRelationship('')
      setPriority(0)
      setAlertSms(true)
      setShareLoc(true)
    }
  }, [editingContact])

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) return
    if (onSave) {
      await onSave({ name, phone, relationship, priority, alertSms, shareLocation: shareLoc })
      setSaved(true)
    } else {
      setSaved(true)
    }
  }

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col relative">
      <div className="flex-1 flex flex-col px-6 pt-6 pb-24 overflow-y-auto">
        <button onClick={() => nav('contact-list')} className="flex items-center gap-1 text-safora-500 text-sm mb-6 hover:text-safora-700 transition-colors w-fit">
          <ArrowLeft size={16} /> Contact List
        </button>
        <h2 className="text-xl font-bold text-safora-800 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
        </h2>

        {!saved ? (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-safora-100 flex items-center justify-center border-2 border-dashed border-safora-300">
                <Phone size={28} className="text-safora-400" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-safora-500 mb-1.5 block">Contact Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
                <input type="text" placeholder="e.g. Brother, Friend" className="safora-input" value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-safora-500 mb-1.5 block">Phone Number</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 py-3 bg-white rounded-xl border border-safora-200 text-sm text-safora-600">+92</div>
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
                  <input type="tel" placeholder="3XX XXXXXXX" className="safora-input !pl-10" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-safora-500 mb-1.5 block">Relationship</label>
              <div className="relative">
                <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
                <input type="text" placeholder="e.g. Sister, Father, Friend" className="safora-input" value={relationship} onChange={e => setRelationship(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-safora-500 mb-1.5 block">Priority Level</label>
              <div className="flex gap-2">
                {['Primary', 'Secondary', 'Backup'].map((p, i) => (
                  <button key={p} onClick={() => setPriority(2 - i)} className={`flex-1 py-3 rounded-xl text-xs font-medium transition-all ${
                    (2 - i) === priority ? 'bg-safora-600 text-white shadow-md' : 'bg-white text-safora-500 border border-safora-200 hover:border-safora-400'
                  }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-safora-100">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} className="text-safora-600" />
                  <span className="text-sm font-medium text-safora-800">Send Alert SMS</span>
                </div>
                <button onClick={() => setAlertSms(!alertSms)} className={`toggle-track ${alertSms ? 'active' : ''}`}><div className="toggle-thumb" /></button>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-safora-100">
                <div className="flex items-center gap-3">
                  <Share2 size={16} className="text-safora-600" />
                  <span className="text-sm font-medium text-safora-800">Share Live Location</span>
                </div>
                <button onClick={() => setShareLoc(!shareLoc)} className={`toggle-track ${shareLoc ? 'active' : ''}`}><div className="toggle-thumb" /></button>
              </div>
            </div>
            <button className="btn-primary mt-4 flex items-center justify-center gap-2" onClick={handleSave} disabled={loading || !name.trim() || !phone.trim()}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : null} {editingContact ? 'Update Contact' : 'Save Contact'}
            </button>
          </div>
        ) : (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center mt-10">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <CheckCircle2 size={44} className="text-accent" />
            </div>
            <h3 className="text-xl font-bold text-safora-800 mb-2">Contact {editingContact ? 'Updated' : 'Saved'}!</h3>
            <p className="text-safora-500 text-sm mb-6">Emergency contact {editingContact ? 'updated' : 'added'} successfully</p>
            <div className="w-full space-y-3">
              <button className="btn-primary" onClick={() => nav('contact-list')}>View Contacts</button>
              {!editingContact && (
                <button className="btn-secondary" onClick={() => { setSaved(false); setName(''); setPhone(''); setRelationship('') }}>Add Another</button>
              )}
            </div>
          </motion.div>
        )}
      </div>
      <BottomNav active="contact-list" onNavigate={(s) => nav(s)} />
    </motion.div>
  )
}

/* ============================================================
   15. CAMERA MONITORING SCREEN
============================================================ */
export function MonitoringScreen({ nav, activeTrip, onEndTrip, onTriggerSOS }: { nav: Nav; activeTrip?: any; onEndTrip?: () => void; onTriggerSOS?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [timer, setTimer] = useState(0)
  const [speed] = useState(61)
  const [aiConnected, setAiConnected] = useState(false)
  const [alertState, setAlertState] = useState<'none' | 'drowsy' | 'distraction' | 'drunk'>('none')
  const [alertCount, setAlertCount] = useState({ drowsy: 0, distraction: 0, drunk: 0 })
  const [showAlert, setShowAlert] = useState(false)
  const alertTriggeredRef = useRef(false)
  const [aiData, setAiData] = useState({
    mood: 'Connecting...',
    moodEmoji: '⏳',
    alertness: '--',
    eyes: '--',
    confidence: 0,
  })

  const AI_SERVER = 'http://localhost:8000'

  // Start camera
  useEffect(() => {
    let stream: MediaStream | null = null
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCameraActive(true)
        }
      } catch {
        console.log('Camera not available')
      }
    }
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  // Check AI server health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${AI_SERVER}/health`)
        const data = await res.json()
        setAiConnected(data.model_loaded === true)
      } catch {
        setAiConnected(false)
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  // Timer
  useEffect(() => {
    const t = setInterval(() => setTimer(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Send frames to AI server for prediction
  useEffect(() => {
    if (!cameraActive) return
    let running = true

    const captureAndPredict = async () => {
      while (running) {
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current
          const canvas = canvasRef.current
          canvas.width = 320
          canvas.height = 240
          const ctx = canvas.getContext('2d')
          if (ctx && video.readyState >= 2) {
            ctx.drawImage(video, 0, 0, 320, 240)
            const base64 = canvas.toDataURL('image/jpeg', 0.6)

            try {
              const res = await fetch(`${AI_SERVER}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64 }),
              })
              const data = await res.json()
              if (data.success) {
                setAiConnected(true)
                setAiData({
                  mood: data.mood,
                  moodEmoji: data.emoji,
                  alertness: data.alertness,
                  eyes: data.eyes,
                  confidence: data.confidence,
                })

                // Alert logic based on detection
                const prediction = data.prediction as string
                if (prediction === 'drunk' || prediction === 'drowsy' || prediction === 'distraction') {
                  setAlertCount(prev => {
                    const newCount = { ...prev, [prediction]: (prev[prediction as keyof typeof prev] || 0) + 1 }

                    // DRUNK: 3 consecutive = immediate SOS
                    if (prediction === 'drunk' && newCount.drunk >= 3 && !alertTriggeredRef.current) {
                      alertTriggeredRef.current = true
                      setAlertState('drunk')
                      setShowAlert(true)
                      // Auto SOS after 5 seconds if not cancelled
                    }
                    // DROWSY: 5 consecutive = drowsy alert
                    else if (prediction === 'drowsy' && newCount.drowsy >= 5) {
                      setAlertState('drowsy')
                      setShowAlert(true)
                      newCount.drowsy = 0 // reset
                    }
                    // DISTRACTION: 4 consecutive = distraction alert
                    else if (prediction === 'distraction' && newCount.distraction >= 4) {
                      setAlertState('distraction')
                      setShowAlert(true)
                      newCount.distraction = 0 // reset
                    }
                    return newCount
                  })
                } else {
                  // Normal - reset counters
                  setAlertCount({ drowsy: 0, distraction: 0, drunk: 0 })
                  if (alertState !== 'drunk') {
                    setAlertState('none')
                  }
                }
              }
            } catch {
              setAiConnected(false)
            }
          }
        }
        // Wait 500ms between frames (~2 FPS to keep it light)
        await new Promise(r => setTimeout(r, 500))
      }
    }

    captureAndPredict()
    return () => { running = false }
  }, [cameraActive]) // eslint-disable-line react-hooks/exhaustive-deps

  // Drunk auto-SOS: trigger after 5 seconds if not dismissed
  useEffect(() => {
    if (alertState === 'drunk' && showAlert) {
      const t = setTimeout(() => {
        if (onTriggerSOS) onTriggerSOS()
        nav('emergency-call')
      }, 5000)
      return () => clearTimeout(t)
    }
  }, [alertState, showAlert]) // eslint-disable-line react-hooks/exhaustive-deps

  // Play alert sound
  useEffect(() => {
    if (showAlert && alertState !== 'none') {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = alertState === 'drunk' ? 880 : alertState === 'drowsy' ? 520 : 660
        gain.gain.value = 0.3
        osc.start()
        setTimeout(() => { osc.stop(); ctx.close() }, alertState === 'drunk' ? 2000 : 1000)
      } catch { /* silent */ }
    }
  }, [showAlert, alertState])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const speedPercent = Math.min((speed / 120) * 100, 100)
  const speedLimitPercent = (80 / 120) * 100

  const handleStop = async () => {
    if (onEndTrip) await onEndTrip()
    nav('trip-summary')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-gray-900 relative overflow-hidden">

      {/* Camera Feed */}
      <div className="relative flex-1 min-h-[50%]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <p className="text-gray-400 text-sm">Starting camera...</p>
          </div>
        )}

        {/* Face Detection Box */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-44 h-44 relative"
          >
            {/* Corner brackets - color changes based on detection */}
            {(() => {
              const boxColor = alertState === 'drunk' ? 'border-red-500' : alertState === 'drowsy' ? 'border-amber-400' : alertState === 'distraction' ? 'border-orange-400' : 'border-green-400'
              return (
                <>
                  <div className={`absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] ${boxColor} rounded-tl-lg`} />
                  <div className={`absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] ${boxColor} rounded-tr-lg`} />
                  <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] ${boxColor} rounded-bl-lg`} />
                  <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] ${boxColor} rounded-br-lg`} />
                </>
              )
            })()}
          </motion.div>
        </div>

        {/* Scan line */}
        <motion.div
          animate={{ y: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent pointer-events-none"
          style={{ top: '30%' }}
        />

        {/* Top overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button onClick={() => nav('dashboard')} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-bold">REC</span>
            <span className="text-white text-xs font-mono">{formatTime(timer)}</span>
          </div>
          <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
            <Settings size={20} className="text-white" />
          </button>
        </div>

        {/* AI Confidence Badge */}
        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`w-1 rounded-full ${i <= Math.floor(aiData.confidence / 25) ? 'bg-green-400' : 'bg-gray-600'}`}
                style={{ height: 6 + i * 3 }} />
            ))}
          </div>
          <span className="text-white text-xs font-bold">AI: {aiData.confidence}%</span>
        </div>
      </div>

      {/* ALERT OVERLAY */}
      {showAlert && alertState !== 'none' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{
            background: alertState === 'drunk'
              ? 'rgba(220, 38, 38, 0.95)'
              : alertState === 'drowsy'
              ? 'rgba(245, 158, 11, 0.95)'
              : 'rgba(239, 68, 68, 0.9)',
          }}
        >
          <div className="flex flex-col items-center px-8 text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6"
            >
              <span className="text-5xl">
                {alertState === 'drunk' ? '🚨' : alertState === 'drowsy' ? '😴' : '📱'}
              </span>
            </motion.div>

            <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {alertState === 'drunk' ? 'IMPAIRED DRIVING!' : alertState === 'drowsy' ? 'DROWSINESS DETECTED!' : 'DISTRACTION DETECTED!'}
            </h2>

            <p className="text-white/80 text-sm mb-6">
              {alertState === 'drunk'
                ? 'Drunk driving detected! Emergency contacts will be notified in 5 seconds.'
                : alertState === 'drowsy'
                ? 'You appear tired. Please take a break for your safety.'
                : 'Please keep your eyes on the road!'}
            </p>

            {alertState === 'drunk' && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="h-1.5 bg-white/60 rounded-full mb-6 self-stretch"
              />
            )}

            <div className="w-full space-y-3">
              {alertState === 'drunk' ? (
                <>
                  <button
                    onClick={() => { setShowAlert(false); setAlertState('none'); alertTriggeredRef.current = false; setAlertCount({ drowsy: 0, distraction: 0, drunk: 0 }) }}
                    className="w-full py-4 bg-white text-red-600 rounded-2xl font-bold text-lg active:scale-95 transition-transform"
                  >
                    I&apos;m Not Impaired - Cancel
                  </button>
                  <button
                    onClick={() => { if (onTriggerSOS) onTriggerSOS(); nav('emergency-call') }}
                    className="w-full py-3.5 bg-white/20 border border-white/30 text-white rounded-2xl font-semibold text-sm"
                  >
                    Call Emergency Now
                  </button>
                </>
              ) : alertState === 'drowsy' ? (
                <>
                  <button
                    onClick={() => { setShowAlert(false); nav('rest-stop') }}
                    className="w-full py-4 bg-white text-amber-600 rounded-2xl font-bold text-base active:scale-95 transition-transform"
                  >
                    Find Rest Stop
                  </button>
                  <button
                    onClick={() => { setShowAlert(false); setAlertState('none') }}
                    className="w-full py-3.5 bg-white/20 border border-white/30 text-white rounded-2xl font-semibold text-sm"
                  >
                    I&apos;m Okay - Continue
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setShowAlert(false); setAlertState('none') }}
                  className="w-full py-4 bg-white text-red-600 rounded-2xl font-bold text-base active:scale-95 transition-transform"
                >
                  I&apos;m Focused Now
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Panel */}
      <div className="bg-white rounded-t-3xl p-5 -mt-4 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">MOOD</p>
            <p className={`text-base font-bold ${aiData.mood === 'Tired' ? 'text-amber-500' : 'text-green-500'}`}>
              {aiData.mood} {aiData.moodEmoji}
            </p>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">ALERTNESS</p>
            <p className={`text-base font-bold ${aiData.alertness === 'Low' ? 'text-red-500' : aiData.alertness === 'Medium' ? 'text-amber-500' : 'text-green-500'}`}>
              {aiData.alertness}
            </p>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">EYES</p>
            <p className={`text-base font-bold ${aiData.eyes === 'Closed' ? 'text-red-500' : 'text-green-500'}`}>
              {aiData.eyes}
            </p>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">SPEED</p>
            <p className="text-base font-bold text-gray-800">{speed} km/h</p>
          </div>
        </div>

        {/* Speed Bar */}
        <div className="mb-4">
          <div className="relative h-2.5 bg-gray-100 rounded-full overflow-visible">
            {/* Gradient bar */}
            <div
              className="h-full rounded-full"
              style={{
                width: `${speedPercent}%`,
                background: speed > 80
                  ? 'linear-gradient(90deg, #22C55E 0%, #EAB308 50%, #EF4444 100%)'
                  : 'linear-gradient(90deg, #22C55E 0%, #EAB308 100%)',
              }}
            />
            {/* Speed limit marker */}
            <div className="absolute top-[-4px] bottom-[-4px] w-[3px] bg-red-500 rounded-full"
              style={{ left: `${speedLimitPercent}%` }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-gray-400">0</span>
            <span className="text-[10px] text-red-500 font-semibold" style={{ marginLeft: `${speedLimitPercent - 10}%` }}>80 limit</span>
            <span className="text-[10px] text-gray-400">120</span>
          </div>
        </div>

        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* AI Status */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border mb-4 ${
          aiConnected ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${aiConnected ? 'bg-green-500' : 'bg-amber-500'}`} />
          <span className={`text-xs font-medium ${aiConnected ? 'text-green-700' : 'text-amber-700'}`}>
            {aiConnected ? 'AI Model Active · Processing Frames' : 'AI Server Offline · Run: python ai-server/server.py'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button onClick={handleStop} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <CircleStop size={18} /> Stop Trip
          </button>
          <button onClick={onTriggerSOS} className="w-14 h-12 bg-red-100 rounded-xl flex items-center justify-center active:scale-95 transition-transform border border-red-200">
            <Shield size={22} className="text-red-500" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
