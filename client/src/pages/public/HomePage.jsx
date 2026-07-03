import { useState, useEffect } from 'react';
import HeroSection from '../../components/public/HeroSection';
import MajorSection from '../../components/public/MajorSection';
import NewsCard from '../../components/public/NewsCard';
import Spinner from '../../components/common/Spinner';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/news', { params: { page: 1, limit: 3 } })
      .then((res) => setLatestNews(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <HeroSection />

      {/* 大学本科专业目录 */}
      <MajorSection />

      {/* 最新新闻 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">最新动态</h2>
            <p className="text-gray-500 mt-1">了解学校的最新消息与活动</p>
          </div>
          <Link
            to="/news"
            className="hidden sm:flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            查看全部 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <Spinner className="py-12" />
        ) : latestNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((article) => (
              <NewsCard key={article._id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">暂无新闻</p>
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link to="/news" className="btn-primary inline-flex items-center gap-1">
            查看全部 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
