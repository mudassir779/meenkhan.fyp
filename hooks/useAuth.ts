'use client'

import { useState } from 'react'
import { signIn, signOut } from 'next-auth/react'
import { useApi } from './useApi'

export function useAuth() {
  const { loading, post } = useApi()
  const [error, setError] = useState('')

  const signup = async (name: string, email: string, password: string) => {
    setError('')
    const res = await post<{ email: string; message: string }>('/api/auth/signup', { name, email, password })
    if (!res.success) {
      setError(res.error || 'Signup failed')
      return null
    }
    return res.data
  }

  const signin = async (email: string, password: string) => {
    setError('')
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    if (result?.error) {
      setError('Invalid email or password')
      return false
    }
    return true
  }

  const verifyOTP = async (email: string, otp: string) => {
    setError('')
    const res = await post<{ message: string }>('/api/auth/verify-otp', { email, otp })
    if (!res.success) {
      setError(res.error || 'Verification failed')
      return false
    }
    return true
  }

  const resendOTP = async (email: string) => {
    const res = await post<{ message: string }>('/api/auth/resend-otp', { email })
    return res.success
  }

  const forgotPassword = async (email: string) => {
    setError('')
    const res = await post<{ message: string }>('/api/auth/forgot-password', { email })
    if (!res.success) {
      setError(res.error || 'Failed to send reset email')
      return false
    }
    return true
  }

  const resetPassword = async (token: string, password: string) => {
    setError('')
    const res = await post<{ message: string }>('/api/auth/reset-password', { token, password })
    if (!res.success) {
      setError(res.error || 'Reset failed')
      return false
    }
    return true
  }

  const logout = async () => {
    await signOut({ redirect: false })
  }

  return { signup, signin, verifyOTP, resendOTP, forgotPassword, resetPassword, logout, loading, error, setError }
}
