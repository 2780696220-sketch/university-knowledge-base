import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import NewsCard from '../../components/public/NewsCard';
import Spinner from '../../components/common/Spinner';
import api from '../../api/axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  { value: '', label: '全部' },
  { value: 'announcement', label: '通知公告' },
  { value: 'news', label: '新闻动态' },
  { value: 'event', label: '校园活动' },
  { value: 'academic', label: '学术科研' },
];

export default function NewsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('category') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    setLoading(true);
    api.get('/news', { params: { page: currentPage, limit: 9, category: currentCategory || undefined } })
      .then((res) => {
        setArticles(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentPage, currentCategory]);

  const handleCategoryChange = (category) => {
    if (category) {
      setSearchParams({ category, page: '1' });
    } else {
      setSearchParams({ page: '1' });
    }
  };

  const handlePageChange = (page) => {
    const params = { page: String(page) };
    if (currentCategory) params.category = currentCategory;
    setSearchParams(params);
    window.scrollTo(0, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">新闻动态</h1>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${currentCategory === cat.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 新闻列表 */}
      {loading ? (
        <Spinner className="py-20" />
      ) : articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <NewsCard key={article._id} article={article} />
            ))}
          </div>

          {/* 分页 */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors
                    ${page === currentPage
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= pagination.pages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">暂无新闻</p>
        </div>
      )}
    </div>
  );
}
