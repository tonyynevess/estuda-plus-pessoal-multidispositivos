import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { BookOpenCheck, CheckCircle2, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button, Field, Toast } from '../components/UI'

function AuthFrame({ title, subtitle, children }) {
  return <div className="auth-shell"><section className="auth-visual"><div className="auth-brand"><div>E+</div><b>ESTUDA+</b></div><div className="auth-copy"><span>PLATAFORMA INTELIGENTE</span><h1>Planeje melhor. Estude com estratégia. Evolua com dados.</h1><p>Controle de estudos, planejamento semanal, edital, revisões, Anki e referências estratégicas em uma única conta.</p><ul><li><CheckCircle2/> Dados separados por usuário</li><li><CheckCircle2/> Acesso por assinatura</li><li><CheckCircle2/> Relatórios e planejamento inteligente</li></ul></div></section><section className="auth-panel"><div className="auth-box"><div className="auth-icon"><BookOpenCheck/></div><h2>{title}</h2><p>{subtitle}</p>{children}</div></section></div>
}

export function LoginPage() {
  const { user, signIn, demoMode } = useAuth(); const navigate = useNavigate()
  const [form, setForm] = useState({ email: demoMode ? 'demo@estudamais.app' : '', password: demoMode ? 'demonstracao' : '' })
  const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  if (user) return <Navigate to="/app" replace />
  const submit = async e => { e.preventDefault(); setBusy(true); setError(''); try { await signIn(form.email, form.password); navigate('/app') } catch (err) { setError(err.message) } finally { setBusy(false) } }
  return <AuthFrame title="Acesse sua conta" subtitle="Use seu e-mail e sua senha para continuar."><form onSubmit={submit} className="auth-form"><Toast message={error} tone="error"/><Field label="E-mail"><div className="input-icon"><Mail/><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></div></Field><Field label="Senha"><div className="input-icon"><LockKeyhole/><input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/></div></Field><div className="form-between"><label><input type="checkbox"/> Manter conectado</label><Link to="/recuperar-senha">Esqueci a senha</Link></div><Button disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</Button><p className="auth-switch">Ainda não tem conta? <Link to="/cadastro">Criar conta</Link></p>{demoMode && <div className="demo-hint">Modo demonstração ativo. Qualquer e-mail e senha não vazios permitem entrar.</div>}</form></AuthFrame>
}

export function RegisterPage() {
  const { signUp } = useAuth(); const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', consent: false })
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [tone, setTone] = useState('success')
  const submit = async e => { e.preventDefault(); if (form.password !== form.confirm) { setTone('error'); setMessage('As senhas não coincidem.'); return } if (!form.consent) { setTone('error'); setMessage('Aceite os Termos de Uso e a Política de Privacidade.'); return } setBusy(true); try { await signUp(form); setTone('success'); setMessage('Cadastro realizado. Verifique seu e-mail para confirmar a conta.'); setTimeout(() => navigate('/login'), 1400) } catch (err) { setTone('error'); setMessage(err.message) } finally { setBusy(false) } }
  return <AuthFrame title="Crie sua conta" subtitle="Comece seu planejamento inteligente."><form onSubmit={submit} className="auth-form"><Toast message={message} tone={tone}/><Field label="Nome completo"><div className="input-icon"><UserRound/><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></div></Field><Field label="E-mail"><div className="input-icon"><Mail/><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></div></Field><Field label="Senha"><div className="input-icon"><LockKeyhole/><input type="password" minLength="8" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/></div></Field><Field label="Confirmar senha"><input type="password" minLength="8" required value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}/></Field><label className="consent"><input type="checkbox" checked={form.consent} onChange={e => setForm({ ...form, consent: e.target.checked })}/> Concordo com os <Link to="/termos">Termos de Uso</Link> e a <Link to="/privacidade">Política de Privacidade</Link>.</label><Button disabled={busy}>{busy ? 'Criando...' : 'Criar conta'}</Button><p className="auth-switch">Já possui conta? <Link to="/login">Entrar</Link></p></form></AuthFrame>
}

export function RecoverPage() {
  const { resetPassword } = useAuth(); const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [tone, setTone] = useState('success')
  const submit = async e => { e.preventDefault(); try { await resetPassword(email); setTone('success'); setMessage('Enviamos as instruções de recuperação, caso o e-mail esteja cadastrado.') } catch (err) { setTone('error'); setMessage(err.message) } }
  return <AuthFrame title="Recuperar senha" subtitle="Informe seu e-mail para receber o link de redefinição."><form onSubmit={submit} className="auth-form"><Toast message={message} tone={tone}/><Field label="E-mail"><input type="email" required value={email} onChange={e => setEmail(e.target.value)}/></Field><Button>Enviar instruções</Button><p className="auth-switch"><Link to="/login">Voltar ao login</Link></p></form></AuthFrame>
}

export function UpdatePasswordPage() {
  const { updatePassword } = useAuth(); const [password, setPassword] = useState(''); const [message, setMessage] = useState('');
  return <AuthFrame title="Definir nova senha" subtitle="Crie uma senha forte com pelo menos oito caracteres."><form className="auth-form" onSubmit={async e => { e.preventDefault(); try { await updatePassword(password); setMessage('Senha alterada com sucesso.') } catch (err) { setMessage(err.message) } }}><Toast message={message}/><Field label="Nova senha"><input type="password" minLength="8" required value={password} onChange={e => setPassword(e.target.value)}/></Field><Button>Atualizar senha</Button></form></AuthFrame>
}

export function PlansPage() {
  const plans = [{ name: 'Mensal', price: 'R$ 29,90', period: '/mês' }, { name: 'Anual', price: 'R$ 299,00', period: '/ano', featured: true }]
  return <div className="public-page"><div className="public-nav"><Link to="/" className="public-brand">ESTUDA+</Link><div><Link to="/login">Entrar</Link><Link className="btn btn-primary" to="/cadastro">Começar</Link></div></div><header className="plans-hero"><span>PLANOS SIMPLES</span><h1>Estude com estratégia todos os dias</h1><p>Os valores são exemplos editáveis no painel administrativo.</p></header><div className="plans-grid">{plans.map(p => <section className={`plan-card ${p.featured ? 'featured' : ''}`} key={p.name}>{p.featured && <b className="plan-tag">Melhor escolha</b>}<h2>{p.name}</h2><div className="plan-price">{p.price}<small>{p.period}</small></div><ul><li>Planejamento completo</li><li>Relatórios e metas</li><li>Anki e TecConcursos</li><li>Backup dos dados</li></ul><Link className="btn btn-primary" to="/cadastro">Criar conta</Link></section>)}</div></div>
}

export function LegalPage({ type }) {
  const privacy = type === 'privacy'
  return <div className="legal-page"><Link to="/" className="public-brand">ESTUDA+</Link><h1>{privacy ? 'Política de Privacidade' : 'Termos de Uso'}</h1><p className="muted">Modelo inicial para revisão jurídica antes da publicação comercial.</p><h2>{privacy ? 'Tratamento de dados' : 'Uso da plataforma'}</h2><p>{privacy ? 'A plataforma armazena dados de cadastro e informações de estudo para prestar o serviço. O titular pode solicitar acesso, correção, exportação ou exclusão dos próprios dados.' : 'A conta é pessoal. O usuário é responsável pela segurança de sua senha e pelo uso adequado da plataforma. O acesso pode depender da situação da assinatura.'}</p><h2>Segurança e disponibilidade</h2><p>São adotados controles técnicos de acesso e isolamento por usuário. Nenhum sistema é isento de riscos, e rotinas de backup e monitoramento devem ser mantidas pelo operador.</p><h2>Contato</h2><p>Substitua este texto pelo canal oficial de atendimento e pelo responsável pelo tratamento de dados.</p></div>
}
