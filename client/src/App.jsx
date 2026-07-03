import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/public/HomePage';
import NewsListPage from './pages/public/NewsListPage';
import NewsDetailPage from './pages/public/NewsDetailPage';
import NotFoundPage from './pages/public/NotFoundPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import SiteSettingsPage from './pages/admin/SiteSettingsPage';
import NewsManagerPage from './pages/admin/NewsManagerPage';
import NewsEditorPage from './pages/admin/NewsEditorPage';
import UniversityManagerPage from './pages/admin/UniversityManagerPage';
import UniversityEditorPage from './pages/admin/UniversityEditorPage';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/news" element={<NewsListPage />} />
        <Route path="/news/:slug" element={<NewsDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/settings" element={<SiteSettingsPage />} />
        <Route path="/admin/news" element={<NewsManagerPage />} />
        <Route path="/admin/news/new" element={<NewsEditorPage />} />
        <Route path="/admin/news/:id/edit" element={<NewsEditorPage />} />
        <Route path="/admin/universities" element={<UniversityManagerPage />} />
        <Route path="/admin/universities/new" element={<UniversityEditorPage />} />
        <Route path="/admin/universities/:id/edit" element={<UniversityEditorPage />} />
      </Route>
    </Routes>
  );
}
