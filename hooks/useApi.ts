'use client'

import { useState, useCallback } from 'react'
import type { ApiResponse } from '@/types'

export function useApi() {
  const [loading, setLoading] = useState(false)

  const request = useCallback(async <T>(
    url: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> => {
    setLoading(true)
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
      })
      const data = await res.json()
      return data
    } catch {
      return { success: false, error: 'Network error' }
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback(<T>(url: string) => request<T>(url), [request])

  const post = useCallback(<T>(url: string, body: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body) }), [request])

  const put = useCallback(<T>(url: string, body: unknown) =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(body) }), [request])

  const del = useCallback(<T>(url: string) =>
    request<T>(url, { method: 'DELETE' }), [request])

  return { loading, get, post, put, del }
}
