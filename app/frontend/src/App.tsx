import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout'
import { Toaster } from 'sonner'
import LandingPage from './pages/LandingPage/LandingPage'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard/Dashboard'
import TeamManagement from './pages/TeamManagement/TeamManagement'
import ProjectsList from './pages/Projects/ProjectsList'
import CreateProjectWizard from './pages/Projects/CreateProjectWizard'
import ProjectDetailsOverview from './pages/Projects/ProjectDetails/ProjectDetails'
import KanbanPage from './pages/Projects/KanbanPage'
import TaskDetailsPage from './pages/Projects/TaskDetailsPage'
import ProjectAnalytics from './pages/Projects/ProjectAnalytics'
import AnalyticsHub from './pages/Projects/AnalyticsHub'
import Settings from './pages/Settings/Settings'

// ── Auth helpers ────────────────────────────────────────────────────
function isLoggedIn() {
  return !!localStorage.getItem('orchest_user_id')
}

// Redirect to /projects if already logged in
function GuestRoute({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? <Navigate to="/projects" replace /> : <>{children}</>
}

// Redirect to /login if not logged in
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />
}

// ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <Toaster position="top-right" theme="dark" closeButton richColors />

      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth pages — redirect to projects if already logged in */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <AuthPage mode="login" />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <AuthPage mode="register" />
            </GuestRoute>
          }
        />

        {/* Protected app routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="analytics" element={<AnalyticsHub />} />
                  <Route path="projects" element={<ProjectsList />} />
                  <Route path="projects/create" element={<CreateProjectWizard />} />
                  <Route path="projects/:projectId" element={<ProjectDetailsOverview />} />
                  <Route path="projects/:projectId/board" element={<KanbanPage />} />
                  <Route path="projects/:projectId/analytics" element={<ProjectAnalytics />} />
                  <Route path="projects/:projectId/tasks/:taskId" element={<TaskDetailsPage />} />
                  <Route path="team" element={<TeamManagement />} />
                  <Route path="settings" element={<Settings />} />
                  <Route
                    path="*"
                    element={
                      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-[900px] mx-auto">
                        <div className="w-16 h-16 rounded-full bg-error-container/10 flex items-center justify-center text-error mb-4">
                          <span className="material-symbols-outlined text-[32px]">error</span>
                        </div>
                        <h2 className="font-heading text-2xl font-bold mb-2">Page Not Found</h2>
                        <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
                          The page you are looking for does not exist or has been moved to another route.
                        </p>
                      </div>
                    }
                  />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}
