'use client'

import { useState, useCallback } from 'react'
import { useApi } from './useApi'
import type { IUserSettings } from '@/types'

export function useSettings() {
  const { loading, get, put } = useApi()
  const [settings, setSettings] = useState<IUserSettings | null>(null)

  const fetchSettings = useCallback(async () => {
    const res = await get<IUserSettings>('/api/settings')
    if (res.success && res.data) {
      setSettings(res.data)
    }
    return res
  }, [get])

  const updateSettings = async (data: Partial<IUserSettings>) => {
    const res = await put<IUserSettings>('/api/settings', data)
    if (res.success && res.data) {
      setSettings(res.data)
    }
    return res
  }

  return { settings, loading, fetchSettings, updateSettings }
}
