import { Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout'
import { Toaster } from 'sonner'
import LandingPage from './pages/LandingPage/LandingPage'
import Dashboard from './pages/Dashboard/Dashboard'
import TeamManagement from './pages/TeamManagement/TeamManagement'
import ProjectsList from './pages/Projects/ProjectsList'
import ProjectDetailsOverview from './pages/Projects/ProjectDetails/ProjectDetails'

export default function App() {
  return (
    <>
      <Toaster position="top-right" theme="dark" closeButton richColors />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="projects" element={<ProjectsList />} />
                <Route path="projects/:projectId" element={<ProjectDetailsOverview />} />
                <Route path="team" element={<TeamManagement />} />
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
          }
        />
      </Routes>
    </>
  )
}
