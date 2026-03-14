'use client'

import { useState, useCallback } from 'react'
import { useApi } from './useApi'
import type { IEmergencyContact } from '@/types'

export function useContacts() {
  const { loading, get, post, put, del } = useApi()
  const [contacts, setContacts] = useState<IEmergencyContact[]>([])

  const fetchContacts = useCallback(async () => {
    const res = await get<IEmergencyContact[]>('/api/contacts')
    if (res.success && res.data) {
      setContacts(res.data)
    }
    return res
  }, [get])

  const addContact = async (data: Partial<IEmergencyContact>) => {
    const res = await post<IEmergencyContact>('/api/contacts', data)
    if (res.success && res.data) {
      setContacts(prev => [...prev, res.data!])
    }
    return res
  }

  const updateContact = async (id: string, data: Partial<IEmergencyContact>) => {
    const res = await put<IEmergencyContact>(`/api/contacts/${id}`, data)
    if (res.success && res.data) {
      setContacts(prev => prev.map(c => c._id === id ? res.data! : c))
    }
    return res
  }

  const deleteContact = async (id: string) => {
    const res = await del(`/api/contacts/${id}`)
    if (res.success) {
      setContacts(prev => prev.filter(c => c._id !== id))
    }
    return res
  }

  return { contacts, loading, fetchContacts, addContact, updateContact, deleteContact }
}
