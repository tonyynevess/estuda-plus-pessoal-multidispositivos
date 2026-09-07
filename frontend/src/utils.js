export const uid = () => crypto.randomUUID()
export const today = () => new Date().toISOString().slice(0, 10)
export const nowIso = () => new Date().toISOString()
export const formatDate = (value) => value ? new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}`.slice(0, 10) + 'T12:00:00')) : '—'
export const formatDateTime = (value) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—'
export const minutesToText = (minutes = 0) => {
  const total = Number(minutes) || 0
  const h = Math.floor(total / 60)
  const m = total % 60
  return h ? `${h}h${String(m).padStart(2, '0')}` : `${m}min`
}
export const percent = (value, total) => total ? Math.round((Number(value || 0) / Number(total)) * 100) : 0
export const normalizeText = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
export const downloadJson = (filename, data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
export const downloadCsv = (filename, rows) => {
  if (!rows.length) return
  const keys = [...new Set(rows.flatMap(Object.keys))]
  const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`
  const csv = [keys.map(esc).join(';'), ...rows.map(row => keys.map(k => esc(row[k])).join(';'))].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
export const getWeekStart = (date = new Date()) => {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  const diff = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - diff)
  return d.toISOString().slice(0, 10)
}
export const addDays = (date, days) => {
  const d = new Date(`${date}T12:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
export const safeNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback
