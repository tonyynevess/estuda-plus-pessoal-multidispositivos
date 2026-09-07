import { demoMode, supabase } from './supabase'
import { demoBulkInsert, demoExport, demoInsert, demoList, demoRemove, demoUpdate } from './demoDb'

const sortRows = (rows, orderBy, ascending = true) => orderBy
  ? [...rows].sort((a, b) => String(a[orderBy] ?? '').localeCompare(String(b[orderBy] ?? '')) * (ascending ? 1 : -1))
  : rows

export const db = {
  async list(table, { orderBy = 'created_at', ascending = false, filters = {}, limit } = {}) {
    if (demoMode) {
      let rows = demoList(table).filter(row => Object.entries(filters).every(([key, value]) => value === undefined || row[key] === value))
      rows = sortRows(rows, orderBy, ascending)
      return limit ? rows.slice(0, limit) : rows
    }
    let query = supabase.from(table).select('*')
    Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== '') query = query.eq(key, value) })
    if (orderBy) query = query.order(orderBy, { ascending })
    if (limit) query = query.limit(limit)
    const { data, error } = await query
    if (error) throw error
    return data || []
  },
  async insert(table, payload) {
    if (demoMode) return demoInsert(table, payload)
    const { data, error } = await supabase.from(table).insert(payload).select().single()
    if (error) throw error
    return data
  },
  async bulkInsert(table, rows) {
    if (!rows.length) return []
    if (demoMode) return demoBulkInsert(table, rows)
    const { data, error } = await supabase.from(table).insert(rows).select()
    if (error) throw error
    return data || []
  },
  async update(table, id, payload) {
    if (demoMode) return demoUpdate(table, id, payload)
    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async remove(table, id) {
    if (demoMode) return demoRemove(table, id)
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    return true
  },
  async upsert(table, rows, onConflict) {
    if (demoMode) {
      const result = []
      for (const row of Array.isArray(rows) ? rows : [rows]) result.push(demoInsert(table, row))
      return result
    }
    const { data, error } = await supabase.from(table).upsert(rows, { onConflict }).select()
    if (error) throw error
    return data || []
  },
  async exportAll() {
    if (demoMode) return demoExport()
    const tables = ['profiles','subscriptions','disciplines','topics','weekly_activities','study_logs','goals','weekly_plans','focus_reference','tecconcursos_imports','anki_sync','reviews','exams']
    const result = {}
    for (const table of tables) result[table] = await this.list(table, { orderBy: null })
    return result
  },
}
