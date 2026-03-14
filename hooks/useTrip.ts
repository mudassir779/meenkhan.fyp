'use client'

import { useState, useCallback } from 'react'
import { useApi } from './useApi'
import type { ITrip } from '@/types'

export function useTrip() {
  const { loading, get, post, put } = useApi()
  const [activeTrip, setActiveTrip] = useState<ITrip | null>(null)
  const [trips, setTrips] = useState<ITrip[]>([])
  const [stats, setStats] = useState<{
    week: { trips: number; distance: number; avgScore: number; alerts: number }
    allTime: { trips: number; distance: number }
  } | null>(null)

  const fetchTrips = useCallback(async () => {
    const res = await get<ITrip[]>('/api/trips')
    if (res.success && res.data) {
      setTrips(res.data)
      const active = res.data.find(t => t.status === 'active')
      if (active) setActiveTrip(active)
    }
    return res
  }, [get])

  const fetchStats = useCallback(async () => {
    const res = await get<typeof stats>('/api/trips/stats')
    if (res.success && res.data) {
      setStats(res.data)
    }
    return res
  }, [get])

  const startTrip = async () => {
    const res = await post<ITrip>('/api/trips/start', {})
    if (res.success && res.data) {
      setActiveTrip(res.data)
    }
    return res
  }

  const endTrip = async (tripId: string) => {
    const res = await put<ITrip>(`/api/trips/${tripId}/end`, {})
    if (res.success) {
      setActiveTrip(null)
    }
    return res
  }

  const updateTrip = async (tripId: string, data: Record<string, unknown>) => {
    const res = await put<ITrip>(`/api/trips/${tripId}/update`, data)
    if (res.success && res.data) {
      setActiveTrip(res.data)
    }
    return res
  }

  const addEvent = async (tripId: string, data: Record<string, unknown>) => {
    return await post(`/api/trips/${tripId}/events`, data)
  }

  return { activeTrip, trips, stats, loading, fetchTrips, fetchStats, startTrip, endTrip, updateTrip, addEvent }
}
