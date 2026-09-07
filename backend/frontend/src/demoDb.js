import { addDays, getWeekStart, nowIso, today, uid } from './utils'

const KEY = 'estuda_plus_demo_db_v1'
const week = getWeekStart()
const demoUser = { id: 'demo-user', email: 'demo@estudamais.app' }

const seed = () => {
  const d1 = uid(), d2 = uid(), d3 = uid()
  const a1 = uid(), a2 = uid(), a3 = uid()
  return {
    profiles: [{ id: demoUser.id, user_id: demoUser.id, full_name: 'Usuário de demonstração', email: demoUser.email, role: 'admin', contest_name: 'Auditor Fiscal', exam_date: addDays(today(), 120), weekly_hours: 18, onboarding_completed: true, created_at: nowIso() }],
    subscriptions: [{ id: uid(), user_id: demoUser.id, status: 'active', plan_slug: 'annual', current_period_end: addDays(today(), 365), created_at: nowIso() }],
    plans: [
      { id: uid(), name: 'Mensal', slug: 'monthly', price_cents: 2990, interval: 'month', active: true, features: ['Planejamento completo', 'Relatórios', 'Integrações'] },
      { id: uid(), name: 'Anual', slug: 'annual', price_cents: 29900, interval: 'year', active: true, features: ['Todos os recursos', 'Economia anual', 'Suporte prioritário'] },
    ],
    disciplines: [
      { id: d1, user_id: demoUser.id, name: 'Direito Tributário', acronym: 'DTRI', weight: 3, question_count: 30, color: '#2563eb', position: 1 },
      { id: d2, user_id: demoUser.id, name: 'Contabilidade', acronym: 'CONT', weight: 2, question_count: 20, color: '#7c3aed', position: 2 },
      { id: d3, user_id: demoUser.id, name: 'Português', acronym: 'PORT', weight: 1, question_count: 15, color: '#0891b2', position: 3 },
    ],
    topics: [
      { id: uid(), user_id: demoUser.id, discipline_id: d1, name: 'Crédito tributário', status: 'partial', progress: 45 },
      { id: uid(), user_id: demoUser.id, discipline_id: d2, name: 'Demonstrações contábeis', status: 'pending', progress: 20 },
      { id: uid(), user_id: demoUser.id, discipline_id: d3, name: 'Interpretação de textos', status: 'done', progress: 100 },
    ],
    weekly_activities: [
      { id: a1, user_id: demoUser.id, discipline_id: d1, title: 'Questões de crédito tributário', type: 'questions', priority: 'high', status: 'done', planned_date: week, planned_minutes: 90, planned_quantity: 30, origin: 'manual', read_only: false, created_at: nowIso() },
      { id: a2, user_id: demoUser.id, discipline_id: d2, title: 'Teoria — DFC e DVA', type: 'theory', priority: 'medium', status: 'in_progress', planned_date: addDays(week, 2), planned_minutes: 75, planned_quantity: 0, origin: 'manual', read_only: false, created_at: nowIso() },
      { id: a3, user_id: demoUser.id, discipline_id: d3, title: 'Anki — revisões do dia', type: 'flashcards', priority: 'normal', status: 'done', planned_date: addDays(week, 1), planned_minutes: 24, planned_quantity: 86, origin: 'anki', read_only: true, external_key: 'demo-anki-1', metadata: { reviews: 86, unique_cards: 71 }, created_at: nowIso() },
    ],
    study_logs: [
      { id: uid(), user_id: demoUser.id, activity_id: a1, study_date: week, started_at: '19:00', actual_minutes: 82, correct_answers: 23, wrong_answers: 7, flashcards: 0, origin: 'manual', read_only: false, created_at: nowIso() },
      { id: uid(), user_id: demoUser.id, activity_id: a3, study_date: addDays(week, 1), started_at: '20:30', actual_minutes: 24, correct_answers: 0, wrong_answers: 0, flashcards: 86, origin: 'anki', read_only: true, external_key: 'demo-anki-1', created_at: nowIso() },
    ],
    goals: [{ id: uid(), user_id: demoUser.id, name: 'Meta semanal', period: 'weekly', target_minutes: 1080, target_questions: 250, target_flashcards: 600, target_days: 6 }],
    focus_reference: [
      { id: uid(), user_id: demoUser.id, discipline_id: d1, external_name: 'Direito Tributário', weight: 3, question_count: 30, external_percent: 62, suggested_hours: 7, priority_score: 91, source: 'tecconcursos', active: true },
      { id: uid(), user_id: demoUser.id, discipline_id: d2, external_name: 'Contabilidade', weight: 2, question_count: 20, external_percent: 48, suggested_hours: 6, priority_score: 86, source: 'tecconcursos', active: true },
    ],
    tecconcursos_imports: [{ id: uid(), user_id: demoUser.id, file_name: 'demonstracao.csv', format: 'csv', imported_at: nowIso(), active: true, normalized_data: [] }],
    anki_sync: [{ id: uid(), user_id: demoUser.id, sync_date: addDays(week, 1), deck: 'Português', discipline_name: 'Português', reviews: 86, unique_cards: 71, duration_minutes: 24, source: 'anki-connect', external_key: 'demo-anki-1', synced_at: nowIso() }],
    reviews: [{ id: uid(), user_id: demoUser.id, discipline_id: d1, title: 'Revisar crédito tributário', due_date: today(), status: 'pending', cycle_days: 7 }],
    exams: [{ id: uid(), user_id: demoUser.id, name: 'Simulado 01', exam_date: addDays(today(), -7), total_questions: 100, correct_answers: 71, wrong_answers: 29, duration_minutes: 210 }],
    notices: [{ id: uid(), title: 'Bem-vindo à versão web', content: 'Este ambiente contém dados de demonstração. Configure o Supabase para uso real.', active: true, audience: 'all', created_at: nowIso() }],
    coupons: [], audit_logs: [], weekly_plans: [],
  }
}

const read = () => {
  const raw = localStorage.getItem(KEY)
  if (raw) return JSON.parse(raw)
  const db = seed()
  localStorage.setItem(KEY, JSON.stringify(db))
  return db
}
const write = (db) => localStorage.setItem(KEY, JSON.stringify(db))

export const demoAuthUser = demoUser
export const demoReset = () => { localStorage.removeItem(KEY); return read() }
export const demoList = (table) => read()[table] || []
export const demoInsert = (table, payload) => {
  const db = read(); const row = { id: uid(), created_at: nowIso(), ...payload }
  db[table] = [...(db[table] || []), row]; write(db); return row
}
export const demoUpdate = (table, id, payload) => {
  const db = read(); let result = null
  db[table] = (db[table] || []).map(row => row.id === id ? (result = { ...row, ...payload, updated_at: nowIso() }) : row)
  write(db); return result
}
export const demoRemove = (table, id) => {
  const db = read(); db[table] = (db[table] || []).filter(row => row.id !== id); write(db); return true
}
export const demoBulkInsert = (table, rows) => {
  const db = read(); const inserted = rows.map(row => ({ id: uid(), created_at: nowIso(), ...row }))
  db[table] = [...(db[table] || []), ...inserted]; write(db); return inserted
}
export const demoExport = () => read()
