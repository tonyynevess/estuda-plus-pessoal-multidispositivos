import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from './api'

export function useRows(table, options = {}) {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const reload = useCallback(async () => {
    if (!user) return
    setLoading(true); setError('')
    try { setRows(await db.list(table, options)) }
    catch (e) { setError(e.message || 'Erro ao carregar dados.') }
    finally { setLoading(false) }
  }, [table, user?.id, JSON.stringify(options)])
  useEffect(() => { reload() }, [reload])
  return { rows, setRows, loading, error, reload }
}

export function useNotice() {
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState('success')
  const show = (text, nextTone = 'success') => {
    setMessage(text); setTone(nextTone)
    window.clearTimeout(show.timer)
    show.timer = window.setTimeout(() => setMessage(''), 3500)
  }
  return { message, tone, show }
}
