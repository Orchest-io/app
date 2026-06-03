import { Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout";
import { Toaster } from "sonner";
import LandingPage from "./pages/LandingPage/LandingPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import TeamManagement from "./pages/TeamManagement/TeamManagement";
import ProjectsList from "./pages/Projects/ProjectsList";
import ProjectDetailsOverview from "./pages/Projects/ProjectDetails/ProjectDetails";
import CreateProject from "./pages/Projects/CreateProject";
import ProjectSrttings from "./pages/Projects/ProjectSettings";
import ProjectMembers from "./pages/Projects/ProjectMembers";

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

                <Route path="projects/create" element={<CreateProject />} />
                <Route path="projects/:projectId" element={<ProjectDetailsOverview />} />
                <Route path="projects/:projectId/members" element={<ProjectMembers />} />
                <Route path="projects/:projectId/settings" element={<ProjectSrttings />} />

                <Route path="team" element={<TeamManagement />} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </>
  );
}
