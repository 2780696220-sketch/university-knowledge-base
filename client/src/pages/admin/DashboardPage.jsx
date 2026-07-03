import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Settings, Layout, Image, Building2 } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/news/admin/list', { params: { limit: 1 } }),
      api.get('/news/admin/list', { params: { limit: 1, status: 'draft' } }),
      api.get('/admin/media', { params: { limit: 1 } }),
      api.get('/settings'),
      api.get('/universities/admin/list', { params: { limit: 1 } }),
    ])
      .then(([publishedRes, draftRes, mediaRes, settingsRes, universitiesRes]) => {
        setStats({
          publishedNews: publishedRes.data.pagination?.total || 0,
          draftNews: draftRes.data.pagination?.total || 0,
          media: mediaRes.data.pagination?.total || 0,
          schoolName: settingsRes.data.settings?.schoolName || '未设置',
          universities: universitiesRes.data.pagination?.total || 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: '已发布新闻',
      value: stats?.publishedNews ?? '-',
      icon: Newspaper,
      color: 'bg-blue-500',
      link: '/admin/news',
    },
    {
      label: '草稿',
      value: stats?.draftNews ?? '-',
      icon: Layout,
      color: 'bg-amber-500',
      link: '/admin/news',
    },
    {
      label: '媒体文件',
      value: stats?.media ?? '-',
      icon: Image,
      color: 'bg-green-500',
      link: '/admin/news',
    },
    {
      label: '学校名称',
      value: stats?.schoolName || '-',
      icon: Settings,
      color: 'bg-purple-500',
      link: '/admin/settings',
    },
    {
      label: '院校数量',
      value: stats?.universities ?? '-',
      icon: Building2,
      color: 'bg-cyan-500',
      link: '/admin/universities',
    },
  ];

  if (loading) {
    return <Spinner className="py-20" />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">仪表盘</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} to={card.link} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`${card.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 truncate">{card.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 快捷操作 */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/news/new" className="btn-primary text-sm">
            发布新闻
          </Link>
          <Link to="/admin/settings" className="btn-secondary text-sm">
            修改站点设置
          </Link>
        </div>
      </div>
    </div>
  );
}
