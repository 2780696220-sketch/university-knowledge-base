import { Link } from 'react-router-dom';
import { Calendar, Eye } from 'lucide-react';

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

export default function NewsCard({ article }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <Link
      to={`/news/${article.slug}`}
      className="card block hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
    >
      {/* 封面图 */}
      {article.coverImageUrl && (
        <div className="-mx-6 -mt-6 mb-4 rounded-t-xl overflow-hidden">
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* 分类 & 置顶 */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[article.category] || categoryColors.news}`}>
          {categoryLabels[article.category] || '新闻'}
        </span>
        {article.isPinned && (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
            置顶
          </span>
        )}
      </div>

      {/* 标题 */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
        {article.title}
      </h3>

      {/* 摘要 */}
      {article.summary && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{article.summary}</p>
      )}

      {/* 底部信息 */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(article.publishedAt)}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          {article.viewCount || 0}
        </span>
      </div>
    </Link>
  );
}
