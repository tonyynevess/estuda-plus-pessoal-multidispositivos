import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity, BarChart3, BookOpen, CalendarDays, ClipboardList, CreditCard, FileText,
  Focus, Gauge, GraduationCap, Layers3, LogOut, Menu, Settings, ShieldCheck,
  Target, UserRound, X, Zap,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Badge } from './UI'

const items = [
  ['/app', Gauge, 'Início', true], ['/app/atividades', Activity, 'Atividades'],
  ['/app/planejamento', CalendarDays, 'Planejamento'], ['/app/onde-focar', Focus, 'Onde focar'],
  ['/app/desempenho', BarChart3, 'Desempenho'], ['/app/edital', BookOpen, 'Edital'],
  ['/app/metas', Target, 'Metas'], ['/app/registros', ClipboardList, 'Registros'],
  ['/app/relatorios', FileText, 'Relatórios'], ['/app/revisoes', Layers3, 'Revisões'],
  ['/app/simulados', GraduationCap, 'Simulados'], ['/app/integracoes', Zap, 'Integrações'],
  ['/app/assinatura', CreditCard, 'Minha assinatura'], ['/app/configuracoes', Settings, 'Configurações'],
]

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const { profile, subscription, isAdmin, signOut, demoMode } = useAuth()
  const status = subscription?.status || 'sem plano'
  return <div className="app-shell">
    <button className="mobile-menu" onClick={() => setOpen(true)}><Menu /></button>
    {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand"><div className="brand-symbol">E+</div><div><b>ESTUDA+</b><span>Plataforma inteligente</span></div><button className="sidebar-close" onClick={() => setOpen(false)}><X /></button></div>
      <nav>{items.map(([to, Icon, label, end]) => <NavLink key={to} to={to} end={Boolean(end)} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={18}/><span>{label}</span></NavLink>)}
        {isAdmin && <NavLink to="/admin" onClick={() => setOpen(false)}><ShieldCheck size={18}/><span>Administração</span></NavLink>}
      </nav>
      <div className="sidebar-footer"><button onClick={signOut}><LogOut size={18}/> Sair</button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div><b>{profile?.contest_name || 'Seu concurso'}</b><span>{profile?.full_name || profile?.email}</span></div><div className="topbar-right">{demoMode && <Badge tone="yellow">Demonstração</Badge>}<Badge tone={['active','trial'].includes(status) ? 'green' : 'red'}>{status}</Badge><div className="avatar"><UserRound size={18}/></div></div></header>
      <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2 }}><Outlet /></motion.div>
    </main>
  </div>
}
