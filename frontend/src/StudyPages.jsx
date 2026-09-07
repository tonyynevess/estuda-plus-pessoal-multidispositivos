import { useMemo, useState } from 'react'
import { CalendarPlus, Check, Download, FileUp, Lock, Plus, RefreshCcw, Save, Sparkles, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/api'
import { useNotice, useRows } from '../lib/hooks'
import { matchDisciplines, parseTecConcursos } from '../lib/importers'
import { addDays, formatDate, getWeekStart, minutesToText, percent, safeNumber, today } from '../lib/utils'
import { Badge, Button, Card, DataTable, Empty, Field, Loading, Metric, Modal, PageHeader, Progress, Toast } from '../components/UI'

const typeLabel = { questions: 'Questões', theory: 'Teoria', flashcards: 'Flashcards' }
const statusLabel = { pending: 'Pendente', in_progress: 'Em andamento', done: 'Concluída' }
const statusTone = { pending: 'gray', in_progress: 'yellow', done: 'green' }

export function DashboardPage() {
  const { profile } = useAuth()
  const disciplines = useRows('disciplines', { orderBy: 'position', ascending: true })
  const activities = useRows('weekly_activities', { orderBy: 'planned_date', ascending: true })
  const logs = useRows('study_logs', { orderBy: 'study_date', ascending: false })
  const goals = useRows('goals', { orderBy: 'created_at', ascending: false })
  const notices = useRows('notices', { orderBy: 'created_at', ascending: false })
  if ([disciplines, activities, logs, goals].some(x => x.loading)) return <Loading />
  const weekStart = getWeekStart(); const weekEnd = addDays(weekStart, 6)
  const weeklyLogs = logs.rows.filter(l => l.study_date >= weekStart && l.study_date <= weekEnd)
  const totalMinutes = weeklyLogs.reduce((s,l) => s + safeNumber(l.actual_minutes), 0)
  const correct = weeklyLogs.reduce((s,l) => s + safeNumber(l.correct_answers), 0)
  const wrong = weeklyLogs.reduce((s,l) => s + safeNumber(l.wrong_answers), 0)
  const flashcards = weeklyLogs.reduce((s,l) => s + safeNumber(l.flashcards), 0)
  const accuracy = percent(correct, correct + wrong)
  const todayMinutes = weeklyLogs.filter(l => l.study_date === today()).reduce((s,l) => s + safeNumber(l.actual_minutes), 0)
  const examDays = profile?.exam_date ? Math.max(0, Math.ceil((new Date(`${profile.exam_date}T12:00:00`) - new Date()) / 86400000)) : null
  const weeklyGoal = goals.rows.find(g => g.period === 'weekly')
  const todayActivities = activities.rows.filter(a => a.planned_date === today())
  const realActivities = activities.rows.filter(a => a.origin !== 'anki')
  const ankiActivities = activities.rows.filter(a => a.origin === 'anki')
  return <>
    <PageHeader title={`Olá, ${profile?.full_name?.split(' ')[0] || 'estudante'}!`} subtitle="Seu panorama real de estudos, separado das referências externas." />
    {notices.rows.filter(n => n.active).slice(0,1).map(n => <div className="notice" key={n.id}><b>{n.title}</b><span>{n.content}</span></div>)}
    <div className="metrics-grid">
      <Metric label="Desempenho semanal" value={`${accuracy}%`} sub={`${correct + wrong} questões reais`} tone="blue" />
      <Metric label="Tempo na semana" value={minutesToText(totalMinutes)} sub={`Hoje: ${minutesToText(todayMinutes)}`} tone="cyan" />
      <Metric label="Questões" value={correct + wrong} sub={`${correct} certas · ${wrong} erradas`} tone="violet" />
      <Metric label="Flashcards Anki" value={flashcards} sub={`${ankiActivities.length} atividade(s) sincronizada(s)`} tone="green" />
      <Metric label="Dias para a prova" value={examDays ?? '—'} sub={profile?.exam_date ? formatDate(profile.exam_date) : 'Defina nas configurações'} tone="orange" />
    </div>
    <div className="dashboard-grid">
      <Card><div className="card-head"><div><h2>Meta semanal</h2><p>Progresso calculado somente com registros reais.</p></div></div>{weeklyGoal ? <><div className="goal-big"><strong>{minutesToText(totalMinutes)}</strong><span>de {minutesToText(weeklyGoal.target_minutes)}</span></div><Progress value={percent(totalMinutes, weeklyGoal.target_minutes)} /><div className="mini-stats"><span>Questões <b>{correct + wrong}/{weeklyGoal.target_questions || 0}</b></span><span>Flashcards <b>{flashcards}/{weeklyGoal.target_flashcards || 0}</b></span></div></> : <Empty>Cadastre uma meta semanal.</Empty>}</Card>
      <Card><div className="card-head"><div><h2>Atividades de hoje</h2><p>{todayActivities.length} item(ns) planejado(s).</p></div></div>{todayActivities.length ? <div className="list">{todayActivities.map(a => <div className="list-item" key={a.id}><div><b>{a.title}</b><span>{typeLabel[a.type]} · {minutesToText(a.planned_minutes)}</span></div><Badge tone={statusTone[a.status]}>{statusLabel[a.status]}</Badge></div>)}</div> : <Empty>Nenhuma atividade para hoje.</Empty>}</Card>
    </div>
    <div className="dashboard-grid">
      <Card><div className="card-head"><div><h2>Distribuição da semana</h2><p>Atividades manuais e sincronizadas permanecem identificadas.</p></div></div><div className="source-grid"><div><span>Planejadas/manuais</span><strong>{realActivities.length}</strong></div><div><span>Anki sincronizado</span><strong>{ankiActivities.length}</strong></div><div><span>TecConcursos</span><strong>Referência</strong><small>Não entra na performance</small></div></div></Card>
      <Card><div className="card-head"><div><h2>Disciplinas</h2><p>Visão rápida do edital cadastrado.</p></div></div><div className="discipline-bars">{disciplines.rows.slice(0,6).map(d => { const q = weeklyLogs.filter(l => l.discipline_id === d.id).reduce((s,l) => s + safeNumber(l.correct_answers) + safeNumber(l.wrong_answers), 0); return <div key={d.id}><div><b>{d.name}</b><span>{q} questões</span></div><Progress value={Math.min(100, q * 2)} /></div> })}</div></Card>
    </div>
  </>
}

export function ActivitiesPage() {
  const { user } = useAuth(); const activities = useRows('weekly_activities', { orderBy: 'planned_date', ascending: false }); const disciplines = useRows('disciplines', { orderBy: 'position', ascending: true }); const logs = useRows('study_logs', { orderBy: 'study_date', ascending: false })
  const notice = useNotice(); const [filter, setFilter] = useState('all'); const [open, setOpen] = useState(false); const [register, setRegister] = useState(null)
  const blank = { title: '', discipline_id: '', type: 'questions', priority: 'normal', status: 'pending', planned_date: today(), planned_minutes: 60, planned_quantity: 20 }
  const [form, setForm] = useState(blank); const [logForm, setLogForm] = useState({ study_date: today(), started_at: '', actual_minutes: 60, correct_answers: 0, wrong_answers: 0, flashcards: 0, notes: '' })
  if (activities.loading || disciplines.loading || logs.loading) return <Loading />
  const disciplineMap = Object.fromEntries(disciplines.rows.map(d => [d.id, d]))
  const visible = activities.rows.filter(a => filter === 'all' || a.status === filter || (filter === 'anki' && a.origin === 'anki'))
  const create = async e => { e.preventDefault(); try { await db.insert('weekly_activities', { ...form, user_id: user.id, read_only: false, origin: 'manual' }); setForm(blank); setOpen(false); await activities.reload(); notice.show('Atividade criada.') } catch (err) { notice.show(err.message, 'error') } }
  const remove = async row => { if (row.read_only) return; if (!confirm('Excluir esta atividade?')) return; await db.remove('weekly_activities', row.id); activities.reload() }
  const saveLog = async e => { e.preventDefault(); try { await db.insert('study_logs', { ...logForm, user_id: user.id, activity_id: register.id, discipline_id: register.discipline_id || null, origin: 'manual', read_only: false }); await db.update('weekly_activities', register.id, { status: 'done' }); setRegister(null); await Promise.all([activities.reload(), logs.reload()]); notice.show('Estudo registrado e atividade concluída.') } catch (err) { notice.show(err.message, 'error') } }
  return <>
    <PageHeader title="Atividades da semana" subtitle="Planeje, registre e acompanhe atividades manuais e sincronizadas." actions={<Button onClick={() => setOpen(true)}><Plus size={17}/> Nova atividade</Button>} />
    <Toast message={notice.message} tone={notice.tone}/>
    <div className="filter-row">{[['all','Todas'],['pending','Pendentes'],['in_progress','Em andamento'],['done','Concluídas'],['anki','Anki']].map(([v,l]) => <button className={filter === v ? 'active' : ''} onClick={() => setFilter(v)} key={v}>{l}</button>)}</div>
    <div className="activity-grid">{visible.map(a => { const d = disciplineMap[a.discipline_id]; const activityLogs = logs.rows.filter(l => l.activity_id === a.id); const doneMinutes = activityLogs.reduce((s,l) => s + safeNumber(l.actual_minutes), 0); return <Card className={`activity-card ${a.origin === 'anki' ? 'anki-card' : ''}`} key={a.id}><div className="activity-top"><div><Badge tone={a.origin === 'anki' ? 'violet' : 'blue'}>{a.origin === 'anki' ? 'Anki sincronizado' : typeLabel[a.type]}</Badge><h3>{a.title}</h3><p>{d?.name || 'Sem disciplina'} · {formatDate(a.planned_date)}</p></div>{a.read_only && <Lock size={18}/>}</div><div className="activity-data"><span>Planejado<b>{minutesToText(a.planned_minutes)}</b></span><span>Realizado<b>{minutesToText(doneMinutes || (a.origin === 'anki' ? a.planned_minutes : 0))}</b></span><span>Quantidade<b>{a.planned_quantity || 0}</b></span><span>Status<b>{statusLabel[a.status]}</b></span></div><Progress value={percent(doneMinutes || (a.status === 'done' ? a.planned_minutes : 0), a.planned_minutes)} />{a.origin === 'anki' && <div className="anki-details">Revisões: <b>{a.metadata?.reviews ?? a.planned_quantity ?? 0}</b> · Cartões únicos: <b>{a.metadata?.unique_cards ?? '—'}</b></div>}<div className="activity-actions">{!a.read_only && <><Button variant="secondary" onClick={() => { setRegister(a); setLogForm({ ...logForm, actual_minutes: a.planned_minutes || 60, flashcards: a.type === 'flashcards' ? a.planned_quantity : 0 }) }}>Registrar atividade</Button><Button variant="danger-ghost" onClick={() => remove(a)}><Trash2 size={16}/></Button></>}</div></Card>})}</div>
    {!visible.length && <Empty>Nenhuma atividade neste filtro.</Empty>}
    <Modal open={open} title="Nova atividade semanal" onClose={() => setOpen(false)}><form id="activity-form" className="form-grid" onSubmit={create}><Field label="Título" className="span-2"><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/></Field><Field label="Disciplina"><select value={form.discipline_id} onChange={e => setForm({ ...form, discipline_id: e.target.value })}><option value="">Selecione</option>{disciplines.rows.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field><Field label="Tipo"><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="questions">Questões</option><option value="theory">Teoria</option><option value="flashcards">Flashcards</option></select></Field><Field label="Prioridade"><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="normal">Normal</option><option value="medium">Média</option><option value="high">Alta</option></select></Field><Field label="Data"><input type="date" value={form.planned_date} onChange={e => setForm({ ...form, planned_date: e.target.value })}/></Field><Field label="Tempo planejado (min)"><input type="number" min="0" value={form.planned_minutes} onChange={e => setForm({ ...form, planned_minutes: safeNumber(e.target.value) })}/></Field><Field label="Quantidade"><input type="number" min="0" value={form.planned_quantity} onChange={e => setForm({ ...form, planned_quantity: safeNumber(e.target.value) })}/></Field></form><div className="modal-actions"><Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button><Button form="activity-form"><Save size={16}/> Salvar</Button></div></Modal>
    <Modal open={Boolean(register)} title="Registrar atividade" onClose={() => setRegister(null)}><form id="log-form" className="form-grid" onSubmit={saveLog}><Field label="Data"><input type="date" value={logForm.study_date} onChange={e => setLogForm({ ...logForm, study_date: e.target.value })}/></Field><Field label="Horário"><input type="time" value={logForm.started_at} onChange={e => setLogForm({ ...logForm, started_at: e.target.value })}/></Field><Field label="Tempo realizado (min)"><input type="number" min="0" value={logForm.actual_minutes} onChange={e => setLogForm({ ...logForm, actual_minutes: safeNumber(e.target.value) })}/></Field><Field label="Questões certas"><input type="number" min="0" value={logForm.correct_answers} onChange={e => setLogForm({ ...logForm, correct_answers: safeNumber(e.target.value) })}/></Field><Field label="Questões erradas"><input type="number" min="0" value={logForm.wrong_answers} onChange={e => setLogForm({ ...logForm, wrong_answers: safeNumber(e.target.value) })}/></Field><Field label="Flashcards"><input type="number" min="0" value={logForm.flashcards} onChange={e => setLogForm({ ...logForm, flashcards: safeNumber(e.target.value) })}/></Field><Field label="Observações" className="span-2"><textarea value={logForm.notes} onChange={e => setLogForm({ ...logForm, notes: e.target.value })}/></Field></form><div className="modal-actions"><Button variant="secondary" onClick={() => setRegister(null)}>Cancelar</Button><Button form="log-form"><Check size={16}/> Concluir registro</Button></div></Modal>
  </>
}

export function PlanningPage() {
  const { user, profile } = useAuth(); const activities = useRows('weekly_activities', { orderBy: 'planned_date', ascending: true }); const goals = useRows('goals'); const references = useRows('focus_reference'); const imports = useRows('tecconcursos_imports'); const notice = useNotice()
  if (activities.loading || goals.loading || references.loading || imports.loading) return <Loading />
  const currentImport = imports.rows[0]; const useTec = currentImport?.active ?? false; const weekStart = getWeekStart(); const weekEnd = addDays(weekStart,6); const weekActivities = activities.rows.filter(a => a.planned_date >= weekStart && a.planned_date <= weekEnd)
  const toggleTec = async () => { if (!currentImport) return notice.show('Importe dados do TecConcursos primeiro.', 'error'); await db.update('tecconcursos_imports', currentImport.id, { active: !useTec }); for (const ref of references.rows) await db.update('focus_reference', ref.id, { active: !useTec }); await Promise.all([imports.reload(), references.reload()]); notice.show(!useTec ? 'Referência TecConcursos ativada.' : 'Referência TecConcursos ignorada.') }
  const generate = async () => {
    const activeRefs = useTec ? references.rows.filter(r => r.active) : []
    if (!activeRefs.length) return notice.show('Ative ou importe referências em Onde focar para a geração estratégica.', 'error')
    const weeklyMinutes = safeNumber(profile?.weekly_hours, 10) * 60
    const scoreTotal = activeRefs.reduce((s,r) => s + safeNumber(r.priority_score, safeNumber(r.weight,1) * 10), 0) || 1
    const rows = activeRefs.map((r,i) => ({ user_id: user.id, discipline_id: r.discipline_id || null, title: `Plano estratégico — ${r.external_name}`, type: 'questions', priority: i < 2 ? 'high' : 'medium', status: 'pending', planned_date: addDays(weekStart, i % 6), planned_minutes: Math.max(30, Math.round(weeklyMinutes * (safeNumber(r.priority_score,10) / scoreTotal))), planned_quantity: Math.max(10, Math.round(safeNumber(r.question_count,10) * .5)), origin: 'planner', read_only: false, metadata: { uses_tec_reference: true, tec_percent: r.external_percent } }))
    await db.bulkInsert('weekly_activities', rows); await activities.reload(); notice.show(`${rows.length} atividades estratégicas geradas.`)
  }
  return <>
    <PageHeader title="Planejamento da semana" subtitle={`${formatDate(weekStart)} a ${formatDate(weekEnd)}`} actions={<><Button variant="secondary"><TargetIcon/> Definição de metas</Button><Button onClick={() => location.assign('/app/onde-focar')}><FileUp size={17}/> Importar dados do TecConcursos</Button></>} />
    <Toast message={notice.message} tone={notice.tone}/>
    <Card className="strategy-panel"><div><Badge tone="violet">Referência estratégica</Badge><h2>Dados do TecConcursos</h2><p>Quando ativados, influenciam apenas prioridade, estratégia e distribuição de tempo. Não alteram sua performance real.</p></div><div className="strategy-actions"><Badge tone={useTec ? 'green' : 'gray'}>{useTec ? 'Em uso' : 'Ignorados'}</Badge><Button variant="secondary" onClick={toggleTec}>{useTec ? 'Não utilizar dados importados' : 'Utilizar dados importados'}</Button><Button onClick={generate}><Sparkles size={17}/> Gerar planejamento automático</Button></div></Card>
    <div className="week-board">{Array.from({length:7},(_,i) => { const date = addDays(weekStart,i); const dayRows = weekActivities.filter(a => a.planned_date === date); return <section className="day-column" key={date}><header><b>{['SEG','TER','QUA','QUI','SEX','SÁB','DOM'][i]}</b><span>{formatDate(date)}</span></header>{dayRows.map(a => <div className={`day-activity ${a.origin}`} key={a.id}><b>{a.title}</b><span>{minutesToText(a.planned_minutes)} · {statusLabel[a.status]}</span>{a.origin === 'anki' && <Badge tone="violet">Somente leitura</Badge>}</div>)}{!dayRows.length && <div className="day-empty">Sem atividades</div>}</section> })}</div>
  </>
}
function TargetIcon(){ return <CalendarPlus size={17}/> }

export function FocusPage() {
  const { user } = useAuth(); const disciplines = useRows('disciplines', { orderBy: 'position', ascending: true }); const references = useRows('focus_reference'); const imports = useRows('tecconcursos_imports', { orderBy: 'imported_at', ascending: false }); const notice = useNotice()
  const [open, setOpen] = useState(false); const [text, setText] = useState(''); const [fileName, setFileName] = useState(''); const [preview, setPreview] = useState([])
  if (disciplines.loading || references.loading || imports.loading) return <Loading />
  const parse = () => { try { const rows = matchDisciplines(parseTecConcursos(text,fileName), disciplines.rows).map(r => ({ ...r, priority_score: Math.round((safeNumber(r.weight,1)*15) + (100-safeNumber(r.external_percent))*0.6 + safeNumber(r.question_count)*0.3) })); setPreview(rows); if (!rows.length) notice.show('Nenhuma linha reconhecida.', 'error') } catch (err) { notice.show(`Falha na leitura: ${err.message}`, 'error') } }
  const file = async e => { const f=e.target.files?.[0]; if (!f) return; setFileName(f.name); setText(await f.text()) }
  const save = async () => {
    if (!preview.length) return
    const importRow = await db.insert('tecconcursos_imports', { user_id:user.id, file_name:fileName || 'texto-colado', format:(fileName.split('.').pop() || 'text'), imported_at:new Date().toISOString(), active:true, normalized_data:preview })
    await db.bulkInsert('focus_reference', preview.map(r => ({ user_id:user.id, import_id:importRow.id, discipline_id:r.discipline_id || null, external_name:r.external_name, weight:r.weight, question_count:r.question_count, external_percent:r.external_percent, suggested_hours:r.suggested_hours, priority_score:r.priority_score, source:'tecconcursos', active:true })))
    setOpen(false); setPreview([]); setText(''); await Promise.all([references.reload(),imports.reload()]); notice.show('Dados importados como referência estratégica.')
  }
  const latest = imports.rows[0]
  return <>
    <PageHeader title="Onde focar" subtitle="Combine edital e desempenho real com referências estratégicas opcionais." actions={<Button onClick={() => setOpen(true)}><FileUp size={17}/> Importar dados do TecConcursos</Button>} />
    <Toast message={notice.message} tone={notice.tone}/>
    {latest && <Card className="import-status"><div><b>Última importação</b><span>{latest.file_name} · {new Date(latest.imported_at).toLocaleString('pt-BR')}</span></div><Badge tone={latest.active ? 'green' : 'gray'}>{latest.active ? 'Referência ativa' : 'Não utilizada'}</Badge></Card>}
    <div className="focus-grid">{references.rows.map(r => { const d=disciplines.rows.find(x=>x.id===r.discipline_id); return <Card className="focus-card" key={r.id}><div className="focus-title"><div><Badge tone="violet">TecConcursos · referência</Badge><h3>{d?.name || r.external_name}</h3></div><strong>{r.priority_score || 0}</strong></div><div className="focus-data"><span>Peso<b>{r.weight || 0}</b></span><span>Questões edital<b>{r.question_count || 0}</b></span><span>Referência externa<b>{r.external_percent || 0}%</b></span><span>Horas sugeridas<b>{r.suggested_hours || 0}h</b></span></div><p className="reference-warning">Não representa sua performance atual.</p></Card>})}</div>
    {!references.rows.length && <Empty>Importe dados para criar referências estratégicas.</Empty>}
    <Modal open={open} title="Importar dados do TecConcursos" onClose={() => setOpen(false)}><div className="importer"><Field label="Arquivo CSV, TSV, TXT, JSON ou HTML"><input type="file" accept=".csv,.tsv,.txt,.json,.html" onChange={file}/></Field><Field label="Ou cole os dados"><textarea rows="8" value={text} onChange={e=>setText(e.target.value)} placeholder="Disciplina;Peso;Questões;Percentual;Horas"/></Field><Button variant="secondary" onClick={parse}><RefreshCcw size={16}/> Analisar dados</Button>{preview.length>0 && <DataTable rows={preview} columns={[{key:'external_name',label:'Disciplina externa'},{key:'matched_name',label:'Correspondência',render:r=>r.matched_name || <Badge tone="red">Revisar</Badge>},{key:'weight',label:'Peso'},{key:'question_count',label:'Questões'},{key:'external_percent',label:'% referência'},{key:'priority_score',label:'Prioridade'}]}/>}</div><div className="modal-actions"><Button variant="secondary" onClick={()=>setOpen(false)}>Cancelar</Button><Button disabled={!preview.length} onClick={save}><Download size={16}/> Confirmar importação</Button></div></Modal>
  </>
}
