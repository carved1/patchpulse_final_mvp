import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPage from './pages/AdminPage';
import BrowsePage from './pages/BrowsePage';
import CveDetailPage from './pages/CveDetailPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import WatchlistPage from './pages/WatchlistPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="cves" element={<BrowsePage />} />
          <Route path="cves/:cveId" element={<CveDetailPage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
          <Route
            path="admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
