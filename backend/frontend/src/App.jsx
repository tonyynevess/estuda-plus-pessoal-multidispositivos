import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { AdminRoute, ProtectedRoute, SubscriptionRoute } from './components/RouteGuards'
import { LegalPage, LoginPage, PlansPage, RecoverPage, RegisterPage, UpdatePasswordPage } from './pages/AuthPages'
import { ActivitiesPage, DashboardPage, FocusPage, PlanningPage } from './pages/StudyPages'
import {
  AdminPage, ExamsPage, GoalsPage, IntegrationsPage, OnboardingPage, PerformancePage,
  RecordsPage, ReportsPage, ReviewsPage, SettingsPage, SubscriptionPage, SyllabusPage,
} from './pages/OtherPages'

export default function App() {
  return <Routes>
    <Route path="/" element={<Navigate to="/planos" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/cadastro" element={<RegisterPage />} />
    <Route path="/recuperar-senha" element={<RecoverPage />} />
    <Route path="/atualizar-senha" element={<UpdatePasswordPage />} />
    <Route path="/planos" element={<PlansPage />} />
    <Route path="/termos" element={<LegalPage type="terms" />} />
    <Route path="/privacidade" element={<LegalPage type="privacy" />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route element={<AppLayout />}>
        <Route path="/app/assinatura" element={<SubscriptionPage />} />
        <Route path="/app/configuracoes" element={<SettingsPage />} />
        <Route element={<SubscriptionRoute />}>
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/atividades" element={<ActivitiesPage />} />
          <Route path="/app/planejamento" element={<PlanningPage />} />
          <Route path="/app/onde-focar" element={<FocusPage />} />
          <Route path="/app/desempenho" element={<PerformancePage />} />
          <Route path="/app/edital" element={<SyllabusPage />} />
          <Route path="/app/metas" element={<GoalsPage />} />
          <Route path="/app/registros" element={<RecordsPage />} />
          <Route path="/app/relatorios" element={<ReportsPage />} />
          <Route path="/app/revisoes" element={<ReviewsPage />} />
          <Route path="/app/simulados" element={<ExamsPage />} />
          <Route path="/app/integracoes" element={<IntegrationsPage />} />
        </Route>
      </Route>
      <Route element={<AdminRoute />}><Route path="/admin" element={<AppLayout />}><Route index element={<AdminPage />} /></Route></Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
