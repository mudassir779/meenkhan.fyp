'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import {
  Mail, Lock, User, Eye, EyeOff, Phone, Plus, Edit3, Trash2,
  MapPin, Camera, AlertTriangle, Music, Smile, Mic, Video,
  MessageSquare, ChevronRight, Bell, Clock, Shield,
  PhoneCall, ArrowLeft, Save, SkipBack, SkipForward, Play, Pause,
  Volume2, Route, Star, Calendar, TrendingUp, CheckCircle2, KeyRound,
  Send, Zap, Coffee, Navigation, Share2, HelpCircle, Info,
  Globe, ChevronDown, Fuel, MapPinned, Car, CircleAlert, TriangleAlert,
  FileText, Languages, ExternalLink, MessageCircle, Bot, Loader2
} from 'lucide-react'
import { Logo, LogoIcon } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
import {
  OnboardingScreen, OTPScreen, TripSummaryScreen, AIChatScreen,
  SpeedAlertScreen, HighSpeedAlertScreen, RestStopScreen, CrashDetectionScreen,
  LiveLocationScreen, HelpScreen, AboutScreen, ChangePasswordScreen,
  LanguageScreen, AddContactScreen, MonitoringScreen
} from '@/components/NewScreens'
import { useAuth } from '@/hooks/useAuth'
import { useContacts } from '@/hooks/useContacts'
import { useTrip } from '@/hooks/useTrip'
import { useSettings } from '@/hooks/useSettings'
import { useApi } from '@/hooks/useApi'
import type { IEmergencyContact } from '@/types'

type Screen =
  | 'splash' | 'onboarding'
  | 'welcome' | 'signin' | 'signup' | 'forgot-password' | 'otp'
  | 'emergency-setup' | 'contact-list' | 'add-contact'
  | 'location-permission' | 'camera-permission'
  | 'dashboard' | 'alert' | 'emergency-call' | 'no-response'
  | 'music-player' | 'speed-alert' | 'high-speed-alert' | 'rest-stop' | 'crash-detection'
  | 'ai-chat' | 'trip-summary' | 'live-location'
  | 'settings' | 'profile' | 'notifications' | 'history'
  | 'help' | 'about' | 'change-password' | 'language'
  | 'monitoring'

export default function SaforaApp() {
  const { data: session, status: sessionStatus } = useSession()
  const auth = useAuth()
  const { contacts, fetchContacts, addContact, updateContact, deleteContact, loading: contactsLoading } = useContacts()
  const { activeTrip, trips, stats, fetchTrips, fetchStats, startTrip, endTrip, updateTrip, addEvent } = useTrip()
  const { settings, fetchSettings, updateSettings } = useSettings()
  const { get, put, post, loading: apiLoading } = useApi()

  const [currentScreen, setCurrentScreen] = useState<Screen>('splash')
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [toggles, setToggles] = useState({ alert: true, call: false })
  const [speed, setSpeed] = useState(0)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  // Auth form state
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [editingContact, setEditingContact] = useState<IEmergencyContact | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Capture install prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstallBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const result = await installPrompt.userChoice
      if (result.outcome === 'accepted') {
        setShowInstallBanner(false)
        setInstallPrompt(null)
      }
    }
  }

  // Load data when authenticated
  useEffect(() => {
    if (session?.user) {
      fetchContacts()
      fetchTrips()
      fetchStats()
      fetchSettings()
      loadProfile()
    }
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadProfile = async () => {
    const res = await get('/api/user/profile')
    if (res.success && res.data) {
      setUserProfile(res.data)
    }
  }

  // Auto-login: if session exists and we're on auth screens, go to dashboard
  useEffect(() => {
    if (sessionStatus === 'authenticated' && ['signin', 'signup', 'welcome', 'otp'].includes(currentScreen)) {
      setCurrentScreen('dashboard')
    }
  }, [sessionStatus, currentScreen])

  // Countdown for no-response screen
  useEffect(() => {
    if (currentScreen === 'no-response' && countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [currentScreen, countdown])

  // Animate speed on dashboard
  useEffect(() => {
    if (currentScreen === 'dashboard') {
      const t = setTimeout(() => setSpeed(65), 500)
      return () => clearTimeout(t)
    } else {
      setSpeed(0)
    }
  }, [currentScreen])

  // Update settings toggles from API
  useEffect(() => {
    if (settings) {
      setToggles({
        alert: settings.emergencyAlert,
        call: settings.emergencyCall,
      })
    }
  }, [settings])

  const nav = useCallback((screen: string) => {
    if (screen === 'no-response') setCountdown(10)
    setCurrentScreen(screen as Screen)
  }, [])

  // Auth handlers
  const handleSignUp = async (name: string, email: string, password: string) => {
    const result = await auth.signup(name, email, password)
    if (result) {
      setSignupEmail(email)
      setSignupPassword(password)
      nav('otp')
    }
  }

  const handleSignIn = async (email: string, password: string) => {
    const success = await auth.signin(email, password)
    if (success) {
      nav('dashboard')
    }
  }

  const handleVerifyOTP = async (otp: string) => {
    const success = await auth.verifyOTP(signupEmail, otp)
    if (success) {
      // Auto sign in after verification
      const signedIn = await auth.signin(signupEmail, signupPassword)
      if (!signedIn) {
        nav('signin')
      }
      return true
    }
    return false
  }

  const handleResendOTP = async () => {
    return await auth.resendOTP(signupEmail)
  }

  const handleForgotPassword = async (email: string) => {
    return await auth.forgotPassword(email)
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    setUserProfile(null)
    nav('welcome')
  }

  // Contact handlers
  const handleDeleteContact = async (id: string) => {
    if (confirm('Delete this emergency contact?')) {
      await deleteContact(id)
    }
  }

  const handleEditContact = (contact: IEmergencyContact) => {
    setEditingContact(contact)
    nav('add-contact')
  }

  const handleSaveContact = async (data: Partial<IEmergencyContact>) => {
    if (editingContact) {
      await updateContact(editingContact._id, data as IEmergencyContact)
    } else {
      await addContact(data)
    }
    setEditingContact(null)
    nav('contact-list')
  }

  // Profile handlers
  const handleSaveProfile = async (data: { name: string; phone: string; vehicleType: string }) => {
    const res = await put('/api/user/profile', data)
    if (res.success) {
      setUserProfile((prev: any) => ({ ...prev, ...data }))
      nav('settings')
    }
    return res
  }

  const handleUploadImage = async (base64: string) => {
    const res = await post('/api/user/profile/image', { image: base64 })
    if (res.success && (res.data as any)?.profileImage) {
      setUserProfile((prev: any) => ({ ...prev, profileImage: (res.data as any).profileImage }))
    }
    return res
  }

  // Settings handlers
  const handleToggleNotification = async (key: string) => {
    if (!settings) return
    const current = settings.notifications[key as keyof typeof settings.notifications]
    await updateSettings({ notifications: { [key]: !current } as any })
  }

  const handleToggleEmergency = async (type: 'emergencyAlert' | 'emergencyCall') => {
    if (!settings) return
    await updateSettings({ [type]: !settings[type] })
  }

  // Emergency handlers
  const handleTriggerSOS = async () => {
    await post('/api/emergency/trigger', {})
  }

  const handleCancelSOS = async () => {
    await post('/api/emergency/cancel', {})
    nav('dashboard')
  }

  // Trip handlers
  const handleStartTrip = async () => {
    await startTrip()
  }

  const handleEndTrip = async () => {
    if (activeTrip) {
      await endTrip(activeTrip._id)
      await fetchStats()
    }
  }

  return (
    <div className="fullscreen-app">
      {/* Install Banner */}
      {showInstallBanner && (
        <motion.div initial={{ y: -80 }} animate={{ y: 0 }} className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-safora-600 to-safora-800 px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <LogoIcon size={28} variant="light" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Install SAFORA App</p>
              <p className="text-white/70 text-xs">Add to home screen</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowInstallBanner(false)} className="text-white/60 text-xs px-2 py-1">Later</button>
            <button onClick={handleInstall} className="bg-white text-safora-700 text-xs font-bold px-4 py-1.5 rounded-full">Install</button>
          </div>
        </motion.div>
      )}
      <AnimatePresence mode="wait">
        {currentScreen === 'splash' && <SplashScreen key="splash" onDone={() => nav(sessionStatus === 'authenticated' ? 'dashboard' : 'onboarding')} />}
        {currentScreen === 'onboarding' && <OnboardingScreen key="ob" nav={nav} />}
        {currentScreen === 'welcome' && <WelcomeScreen key="welcome" nav={nav} />}
        {currentScreen === 'signin' && <SignInScreen key="signin" nav={nav} showPassword={showPassword} setShowPassword={setShowPassword} onSubmit={handleSignIn} error={auth.error} loading={auth.loading} />}
        {currentScreen === 'signup' && <SignUpScreen key="signup" nav={nav} showPassword={showPassword} setShowPassword={setShowPassword} onSubmit={handleSignUp} error={auth.error} loading={auth.loading} />}
        {currentScreen === 'forgot-password' && <ForgotPasswordScreen key="fp" nav={nav} onSubmit={handleForgotPassword} error={auth.error} loading={auth.loading} />}
        {currentScreen === 'otp' && <OTPScreen key="otp" nav={nav} email={signupEmail} onVerify={handleVerifyOTP} onResend={handleResendOTP} error={auth.error} loading={auth.loading} />}
        {currentScreen === 'emergency-setup' && <EmergencySetupScreen key="es" nav={nav} toggles={toggles} setToggles={setToggles} onToggle={handleToggleEmergency} />}
        {currentScreen === 'contact-list' && <ContactListScreen key="cl" nav={nav} contacts={contacts} onDelete={handleDeleteContact} onEdit={handleEditContact} loading={contactsLoading} />}
        {currentScreen === 'add-contact' && <AddContactScreen key="ac2" nav={nav} editingContact={editingContact} onSave={handleSaveContact} loading={contactsLoading} />}
        {currentScreen === 'location-permission' && <LocationPermScreen key="lp" nav={nav} />}
        {currentScreen === 'camera-permission' && <CameraPermScreen key="cp" nav={nav} />}
        {currentScreen === 'dashboard' && <DashboardScreen key="db" nav={nav} speed={speed} activeTrip={activeTrip} onStartTrip={handleStartTrip} onEndTrip={handleEndTrip} userProfile={userProfile} />}
        {currentScreen === 'alert' && <AlertScreen key="al" nav={nav} />}
        {currentScreen === 'emergency-call' && <EmergencyCallScreen key="ec" nav={nav} onTriggerSOS={handleTriggerSOS} contacts={contacts} />}
        {currentScreen === 'no-response' && <NoResponseScreen key="nr" nav={nav} countdown={countdown} onCancel={handleCancelSOS} onTriggerSOS={handleTriggerSOS} />}
        {currentScreen === 'music-player' && <MusicPlayerScreen key="mp" nav={nav} />}
        {currentScreen === 'speed-alert' && <SpeedAlertScreen key="sa" nav={nav} />}
        {currentScreen === 'high-speed-alert' && <HighSpeedAlertScreen key="hsa" nav={nav} />}
        {currentScreen === 'rest-stop' && <RestStopScreen key="rs" nav={nav} />}
        {currentScreen === 'crash-detection' && <CrashDetectionScreen key="cd" nav={nav} onTriggerSOS={handleTriggerSOS} />}
        {currentScreen === 'ai-chat' && <AIChatScreen key="ac" nav={nav} />}
        {currentScreen === 'trip-summary' && <TripSummaryScreen key="ts" nav={nav} trips={trips} />}
        {currentScreen === 'live-location' && <LiveLocationScreen key="ll" nav={nav} contacts={contacts} />}
        {currentScreen === 'settings' && <SettingsScreen key="st" nav={nav} userProfile={userProfile} onLogout={handleLogout} />}
        {currentScreen === 'profile' && <ProfileScreen key="pr" nav={nav} userProfile={userProfile} onSave={handleSaveProfile} onUploadImage={handleUploadImage} loading={apiLoading} />}
        {currentScreen === 'notifications' && <NotificationsScreen key="nt" nav={nav} settings={settings} onToggle={handleToggleNotification} />}
        {currentScreen === 'history' && <HistoryScreen key="hs" nav={nav} trips={trips} stats={stats} />}
        {currentScreen === 'help' && <HelpScreen key="hp" nav={nav} />}
        {currentScreen === 'about' && <AboutScreen key="ab" nav={nav} />}
        {currentScreen === 'change-password' && <ChangePasswordScreen key="cp2" nav={nav} />}
        {currentScreen === 'language' && <LanguageScreen key="ln" nav={nav} settings={settings} onSave={updateSettings} />}
        {currentScreen === 'monitoring' && <MonitoringScreen key="mon" nav={nav} activeTrip={activeTrip} onEndTrip={handleEndTrip} onTriggerSOS={handleTriggerSOS} />}
      </AnimatePresence>
    </div>
  )
}

// ─── helpers ───
type Nav = (s: string) => void
const pageAnim = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25 },
  style: { touchAction: 'pan-y' } as React.CSSProperties,
}

// ─── Social buttons (shared) ───
function SocialButtons() {
  return (
    <div className="flex gap-4">
      <button className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow border border-gray-100">
        <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
      </button>
      <button className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow border border-gray-100">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1DA1F2"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
      </button>
      <button className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow border border-gray-100">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </button>
    </div>
  )
}

/* ============================================================
   SPLASH — one continuous cinematic animation (video-like)
============================================================ */
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 5200),
      setTimeout(() => onDone(), 6200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #B0D9E3 0%, #83C5D3 25%, #4DA8BB 50%, #1A8FA6 75%, #0A3D4C 100%)' }}
    >
      <motion.div className="absolute rounded-full border-[2.5px] border-white/[0.08]" initial={{ width: 0, height: 0, top: '20%', left: '-10%', opacity: 0 }} animate={{ width: phase >= 0 ? 500 : 0, height: phase >= 0 ? 500 : 0, top: phase >= 0 ? '-15%' : '20%', left: phase >= 0 ? '-30%' : '-10%', opacity: phase >= 0 ? 1 : 0 }} transition={{ duration: 2, ease: 'easeOut' }} />
      <motion.div className="absolute rounded-full border-[2px] border-white/[0.12]" initial={{ width: 0, height: 0, top: '25%', left: '0%', opacity: 0 }} animate={{ width: phase >= 0 ? 380 : 0, height: phase >= 0 ? 380 : 0, top: phase >= 0 ? '-5%' : '25%', left: phase >= 0 ? '-20%' : '0%', opacity: phase >= 0 ? 1 : 0 }} transition={{ duration: 2, ease: 'easeOut', delay: 0.3 }} />
      <motion.div className="absolute rounded-full border-[2.5px] border-white/[0.08]" initial={{ width: 0, height: 0, bottom: '10%', right: '-10%', opacity: 0 }} animate={{ width: phase >= 1 ? 450 : 0, height: phase >= 1 ? 450 : 0, bottom: phase >= 1 ? '-20%' : '10%', right: phase >= 1 ? '-25%' : '-10%', opacity: phase >= 1 ? 1 : 0 }} transition={{ duration: 2, ease: 'easeOut' }} />
      <motion.div className="absolute rounded-full border-[2px] border-white/[0.12]" initial={{ width: 0, height: 0, bottom: '15%', right: '0%', opacity: 0 }} animate={{ width: phase >= 1 ? 320 : 0, height: phase >= 1 ? 320 : 0, bottom: phase >= 1 ? '-10%' : '15%', right: phase >= 1 ? '-15%' : '0%', opacity: phase >= 1 ? 1 : 0 }} transition={{ duration: 2, ease: 'easeOut', delay: 0.2 }} />
      <motion.div className="absolute rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)' }} initial={{ width: 0, height: 0, opacity: 0 }} animate={{ width: phase >= 1 ? 300 : 0, height: phase >= 1 ? 300 : 0, opacity: phase >= 1 ? 1 : 0 }} transition={{ duration: 1.5, ease: 'easeOut' }} />
      <div className="flex flex-col items-center z-10">
        <motion.div initial={{ y: 80, opacity: 0, scale: 0.5 }} animate={{ y: phase >= 2 ? 0 : 80, opacity: phase >= 1 ? 1 : 0, scale: phase >= 2 ? 1 : phase >= 1 ? 0.7 : 0.5 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
          <motion.div animate={{ y: phase >= 2 ? [0, -8, 0] : 0 }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
            <LogoIcon size={phase >= 2 ? 140 : 100} variant="light" />
          </motion.div>
        </motion.div>
        <motion.div className="rounded-full bg-black/15 blur-md mt-2" initial={{ width: 0, height: 0, opacity: 0 }} animate={{ width: phase >= 2 ? 80 : 0, height: phase >= 2 ? 12 : 0, opacity: phase >= 2 ? 1 : 0 }} transition={{ duration: 1, ease: 'easeOut' }} />
        <motion.div className="mt-8" initial={{ y: 30, opacity: 0 }} animate={{ y: phase >= 3 ? 0 : 30, opacity: phase >= 3 ? 1 : 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <Logo size="lg" variant="light" />
        </motion.div>
        <motion.p className="text-white/60 text-sm mt-3 tracking-wide" initial={{ y: 20, opacity: 0 }} animate={{ y: phase >= 3 ? 0 : 20, opacity: phase >= 3 ? 1 : 0 }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}>
          Your safety on the road
        </motion.p>
        <motion.p className="text-white/50 text-lg mt-5 tracking-widest font-medium" initial={{ opacity: 0 }} animate={{ opacity: phase >= 3 ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
          Made by Aiman
        </motion.p>
      </div>
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-40">
        <div className="h-1 rounded-full bg-white/15 overflow-hidden">
          <motion.div className="h-full rounded-full bg-white/80" initial={{ width: '0%' }} animate={{ width: phase >= 4 ? '100%' : phase >= 3 ? '80%' : phase >= 2 ? '55%' : phase >= 1 ? '30%' : '5%' }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
        </div>
      </div>
      <motion.div className="absolute inset-0 bg-white z-20 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: phase >= 4 ? 1 : 0 }} transition={{ duration: 0.9, ease: 'easeIn' }} />
    </motion.div>
  )
}

/* ============================================================
   WELCOME
============================================================ */
function WelcomeScreen({ nav }: { nav: Nav }) {
  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-10">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-4">
          <Logo size="md" variant="dark" />
        </motion.div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring' }} className="float-animation mb-8">
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-safora-100 to-safora-200 flex items-center justify-center shadow-lg shadow-safora-200/50">
            <LogoIcon size={100} variant="dark" />
          </div>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-safora-800 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Welcome</h1>
          <p className="text-safora-500 text-base">Your safety on the road<br />starts here</p>
        </motion.div>
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="w-full space-y-3">
          <button className="btn-primary" onClick={() => nav('signin')}>Sign In</button>
          <button className="btn-secondary" onClick={() => nav('signup')}>Sign Up</button>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ============================================================
   SIGN IN — wired to real auth
============================================================ */
function SignInScreen({ nav, showPassword, setShowPassword, onSubmit, error, loading }: { nav: Nav; showPassword: boolean; setShowPassword: (v: boolean) => void; onSubmit: (email: string, password: string) => void; error: string; loading: boolean }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col">
      <div className="flex-1 flex flex-col px-8 pt-6">
        <button onClick={() => nav('welcome')} className="flex items-center gap-1 text-safora-500 text-sm mb-4 hover:text-safora-700 transition-colors w-fit">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex flex-col items-center mb-6">
          <Logo size="sm" variant="dark" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-safora-100 to-safora-200 flex items-center justify-center mt-4 shadow-md">
            <LogoIcon size={56} variant="dark" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-safora-800 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Sign In</h2>

        {error && <p className="text-emergency text-xs font-medium mb-3 text-center bg-red-50 py-2 rounded-lg">{error}</p>}

        <div className="space-y-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
            <input type="email" placeholder="example@gmail.com" className="safora-input" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" className="safora-input" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSubmit(email, password)} />
            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-safora-400 hover:text-safora-600 transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button className="btn-primary mb-3 flex items-center justify-center gap-2" onClick={() => onSubmit(email, password)} disabled={loading}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : null} Sign In
        </button>

        <button onClick={() => nav('forgot-password')} className="text-safora-500 text-xs font-medium hover:text-safora-700 hover:underline transition-colors mb-5 text-center">
          Forgot Password?
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-16 bg-safora-200" /><span className="text-safora-400 text-sm">or continue with</span><div className="h-px w-16 bg-safora-200" />
          </div>
          <SocialButtons />
        </div>

        <div className="mt-auto pb-10 text-center">
          <p className="text-safora-400 text-sm">Don&apos;t have an account?{' '}<button onClick={() => nav('signup')} className="text-safora-600 font-semibold hover:underline">Sign Up</button></p>
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================================
   SIGN UP — wired to real auth
============================================================ */
function SignUpScreen({ nav, showPassword, setShowPassword, onSubmit, error, loading }: { nav: Nav; showPassword: boolean; setShowPassword: (v: boolean) => void; onSubmit: (name: string, email: string, password: string) => void; error: string; loading: boolean }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col">
      <div className="flex-1 flex flex-col px-8 pt-4">
        <button onClick={() => nav('welcome')} className="flex items-center gap-1 text-safora-500 text-sm mb-4 hover:text-safora-700 transition-colors w-fit">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex flex-col items-center mb-8">
          <Logo size="sm" variant="dark" />
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-safora-100 to-safora-200 flex items-center justify-center mt-4 shadow-md">
            <LogoIcon size={64} variant="dark" />
          </div>
        </div>

        {error && <p className="text-emergency text-xs font-medium mb-3 text-center bg-red-50 py-2 rounded-lg">{error}</p>}

        <div className="space-y-4 mb-6">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
            <input type="text" placeholder="Full Name" className="safora-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
            <input type="email" placeholder="example@gmail.com" className="safora-input" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" className="safora-input" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-safora-400 hover:text-safora-600 transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button className="btn-primary mb-6 flex items-center justify-center gap-2" onClick={() => onSubmit(name, email, password)} disabled={loading}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : null} Sign Up
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-16 bg-safora-200" /><span className="text-safora-400 text-sm">or continue with</span><div className="h-px w-16 bg-safora-200" />
          </div>
          <SocialButtons />
        </div>

        <div className="mt-auto pb-10 text-center">
          <p className="text-safora-400 text-sm">Already have an account?{' '}<button onClick={() => nav('signin')} className="text-safora-600 font-semibold hover:underline">Sign In</button></p>
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================================
   LOCATION PERMISSION
============================================================ */
function LocationPermScreen({ nav }: { nav: Nav }) {
  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col items-center justify-center px-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-28 h-28 rounded-3xl bg-gradient-to-br from-safora-500 to-safora-700 flex items-center justify-center mb-8 shadow-xl shadow-safora-300/50">
        <MapPin size={52} className="text-white" strokeWidth={1.5} />
      </motion.div>
      <h2 className="text-2xl font-bold text-safora-800 mb-3 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>Allow Location Access</h2>
      <p className="text-safora-500 text-center text-sm mb-10 leading-relaxed">For safe driving and emergency<br />response tracking</p>
      <div className="w-full space-y-3">
        <button className="btn-primary" onClick={() => nav('camera-permission')}>Allow</button>
        <button className="btn-danger" onClick={() => nav('camera-permission')}>Deny</button>
      </div>
    </motion.div>
  )
}

/* ============================================================
   CAMERA PERMISSION
============================================================ */
function CameraPermScreen({ nav }: { nav: Nav }) {
  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col items-center justify-center px-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-28 h-28 rounded-3xl bg-gradient-to-br from-safora-500 to-safora-700 flex items-center justify-center mb-8 shadow-xl shadow-safora-300/50">
        <Camera size={52} className="text-white" strokeWidth={1.5} />
      </motion.div>
      <h2 className="text-2xl font-bold text-safora-800 mb-3 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>Allow Camera Access</h2>
      <p className="text-safora-500 text-center text-sm mb-10 leading-relaxed">For Live Mood and movement<br />Detection And alerts</p>
      <div className="w-full space-y-3">
        <button className="btn-primary" onClick={() => nav('dashboard')}>Allow</button>
        <button className="btn-danger" onClick={() => nav('dashboard')}>Deny</button>
      </div>
    </motion.div>
  )
}

/* ============================================================
   EMERGENCY SETUP — wired to settings API
============================================================ */
function EmergencySetupScreen({ nav, toggles, setToggles, onToggle }: { nav: Nav; toggles: { alert: boolean; call: boolean }; setToggles: (v: { alert: boolean; call: boolean }) => void; onToggle: (type: 'emergencyAlert' | 'emergencyCall') => void }) {
  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col relative">
      <div className="flex-1 flex flex-col px-6 pt-4 pb-24 overflow-y-auto">
        <div className="flex items-center gap-3 mb-1">
          <Logo size="sm" variant="dark" />
        </div>
        <p className="text-safora-400 text-xs mb-5">Your co-pilot for peace of mind</p>
        <div className="flex flex-col items-center mb-5">
          <div className="w-20 h-20 rounded-full bg-safora-100 flex items-center justify-center border-2 border-safora-200">
            <User size={36} className="text-safora-400" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-safora-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Emergency Contact</h2>
        <div className="flex gap-2 mb-4">
          <div className="flex items-center gap-1 px-3 py-3 bg-white rounded-xl border border-safora-200 text-sm text-safora-600">+92</div>
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-safora-400" size={16} />
            <input type="tel" placeholder="Enter phone number" className="safora-input !pl-10" />
          </div>
        </div>
        <button className="btn-primary mb-3" onClick={() => nav('contact-list')}>Save Contact</button>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-safora-100 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-safora-600" />
              <span className="text-sm font-medium text-safora-800">Emergency Alert</span>
            </div>
            <button className={`toggle-track ${toggles.alert ? 'active' : ''}`} onClick={() => { setToggles({ ...toggles, alert: !toggles.alert }); onToggle('emergencyAlert') }}>
              <div className="toggle-thumb" />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-safora-100 shadow-sm">
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-safora-600" />
              <span className="text-sm font-medium text-safora-800">Emergency Call</span>
            </div>
            <button className={`toggle-track ${toggles.call ? 'active' : ''}`} onClick={() => { setToggles({ ...toggles, call: !toggles.call }); onToggle('emergencyCall') }}>
              <div className="toggle-thumb" />
            </button>
          </div>
        </div>
        <button className="btn-primary mt-4" onClick={() => nav('emergency-call')}>Emergency Call</button>
      </div>
      <BottomNav active="emergency-setup" onNavigate={(s) => nav(s as Screen)} />
    </motion.div>
  )
}

/* ============================================================
   CONTACT LIST — wired to real contacts API
============================================================ */
function ContactListScreen({ nav, contacts, onDelete, onEdit, loading }: { nav: Nav; contacts: IEmergencyContact[]; onDelete: (id: string) => void; onEdit: (c: IEmergencyContact) => void; loading: boolean }) {
  const avatarColors = ['bg-amber-100', 'bg-pink-100', 'bg-purple-100', 'bg-rose-100', 'bg-blue-100', 'bg-green-100', 'bg-teal-100', 'bg-orange-100']

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col relative">
      <div className="flex-1 flex flex-col px-6 pt-4 pb-24 overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <Logo size="sm" variant="dark" />
          <button onClick={() => nav('emergency-setup')} className="text-safora-500 text-xs hover:text-safora-700 flex items-center gap-1">
            <ArrowLeft size={14} /> Back
          </button>
        </div>
        <p className="text-safora-400 text-xs mb-5">Your co-pilot for peace of mind</p>
        <h2 className="text-lg font-bold text-safora-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Emergency Contact</h2>

        {loading && contacts.length === 0 ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-safora-400" size={24} /></div>
        ) : contacts.length === 0 ? (
          <p className="text-safora-400 text-sm text-center py-8">No emergency contacts yet</p>
        ) : (
          <div className="space-y-3">
            {contacts.map((c, i) => (
              <motion.div key={c._id} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-safora-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-xl`}>{c.avatar || '👤'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-safora-800">{c.name}</p>
                  <p className="text-xs text-safora-400 truncate">{c.phone}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(c)} className="w-8 h-8 rounded-lg bg-safora-50 flex items-center justify-center text-safora-600 hover:bg-safora-100 transition-colors"><Edit3 size={14} /></button>
                  <button onClick={() => onDelete(c._id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-emergency hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <button onClick={() => nav('add-contact')} className="mt-6 flex items-center justify-center gap-2 p-3.5 bg-safora-50 rounded-xl border-2 border-dashed border-safora-200 text-safora-600 font-medium text-sm hover:bg-safora-100 transition-colors">
          <Plus size={18} /> Add Emergency Contact
        </button>
      </div>
      <BottomNav active="contact-list" onNavigate={(s) => nav(s as Screen)} />
    </motion.div>
  )
}

/* ============================================================
   DASHBOARD — wired to trip API
============================================================ */
function DashboardScreen({ nav, speed, activeTrip, onStartTrip, onEndTrip, userProfile }: { nav: Nav; speed: number; activeTrip: any; onStartTrip: () => void; onEndTrip: () => void; userProfile: any }) {
  const maxSpeed = 180
  const percentage = speed / maxSpeed
  const circumference = 2 * Math.PI * 80
  const dashOffset = circumference * (1 - percentage * 0.75)

  const getSpeedColor = () => {
    if (speed < 40) return '#2EC4B6'
    if (speed < 80) return '#F4A261'
    return '#E63946'
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 flex flex-col overflow-hidden relative"
      style={{ background: 'linear-gradient(180deg, #1A6D7C 0%, #2A8597 40%, #3A9DB4 80%, #4AAFC6 100%)' }}>
      <div className="flex-1 flex flex-col px-6 pt-2 pb-24 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Dashboard</h1>
          {activeTrip && (
            <button onClick={() => nav('monitoring')} className="px-4 py-1.5 rounded-full text-xs font-bold bg-green-500/80 text-white animate-pulse">
              Live
            </button>
          )}
        </div>

        {/* Speedometer */}
        <div className="flex justify-center mb-5">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-[135deg]">
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={circumference * 0.25} strokeLinecap="round" />
              <circle cx="100" cy="100" r="80" fill="none" stroke={getSpeedColor()} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" className="speedometer-ring" style={{ filter: `drop-shadow(0 0 8px ${getSpeedColor()}40)` }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{speed}</span>
              <span className="text-white/60 text-sm font-medium">km/h</span>
            </div>
          </div>
        </div>

        {/* Status chips */}
        <div className="flex justify-center gap-2 mb-5">
          <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400" /> Focus: High
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400" /> Mood: OK
          </div>
          {activeTrip && (
            <div className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-300 text-xs font-medium flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Recording
            </div>
          )}
        </div>

        {/* AI Assistant */}
        <button onClick={() => nav('ai-chat')} className="w-full bg-white/10 backdrop-blur-xl rounded-2xl p-4 mb-4 border border-white/10 text-left hover:bg-white/15 active:scale-[0.98] transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
              <MessageSquare size={18} className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">AI Assistant</p>
              <p className="text-white/50 text-xs">Alex</p>
            </div>
            <ChevronRight size={16} className="text-white/30" />
          </div>
          <p className="text-white/70 text-xs italic">&quot;You&apos;re doing great! Stay focused on the road.&quot;</p>
        </button>

        {/* Quick Actions Row 1 */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          <button onClick={() => nav('alert')} className="bg-amber-500/20 rounded-2xl p-3 flex flex-col items-center gap-2 hover:scale-105 active:scale-95 transition-transform border border-white/5">
            <AlertTriangle size={20} className="text-amber-400" />
            <span className="text-white/80 text-[10px] font-medium">Alert</span>
          </button>
          <button onClick={() => nav('emergency-call')} className="bg-red-500/20 rounded-2xl p-3 flex flex-col items-center gap-2 hover:scale-105 active:scale-95 transition-transform border border-white/5">
            <Shield size={20} className="text-red-400" />
            <span className="text-white/80 text-[10px] font-medium">SOS</span>
          </button>
          <button onClick={() => nav('live-location')} className="bg-blue-500/20 rounded-2xl p-3 flex flex-col items-center gap-2 hover:scale-105 active:scale-95 transition-transform border border-white/5">
            <Share2 size={20} className="text-blue-400" />
            <span className="text-white/80 text-[10px] font-medium">Share</span>
          </button>
          <button onClick={() => nav('trip-summary')} className="bg-green-500/20 rounded-2xl p-3 flex flex-col items-center gap-2 hover:scale-105 active:scale-95 transition-transform border border-white/5">
            <Route size={20} className="text-green-400" />
            <span className="text-white/80 text-[10px] font-medium">Trip</span>
          </button>
        </div>
        {/* Quick Actions Row 2 */}
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => nav('speed-alert')} className="bg-orange-500/20 rounded-2xl p-3 flex flex-col items-center gap-2 hover:scale-105 active:scale-95 transition-transform border border-white/5">
            <Zap size={20} className="text-orange-400" />
            <span className="text-white/80 text-[10px] font-medium">Speed</span>
          </button>
          <button onClick={() => nav('rest-stop')} className="bg-teal-500/20 rounded-2xl p-3 flex flex-col items-center gap-2 hover:scale-105 active:scale-95 transition-transform border border-white/5">
            <Coffee size={20} className="text-teal-400" />
            <span className="text-white/80 text-[10px] font-medium">Rest</span>
          </button>
          <button onClick={() => nav('music-player')} className="bg-purple-500/20 rounded-2xl p-3 flex flex-col items-center gap-2 hover:scale-105 active:scale-95 transition-transform border border-white/5">
            <Music size={20} className="text-purple-400" />
            <span className="text-white/80 text-[10px] font-medium">Music</span>
          </button>
          <button onClick={() => nav('emergency-call')} className="bg-pink-500/20 rounded-2xl p-3 flex flex-col items-center gap-2 hover:scale-105 active:scale-95 transition-transform border border-white/5">
            <Phone size={20} className="text-pink-400" />
            <span className="text-white/80 text-[10px] font-medium">Call</span>
          </button>
        </div>

        {/* Start Monitoring Button */}
        <motion.button
          onClick={activeTrip ? () => nav('monitoring') : async () => { await onStartTrip(); nav('monitoring') }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="mt-5 w-full relative overflow-hidden rounded-2xl shadow-lg active:scale-[0.97] transition-transform"
        >
          <div className={`w-full py-5 px-6 flex items-center justify-between ${
            activeTrip
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-accent-dark to-accent'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                activeTrip ? 'bg-white/20' : 'bg-white/20'
              }`}>
                {activeTrip ? (
                  <Camera size={28} className="text-white" />
                ) : (
                  <Shield size={28} className="text-white" />
                )}
              </div>
              <div className="text-left">
                <p className="text-white text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {activeTrip ? 'Open Monitoring' : 'Start Monitoring'}
                </p>
                <p className="text-white/70 text-xs">
                  {activeTrip ? 'Trip active · Camera recording' : 'AI camera · Drowsiness detection'}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              {activeTrip ? (
                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
              ) : (
                <ChevronRight size={24} className="text-white/60" />
              )}
            </div>
          </div>
          {/* Shimmer effect */}
          {!activeTrip && (
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
            />
          )}
        </motion.button>
      </div>
      <BottomNav active="dashboard" onNavigate={(s) => nav(s as Screen)} />
    </motion.div>
  )
}

/* ============================================================
   ALERT
============================================================ */
function AlertScreen({ nav }: { nav: Nav }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="flex-1 bg-safora-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center px-6 pt-4">
        <button onClick={() => nav('dashboard')} className="self-start flex items-center gap-1 text-safora-500 text-sm mb-4 hover:text-safora-700 transition-colors">
          <ArrowLeft size={16} /> Dashboard
        </button>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="px-5 py-2.5 bg-emergency/10 rounded-full mb-6 border border-emergency/20">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-emergency" />
            <span className="text-emergency font-bold text-sm">Urgent Alert</span>
          </div>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="w-24 h-24 rounded-full bg-gradient-to-br from-safora-200 to-safora-300 flex items-center justify-center mb-6 shadow-lg relative">
          <LogoIcon size={70} variant="dark" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
            <span className="text-lg">😴</span>
          </div>
        </motion.div>
        <h2 className="text-xl font-bold text-safora-800 mb-2 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>You Look A Bit Tired</h2>
        <p className="text-safora-500 text-sm text-center mb-6">shall I play some upbeat<br />music?</p>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-safora-100 flex items-center justify-center"><Smile size={20} className="text-safora-600" /></div>
          <div><p className="text-xs text-safora-400">Mood detected &bull; Drowsy</p></div>
        </div>
        <div className="w-full space-y-3 mt-auto pb-12">
          <button className="btn-primary flex items-center justify-center gap-2" onClick={() => nav('music-player')}>
            <Music size={18} /> Play Music
          </button>
          <button className="btn-secondary" onClick={() => nav('dashboard')}>I&apos;m Ok</button>
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================================
   EMERGENCY CALL — wired to emergency API
============================================================ */
function EmergencyCallScreen({ nav, onTriggerSOS, contacts }: { nav: Nav; onTriggerSOS: () => void; contacts: IEmergencyContact[] }) {
  useEffect(() => {
    onTriggerSOS()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const primaryContact = contacts[0]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center relative"
      style={{ background: 'linear-gradient(180deg, #0A3D4C 0%, #0F5567 50%, #1A8FA6 100%)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <p className="text-emergency-light font-semibold text-sm mb-2">Emergency Call</p>
        <h2 className="text-white text-xl font-bold mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>Calling Emergency Contact</h2>
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-safora-300 to-safora-400 flex items-center justify-center relative z-10 shadow-xl">
            <LogoIcon size={90} variant="light" />
          </div>
          <div className="absolute inset-[-16px] rounded-full border-2 border-white/10 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-[-32px] rounded-full border border-white/5 animate-ping" style={{ animationDuration: '2.5s' }} />
        </div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/70 text-sm">Connecting...</span>
        </div>
        <h3 className="text-white text-lg font-bold mb-1">{primaryContact?.name || 'Emergency Contact'}</h3>
        <p className="text-white/50 text-sm mb-10">{primaryContact?.phone || 'No contacts set up'}</p>
        <div className="flex gap-6">
          {[
            { icon: Mic, label: 'Mute' },
            { icon: PhoneCall, label: 'Speaker' },
            { icon: Video, label: 'Video' },
            { icon: MessageSquare, label: 'Message' },
          ].map((item) => (
            <button key={item.label} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 active:bg-white/30 transition-colors border border-white/10">
                <item.icon size={20} className="text-white" />
              </div>
              <span className="text-white/50 text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="pb-12">
        <button onClick={() => nav('no-response')} className="w-16 h-16 rounded-full bg-emergency flex items-center justify-center shadow-lg shadow-emergency/30 hover:scale-110 active:scale-95 transition-transform">
          <Phone size={24} className="text-white rotate-[135deg]" />
        </button>
        <p className="text-white/40 text-[10px] mt-2 text-center">End Call</p>
      </div>
    </motion.div>
  )
}

/* ============================================================
   NO RESPONSE DETECTED — wired to emergency API
============================================================ */
function NoResponseScreen({ nav, countdown, onCancel, onTriggerSOS }: { nav: Nav; countdown: number; onCancel: () => void; onTriggerSOS: () => void }) {
  useEffect(() => {
    if (countdown === 0) {
      onTriggerSOS()
    }
  }, [countdown]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center"
      style={{ background: 'linear-gradient(180deg, #0A3D4C 0%, #0F5567 50%, #1A8FA6 100%)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emergency animate-pulse" />
          <span className="text-emergency-light font-semibold text-sm">Live Alert</span>
        </div>
        <h2 className="text-white text-xl font-bold mb-8 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>No Response Detected</h2>
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-safora-300 to-safora-400 flex items-center justify-center mb-8 shadow-xl">
          <LogoIcon size={80} variant="light" />
        </div>
        <div className="relative w-24 h-24 mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E63946" strokeWidth="6" strokeDasharray={264} strokeDashoffset={264 * (1 - countdown / 10)} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-white animate-countdown">{countdown}</span>
          </div>
        </div>
        <p className="text-white/60 text-sm mb-2">Seconds Remaining</p>
        <p className="text-white/50 text-xs mb-10 text-center">Emergency contacts will be notified...</p>
        <button onClick={onCancel} className="px-10 py-3.5 bg-gradient-to-r from-accent-dark to-accent text-white rounded-2xl font-semibold shadow-lg shadow-accent/30 hover:scale-105 active:scale-95 transition-transform">
          I&apos;M Awake
        </button>
        <p className="text-white/40 text-xs mt-4 text-center">Tap button to cancel emergency dispatch</p>
        <button onClick={() => nav('dashboard')} className="mt-6 text-white/50 text-xs underline hover:text-white/80 transition-colors">
          Back to Dashboard
        </button>
      </div>
    </motion.div>
  )
}

/* ============================================================
   SETTINGS — wired to real profile + logout
============================================================ */
function SettingsScreen({ nav, userProfile, onLogout }: { nav: Nav; userProfile: any; onLogout: () => void }) {
  const menuItems = [
    { icon: User, label: 'Profile Setting', target: 'profile' as Screen },
    { icon: Phone, label: 'Emergency Contact', target: 'contact-list' as Screen },
    { icon: Bell, label: 'Notification', target: 'notifications' as Screen },
    { icon: Lock, label: 'Change Password', target: 'change-password' as Screen },
    { icon: MapPin, label: 'Location', target: 'location-permission' as Screen },
    { icon: Clock, label: 'History', target: 'history' as Screen },
    { icon: Globe, label: 'Language', target: 'language' as Screen },
    { icon: HelpCircle, label: 'Help & Support', target: 'help' as Screen },
    { icon: Info, label: 'About App', target: 'about' as Screen },
  ]

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col relative">
      <div className="flex-1 flex flex-col px-6 pt-4 pb-24 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-safora-400 animate-pulse" />
            <span className="text-safora-400 text-xs font-medium">Live Alert</span>
          </div>
          <button onClick={() => { if (confirm('Are you sure you want to logout?')) onLogout() }} className="px-4 py-1.5 bg-emergency/10 text-emergency text-xs font-semibold rounded-full border border-emergency/20 hover:bg-emergency/20 active:bg-emergency/30 transition-colors">
            Logout
          </button>
        </div>
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-safora-200 to-safora-300 flex items-center justify-center mb-3 shadow-lg border-4 border-white overflow-hidden">
            {userProfile?.profileImage ? (
              <img src={userProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <LogoIcon size={64} variant="dark" />
            )}
          </div>
          <h3 className="text-lg font-bold text-safora-800" style={{ fontFamily: 'Poppins, sans-serif' }}>{userProfile?.name || 'User'}</h3>
          <p className="text-safora-400 text-xs">{userProfile?.email || ''}</p>
        </div>
        <div className="space-y-2.5">
          {menuItems.map((item, i) => (
            <motion.button key={item.label} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}
              onClick={() => nav(item.target)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-safora-100 shadow-sm hover:shadow-md hover:border-safora-200 active:scale-[0.98] transition-all">
              <div className="w-10 h-10 rounded-xl bg-safora-50 flex items-center justify-center">
                <item.icon size={18} className="text-safora-600" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-safora-800">{item.label}</span>
              <ChevronRight size={18} className="text-safora-300" />
            </motion.button>
          ))}
        </div>
      </div>
      <BottomNav active="settings" onNavigate={(s) => nav(s as Screen)} />
    </motion.div>
  )
}

/* ============================================================
   FORGOT PASSWORD — wired to real API
============================================================ */
function ForgotPasswordScreen({ nav, onSubmit, error, loading }: { nav: Nav; onSubmit: (email: string) => Promise<boolean>; error: string; loading: boolean }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    const success = await onSubmit(email)
    if (success) setSent(true)
  }

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col">
      <div className="flex-1 flex flex-col px-8 pt-6">
        <button onClick={() => nav('signin')} className="flex items-center gap-1 text-safora-500 text-sm mb-6 hover:text-safora-700 transition-colors w-fit">
          <ArrowLeft size={16} /> Back to Sign In
        </button>
        <div className="flex justify-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-safora-500 to-safora-700 flex items-center justify-center shadow-xl">
            <KeyRound size={36} className="text-white" />
          </motion.div>
        </div>
        <h2 className="text-2xl font-bold text-safora-800 mb-2 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>Forgot Password?</h2>
        <p className="text-safora-500 text-sm text-center mb-8">Enter your email and we&apos;ll send you<br />a reset link</p>

        {error && <p className="text-emergency text-xs font-medium mb-3 text-center">{error}</p>}

        {!sent ? (
          <>
            <div className="relative mb-6">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
              <input type="email" placeholder="example@gmail.com" className="safora-input" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button className="btn-primary flex items-center justify-center gap-2" onClick={handleSend} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : null} Send Reset Link
            </button>
          </>
        ) : (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <CheckCircle2 size={36} className="text-accent" />
            </div>
            <h3 className="text-lg font-bold text-safora-800 mb-2">Email Sent!</h3>
            <p className="text-safora-500 text-sm text-center mb-8">Check your inbox for the<br />password reset link</p>
            <button className="btn-primary" onClick={() => nav('signin')}>Back to Sign In</button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

/* ============================================================
   PROFILE EDIT — wired to real profile API
============================================================ */
function ProfileScreen({ nav, userProfile, onSave, onUploadImage, loading }: { nav: Nav; userProfile: any; onSave: (data: any) => Promise<any>; onUploadImage: (base64: string) => Promise<any>; loading: boolean }) {
  const [name, setName] = useState(userProfile?.name || '')
  const [email] = useState(userProfile?.email || '')
  const [phone, setPhone] = useState(userProfile?.phone || '')
  const [vehicleType, setVehicleType] = useState(userProfile?.vehicleType || '')

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '')
      setPhone(userProfile.phone || '')
      setVehicleType(userProfile.vehicleType || '')
    }
  }, [userProfile])

  const handleImagePick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onloadend = async () => {
        await onUploadImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col relative">
      <div className="flex-1 flex flex-col px-6 pt-6 pb-24 overflow-y-auto">
        <button onClick={() => nav('settings')} className="flex items-center gap-1 text-safora-500 text-sm mb-6 hover:text-safora-700 transition-colors w-fit">
          <ArrowLeft size={16} /> Settings
        </button>
        <h2 className="text-xl font-bold text-safora-800 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Edit Profile</h2>
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-safora-200 to-safora-300 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
              {userProfile?.profileImage ? (
                <img src={userProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <LogoIcon size={64} variant="dark" />
              )}
            </div>
            <button onClick={handleImagePick} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-safora-600 flex items-center justify-center shadow-md hover:bg-safora-700 transition-colors">
              <Camera size={14} className="text-white" />
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-safora-500 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="safora-input" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-safora-500 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
              <input type="email" value={email} readOnly className="safora-input opacity-60" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-safora-500 mb-1.5 block">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="safora-input" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-safora-500 mb-1.5 block">Vehicle Type</label>
            <div className="relative">
              <Route className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safora-400" size={18} />
              <input type="text" value={vehicleType} onChange={e => setVehicleType(e.target.value)} className="safora-input" />
            </div>
          </div>
        </div>
        <button className="btn-primary mt-6 flex items-center justify-center gap-2" onClick={() => onSave({ name, phone, vehicleType })} disabled={loading}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Changes
        </button>
      </div>
      <BottomNav active="settings" onNavigate={(s) => nav(s as Screen)} />
    </motion.div>
  )
}

/* ============================================================
   NOTIFICATIONS — wired to real settings API
============================================================ */
function NotificationsScreen({ nav, settings, onToggle }: { nav: Nav; settings: any; onToggle: (key: string) => void }) {
  const notifs = settings?.notifications || { drowsiness: true, speed: true, emergency: true, tips: false, updates: true, sound: true }

  const items = [
    { key: 'drowsiness', label: 'Drowsiness Alerts', desc: 'Get notified when fatigue is detected', icon: Eye },
    { key: 'speed', label: 'Speed Warnings', desc: 'Alert when exceeding speed limits', icon: TrendingUp },
    { key: 'emergency', label: 'Emergency Alerts', desc: 'SOS and emergency notifications', icon: AlertTriangle },
    { key: 'tips', label: 'Driving Tips', desc: 'Daily safe driving reminders', icon: Star },
    { key: 'updates', label: 'App Updates', desc: 'New features and improvements', icon: Bell },
    { key: 'sound', label: 'Alert Sound', desc: 'Play sound with notifications', icon: Volume2 },
  ]

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col relative">
      <div className="flex-1 flex flex-col px-6 pt-6 pb-24 overflow-y-auto">
        <button onClick={() => nav('settings')} className="flex items-center gap-1 text-safora-500 text-sm mb-6 hover:text-safora-700 transition-colors w-fit">
          <ArrowLeft size={16} /> Settings
        </button>
        <h2 className="text-xl font-bold text-safora-800 mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>Notifications</h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.key} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-safora-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-safora-50 flex items-center justify-center flex-shrink-0">
                <item.icon size={18} className="text-safora-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-safora-800">{item.label}</p>
                <p className="text-xs text-safora-400 truncate">{item.desc}</p>
              </div>
              <button className={`toggle-track flex-shrink-0 ${notifs[item.key] ? 'active' : ''}`} onClick={() => onToggle(item.key)}>
                <div className="toggle-thumb" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav active="settings" onNavigate={(s) => nav(s as Screen)} />
    </motion.div>
  )
}

/* ============================================================
   DRIVE HISTORY — wired to real trips API
============================================================ */
function HistoryScreen({ nav, trips, stats }: { nav: Nav; trips: any[]; stats: any }) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 86400000) return 'Today'
    if (diff < 172800000) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getMoodStyle = (score: number) => {
    if (score >= 80) return { mood: 'Alert', color: 'text-green-500', bg: 'bg-green-50' }
    if (score >= 60) return { mood: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-50' }
    return { mood: 'Drowsy', color: 'text-red-500', bg: 'bg-red-50' }
  }

  const weekStats = stats?.week || { trips: 0, avgScore: 0, distance: 0, alerts: 0 }

  return (
    <motion.div {...pageAnim} className="flex-1 bg-safora-screen flex flex-col relative">
      <div className="flex-1 flex flex-col px-6 pt-6 pb-24 overflow-y-auto">
        <button onClick={() => nav('settings')} className="flex items-center gap-1 text-safora-500 text-sm mb-6 hover:text-safora-700 transition-colors w-fit">
          <ArrowLeft size={16} /> Settings
        </button>
        <h2 className="text-xl font-bold text-safora-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Drive History</h2>
        <div className="bg-gradient-to-r from-safora-700 to-safora-500 rounded-2xl p-4 mb-5">
          <p className="text-white/60 text-xs mb-2">This Week</p>
          <div className="flex justify-between">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{weekStats.trips}</p>
              <p className="text-white/50 text-[10px]">Trips</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{weekStats.avgScore}</p>
              <p className="text-white/50 text-[10px]">Avg Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{weekStats.distance}km</p>
              <p className="text-white/50 text-[10px]">Distance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{weekStats.alerts}</p>
              <p className="text-white/50 text-[10px]">Alerts</p>
            </div>
          </div>
        </div>

        {trips.length === 0 ? (
          <p className="text-safora-400 text-sm text-center py-8">No trip history yet. Start your first trip!</p>
        ) : (
          <div className="space-y-3">
            {trips.filter(t => t.status === 'completed').map((trip, i) => {
              const style = getMoodStyle(trip.safetyScore)
              return (
                <motion.div key={trip._id} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.07 }}
                  className="p-4 bg-white rounded-xl border border-safora-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-safora-400" />
                      <span className="text-xs text-safora-500">{formatDate(trip.startTime)}</span>
                      <span className="text-xs text-safora-300">|</span>
                      <span className="text-xs text-safora-400">{formatTime(trip.startTime)}{trip.endTime ? ` - ${formatTime(trip.endTime)}` : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-safora-400">Distance</p>
                        <p className="text-sm font-semibold text-safora-800">{trip.distance} km</p>
                      </div>
                      <div>
                        <p className="text-xs text-safora-400">Score</p>
                        <p className="text-sm font-bold text-safora-800">{trip.safetyScore}/100</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${style.color} ${style.bg}`}>
                      {style.mood}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
      <BottomNav active="settings" onNavigate={(s) => nav(s as Screen)} />
    </motion.div>
  )
}

/* ============================================================
   MUSIC PLAYER (unchanged — frontend-only feature)
============================================================ */
function MusicPlayerScreen({ nav }: { nav: Nav }) {
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(35)

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setProgress(p => p >= 100 ? 0 : p + 0.5), 200)
    return () => clearInterval(t)
  }, [playing])

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex-1 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0A3D4C 0%, #0F5567 50%, #1A8FA6 100%)' }}>
      <div className="flex-1 flex flex-col items-center px-8 pt-6">
        <button onClick={() => nav('dashboard')} className="self-start flex items-center gap-1 text-white/50 text-sm mb-6 hover:text-white/80 transition-colors">
          <ArrowLeft size={16} /> Dashboard
        </button>
        <div className="px-4 py-1.5 rounded-full bg-accent/20 border border-accent/30 mb-6">
          <p className="text-accent text-xs font-medium">Stay Alert Mode Active</p>
        </div>
        <motion.div animate={{ rotate: playing ? 360 : 0 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="w-48 h-48 rounded-full bg-gradient-to-br from-safora-300 to-safora-600 flex items-center justify-center mb-8 shadow-2xl border-4 border-white/10">
          <div className="w-16 h-16 rounded-full bg-safora-900 flex items-center justify-center border-4 border-white/20">
            <Music size={24} className="text-white/60" />
          </div>
        </motion.div>
        <h3 className="text-white text-lg font-bold mb-1">Upbeat Energy Mix</h3>
        <p className="text-white/50 text-sm mb-6">SAFORA AI Playlist</p>
        <div className="w-full mb-2">
          <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
            <motion.div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-white/40 text-[10px]">1:{String(Math.floor(progress / 100 * 60)).padStart(2, '0')}</span>
            <span className="text-white/40 text-[10px]">3:45</span>
          </div>
        </div>
        <div className="flex items-center gap-8 mt-4">
          <button className="text-white/50 hover:text-white transition-colors"><SkipBack size={28} /></button>
          <button onClick={() => setPlaying(!playing)} className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/30 hover:scale-110 active:scale-95 transition-transform">
            {playing ? <Pause size={28} className="text-white" /> : <Play size={28} className="text-white ml-1" />}
          </button>
          <button className="text-white/50 hover:text-white transition-colors"><SkipForward size={28} /></button>
        </div>
        <div className="mt-auto pb-10 w-full">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-400/20 flex items-center justify-center">
                <Smile size={18} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-medium">AI is monitoring your mood</p>
                <p className="text-white/40 text-[10px]">Music will adjust based on your alertness</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
