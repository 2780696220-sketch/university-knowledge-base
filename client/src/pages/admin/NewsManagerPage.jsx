import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Edit3, Trash2, Eye, Pin, Search } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const categoryLabels = {
  announcement: '通知公告',
  news: '新闻动态',
  event: '校园活动',
  academic: '学术科研',
};

const categoryColors = {
  announcement: 'bg-red-100 text-red-700',
  news: 'bg-blue-100 text-blue-700',
  event: 'bg-green-100 text-green-700',
  academic: 'bg-purple-100 text-purple-700',
};

export default function NewsManagerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentStatus = searchParams.get('status') || '';
  const currentCategory = searchParams.get('category') || '';

  const fetchNews = useCallback(() => {
    setLoading(true);
    const params = { page: currentPage, limit: 20 };
    if (currentStatus) params.status = currentStatus;
    if (currentCategory) params.category = currentCategory;

    api.get('/news/admin/list', { params })
      .then((res) => {
        setArticles(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentPage, currentStatus, currentCategory]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/news/admin/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchNews();
    } catch (err) {
      alert(err.response?.data?.message || '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  const setFilter = (key, value) => {
    const params = { page: '1' };
    if (key === 'status' && value) params.status = value;
    else if (key === 'status') {
      if (currentCategory) params.category = currentCategory;
    } else if (key === 'category' && value) {
      params.category = value;
      if (currentStatus) params.status = currentStatus;
    } else {
      if (currentStatus) params.status = currentStatus;
      if (currentCategory) params.category = currentCategory;
    }
    setSearchParams(params);
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新闻管理</h1>
          <p className="text-gray-500 mt-1">共 {pagination.total} 篇</p>
        </div>
        <Link to="/admin/news/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> 发布新闻
        </Link>
      </div>

      {/* 筛选 */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={currentStatus}
          onChange={(e) => setFilter('status', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
        </select>
        <select
          value={currentCategory}
          onChange={(e) => setFilter('category', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">全部分类</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* 表格 */}
      {loading ? (
        <Spinner className="py-20" />
      ) : articles.length > 0 ? (
        <div className="card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">标题</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">分类</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">状态</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">日期</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">阅读</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((article) => (
                  <tr key={article._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {article.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500" />}
                        <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">
                          {article.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[article.category]}`}>
                        {categoryLabels[article.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${article.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {article.isPublished ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(article.publishedAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {article.viewCount || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/news/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                          title="预览"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <Link
                          to={`/admin/news/${article._id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(article)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
              <span className="text-sm text-gray-500">
                第 {pagination.page} / {pagination.pages} 页
              </span>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                  const start = Math.max(1, pagination.page - 2);
                  const page = start + i;
                  if (page > pagination.pages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => {
                        const params = { page: String(page) };
                        if (currentStatus) params.status = currentStatus;
                        if (currentCategory) params.category = currentCategory;
                        setSearchParams(params);
                      }}
                      className={`w-8 h-8 rounded text-sm font-medium
                        ${page === pagination.page ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">暂无新闻</p>
          <Link to="/admin/news/new" className="btn-primary mt-4 inline-block">
            发布第一篇新闻
          </Link>
        </div>
      )}

      {/* 删除确认 */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="删除新闻"
        message={`确定要删除「${deleteTarget?.title}」吗？此操作不可撤销。`}
        loading={deleting}
      />
    </div>
  );
}
