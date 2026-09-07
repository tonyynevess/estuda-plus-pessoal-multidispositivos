import { normalizeText, safeNumber } from './utils'

const aliases = {
  discipline: ['disciplina','materia','matéria','nome','subject'],
  weight: ['peso','weight'],
  questions: ['questoes','questões','quantidade','qtd','questions'],
  performance: ['percentual','desempenho','performance','aproveitamento','percent'],
  hours: ['horas','hora','hours','tempo'],
}
const pick = (row, keys) => {
  const found = Object.keys(row).find(k => keys.includes(normalizeText(k)))
  return found ? row[found] : undefined
}
const parseDelimited = (text) => {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (!lines.length) return []
  const delimiter = [';','\t',','].sort((a,b) => (lines[0].split(b).length - lines[0].split(a).length))[0]
  const split = line => {
    const out = []; let cell = ''; let quote = false
    for (let i=0;i<line.length;i++) {
      const char = line[i]
      if (char === '"' && line[i+1] === '"') { cell += '"'; i++ }
      else if (char === '"') quote = !quote
      else if (char === delimiter && !quote) { out.push(cell.trim()); cell = '' }
      else cell += char
    }
    out.push(cell.trim()); return out
  }
  const headers = split(lines[0])
  return lines.slice(1).map(line => Object.fromEntries(headers.map((h,i) => [h, split(line)[i] ?? ''])))
}
const parseHtml = text => {
  const doc = new DOMParser().parseFromString(text, 'text/html')
  const table = doc.querySelector('table')
  if (!table) return []
  const rows = [...table.querySelectorAll('tr')].map(tr => [...tr.querySelectorAll('th,td')].map(td => td.textContent.trim()))
  const headers = rows.shift() || []
  return rows.filter(r => r.some(Boolean)).map(r => Object.fromEntries(headers.map((h,i) => [h || `coluna_${i+1}`, r[i] ?? ''])))
}
export function parseTecConcursos(text, filename = '') {
  let rows = []
  const trimmed = text.trim()
  if (!trimmed) return []
  if (filename.toLowerCase().endsWith('.json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const value = JSON.parse(trimmed); rows = Array.isArray(value) ? value : (value.data || value.rows || value.disciplinas || [])
  } else if (filename.toLowerCase().endsWith('.html') || /<table[\s>]/i.test(trimmed)) rows = parseHtml(trimmed)
  else rows = parseDelimited(trimmed)
  return rows.map(row => {
    const discipline = pick(row, aliases.discipline) ?? Object.values(row)[0]
    let performance = safeNumber(String(pick(row, aliases.performance) ?? '').replace('%','').replace(',','.'))
    if (performance > 0 && performance <= 1) performance *= 100
    return {
      external_name: String(discipline || '').trim(),
      weight: safeNumber(String(pick(row, aliases.weight) ?? '').replace(',','.'), 1),
      question_count: safeNumber(String(pick(row, aliases.questions) ?? '').replace(/\D/g,''), 0),
      external_percent: performance,
      suggested_hours: safeNumber(String(pick(row, aliases.hours) ?? '').replace(',','.').replace(/[^0-9.]/g,''), 0),
    }
  }).filter(r => r.external_name)
}
export function matchDisciplines(imported, disciplines) {
  return imported.map(row => {
    const target = normalizeText(row.external_name)
    let match = disciplines.find(d => normalizeText(d.name) === target || normalizeText(d.acronym) === target)
    if (!match) match = disciplines.find(d => normalizeText(d.name).includes(target) || target.includes(normalizeText(d.name)))
    return { ...row, discipline_id: match?.id || '', matched_name: match?.name || '' }
  })
}

export function mapLegacyState(raw, userId) {
  const state = raw.state || raw.data || raw
  const subjects = state.subjects || state.disciplines || state.materias || []
  const disciplines = subjects.map((s, i) => ({
    user_id: userId, name: s.name || s.nome || s.subject || `Disciplina ${i+1}`,
    acronym: s.sigla || s.acronym || '', weight: safeNumber(s.weight || s.peso, 1),
    question_count: safeNumber(s.questionCount || s.quantidadeQuestoes || s.editalTotalImported, 0),
    color: s.color || '#2563eb', position: i + 1,
  }))
  const records = state.records || state.studyLogs || state.registros || []
  const study_logs = records.map(r => ({
    user_id: userId, study_date: r.date || r.data, started_at: r.time || r.horario || null,
    actual_minutes: safeNumber(r.minutes || r.minutos || r.tempoRealMin, 0),
    correct_answers: safeNumber(r.correct || r.certas || r.acertos, 0),
    wrong_answers: safeNumber(r.wrong || r.erradas || r.erros, 0),
    flashcards: safeNumber(r.flashcards, 0), notes: r.comment || r.observacao || '',
    origin: r.origin || r.origem || 'legacy', read_only: false,
    legacy_subject_name: r.subject || r.disciplina || '',
  })).filter(r => r.study_date)
  const oldActivities = state.weeklyActivities || state.weekly_activities || state.atividadesSemanais || []
  const weekly_activities = oldActivities.map(a => ({
    user_id: userId, title: a.title || a.nome || a.topic || a.assunto || 'Atividade importada',
    type: a.type || a.tipo || 'theory', priority: a.priority || a.prioridade || 'normal',
    status: a.status || 'pending', planned_date: a.date || a.data || a.plannedDate || null,
    planned_minutes: safeNumber(a.minutes || a.tempoPlanejadoMin || a.plannedMinutes, 0),
    planned_quantity: safeNumber(a.quantity || a.quantidade || a.plannedQuantity, 0),
    origin: a.origin || a.origem || 'legacy', read_only: Boolean(a.readOnly || a.somenteLeitura),
    legacy_subject_name: a.subject || a.disciplina || '',
  }))
  return { settings: state.settings || {}, disciplines, study_logs, weekly_activities, raw: state }
}
