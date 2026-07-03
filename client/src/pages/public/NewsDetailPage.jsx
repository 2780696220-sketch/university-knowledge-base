import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { Calendar, Eye, ArrowLeft } from 'lucide-react';

const categoryLabels = {
  announcement: '通知公告',
  news: '新闻动态',
  event: '校园活动',
  academic: '学术科研',
};

export default function NewsDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/news/${slug}`)
      .then((res) => setArticle(res.data.data))
      .catch((err) => setError(err.response?.data?.message || '加载失败'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <Spinner className="min-h-screen py-20" />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 text-lg mb-4">{error}</p>
        <Link to="/news" className="btn-primary">返回新闻列表</Link>
      </div>
    );
  }

  if (!article) return null;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const sanitizedContent = DOMPurify.sanitize(article.content || '');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 返回链接 */}
      <Link
        to="/news"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> 返回新闻列表
      </Link>

      {/* 分类标签 */}
      <div className="mb-4">
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700">
          {categoryLabels[article.category] || '新闻'}
        </span>
      </div>

      {/* 标题 */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>

      {/* 元信息 */}
      <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {formatDate(article.publishedAt)}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          {article.viewCount || 0} 次阅读
        </span>
        {article.author && (
          <span>作者：{article.author.username}</span>
        )}
      </div>

      {/* 封面图 */}
      {article.coverImageUrl && (
        <img
          src={article.coverImageUrl}
          alt={article.title}
          className="w-full rounded-xl mb-8 object-cover max-h-96"
        />
      )}

      {/* 内容 */}
      <div
        className="prose prose-gray max-w-none
          prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary-600
          prose-img:rounded-xl prose-pre:bg-gray-900
          [&_p]:leading-relaxed [&_p]:mb-4
          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4
          [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
          [&_li]:mb-1
          [&_blockquote]:border-l-4 [&_blockquote]:border-primary-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600
          [&_img]:max-w-full [&_img]:h-auto"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      {/* 底部导航 */}
      <div className="mt-12 pt-8 border-t text-center">
        <Link to="/news" className="btn-primary">
          返回新闻列表
        </Link>
      </div>
    </div>
  );
}
