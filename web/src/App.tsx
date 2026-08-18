import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { RequireAuth } from './components/RequireAuth';
import { Login } from './pages/Login';
import { Projects } from './pages/Projects';
import { Dashboard } from './pages/Dashboard';
import { Schedule } from './pages/Schedule';
import { MapView } from './pages/MapView';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppShell>
              <Routes>
                <Route index element={<Navigate to="/projects" replace />} />
                <Route path="projects" element={<Projects />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="map" element={<MapView />} />
                <Route path="admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/projects" replace />} />
              </Routes>
            </AppShell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
