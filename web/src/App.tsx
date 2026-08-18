import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { MobileShell } from './components/MobileShell';
import { RequireAuth } from './components/RequireAuth';
import { Login } from './pages/Login';
import { Projects } from './pages/Projects';
import { Dashboard } from './pages/Dashboard';
import { Schedule } from './pages/Schedule';
import { MapView } from './pages/MapView';
import { Admin } from './pages/Admin';
import { Today } from './pages/mobile/Today';
import { Jobs } from './pages/mobile/Jobs';
import { MobileMap } from './pages/mobile/MobileMap';
import { More } from './pages/mobile/More';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Crew's mobile-optimized view — the URL they add to their home screen. */}
      <Route
        path="/m/*"
        element={
          <RequireAuth>
            <MobileShell>
              <Routes>
                <Route index element={<Navigate to="/m/today" replace />} />
                <Route path="today" element={<Today />} />
                <Route path="jobs" element={<Jobs />} />
                <Route path="map" element={<MobileMap />} />
                <Route path="more" element={<More />} />
                <Route path="*" element={<Navigate to="/m/today" replace />} />
              </Routes>
            </MobileShell>
          </RequireAuth>
        }
      />

      {/* Office/owner desktop app. */}
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
