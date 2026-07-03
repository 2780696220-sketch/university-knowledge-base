import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../common/Spinner';
import UniversityCard from './UniversityCard';

const provinces = [
  '全部',
  '北京',
  '天津',
  '河北',
  '山西',
  '内蒙古',
  '辽宁',
  '吉林',
  '黑龙江',
  '上海',
  '江苏',
  '浙江',
  '安徽',
  '福建',
  '江西',
  '山东',
  '河南',
  '湖北',
  '湖南',
  '广东',
  '广西',
  '海南',
  '重庆',
  '四川',
  '贵州',
  '云南',
  '西藏',
  '陕西',
  '甘肃',
  '青海',
  '宁夏',
  '新疆',
];

const types = [
  { value: '', label: '全部类型' },
  { value: '综合', label: '综合' },
  { value: '理工', label: '理工' },
  { value: '师范', label: '师范' },
  { value: '医药', label: '医药' },
  { value: '农林', label: '农林' },
  { value: '财经', label: '财经' },
  { value: '政法', label: '政法' },
  { value: '体育', label: '体育' },
  { value: '艺术', label: '艺术' },
  { value: '民族', label: '民族' },
  { value: '语言', label: '语言' },
  { value: '军事', label: '军事' },
];

const levels = [
  { value: '', label: '全部层次' },
  { value: '本科', label: '本科' },
  { value: '专科', label: '专科' },
];

export default function UniversitySection() {
  const [universities, setUniversities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [type, setType] = useState('');
  const [level, setLevel] = useState('');

  const debounceRef = useRef(null);

  const fetchUniversities = useCallback(() => {
    setLoading(true);
    setError('');

    const params = { page: 1, limit: 60 };
    if (search.trim()) params.search = search.trim();
    if (province) params.province = province;
    if (type) params.type = type;
    if (level) params.level = level;

    api
      .get('/universities', { params })
      .then((res) => {
        setUniversities(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch(() => setError('加载失败，请稍后重试'))
      .finally(() => setLoading(false));
  }, [search, province, type, level]);

  // 搜索防抖
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUniversities();
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [fetchUniversities]);

  const goToPage = (page) => {
    setLoading(true);
    const params = { page, limit: 60 };
    if (search.trim()) params.search = search.trim();
    if (province) params.province = province;
    if (type) params.type = type;
    if (level) params.level = level;

    api
      .get('/universities', { params })
      .then((res) => {
        setUniversities(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
        // 滚动到区域顶部
        document.getElementById('university-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <section id="university-section" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">全国高等院校</h2>
          <p className="text-gray-500 mt-1">
            共 {pagination.total} 所院校
          </p>
        </div>

        {/* 搜索 + 筛选 */}
        <div className="mb-8 space-y-4">
          {/* 搜索框 */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="搜索院校名称..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 省份筛选 */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {provinces.map((p) => (
              <button
                key={p}
                onClick={() => setProvince(p === '全部' ? '' : p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  (p === '全部' && !province) || p === province
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* 类型 + 层次 */}
          <div className="flex justify-center gap-3 flex-wrap">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {levels.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 内容区域 */}
        {loading ? (
          <Spinner className="py-12" />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchUniversities}
              className="mt-3 text-sm text-primary-600 hover:underline"
            >
              重试
            </button>
          </div>
        ) : universities.length > 0 ? (
          <>
            {/* 网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {universities.map((u) => (
                <UniversityCard key={u._id} university={u} />
              ))}
            </div>

            {/* 分页 */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-8">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                  const start = Math.max(1, Math.min(pagination.page - 3, pagination.pages - 6));
                  const page = start + i;
                  if (page > pagination.pages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === pagination.page
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">未找到匹配的院校</p>
            <button
              onClick={() => {
                setSearch('');
                setProvince('');
                setType('');
                setLevel('');
              }}
              className="mt-3 text-sm text-primary-600 hover:underline"
            >
              清除筛选
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
