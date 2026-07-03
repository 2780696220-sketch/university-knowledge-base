import { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Settings, Newspaper, Image, Building2, Menu, X, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';

const sidebarLinks = [
  { to: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { to: '/admin/settings', label: '站点设置', icon: Settings },
  { to: '/admin/news', label: '新闻管理', icon: Newspaper },
  { to: '/admin/universities', label: '院校管理', icon: Building2 },
];

export default function AdminLayout() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const isActive = (path) => {
    if (path === '/admin/dashboard') return location.pathname === '/admin/dashboard';
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <Link to="/admin/dashboard" className="text-xl font-bold text-white">
          管理后台
        </Link>
        <p className="text-sm text-gray-400 mt-1">{user?.username}</p>
      </div>

      {/* 导航链接 */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive(link.to)
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
              <Icon className="w-5 h-5" />
              {link.label}
              {isActive(link.to) && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* 登出 */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          退出登录
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* 桌面侧边栏 */}
      <aside className="hidden lg:flex lg:w-64 bg-gray-800 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* 移动端侧边栏 */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gray-800 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* 主内容 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶栏 */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-gray-600">
              {user?.role === 'admin' ? '管理员' : '编辑'}
            </span>
            <Link to="/" target="_blank" className="text-sm text-primary-600 hover:text-primary-700">
              查看网站 →
            </Link>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
