import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronLeft, GraduationCap, BookOpen, ArrowRight, FileText } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../common/Spinner';
import CourseCard from './CourseCard';

// Color palette for 14 学科门类
const categoryColors = {
  '哲学': { bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  '经济学': { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  '法学': { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  '教育学': { bg: 'bg-sky-500', light: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  '文学': { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  '历史学': { bg: 'bg-stone-500', light: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200' },
  '理学': { bg: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  '工学': { bg: 'bg-cyan-600', light: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  '农学': { bg: 'bg-green-600', light: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  '医学': { bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  '管理学': { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  '艺术学': { bg: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  '交叉学科': { bg: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
};

const defaultColor = { bg: 'bg-gray-500', light: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };

export default function MajorSection() {
  // Navigation state
  const [viewLevel, setViewLevel] = useState('categories'); // 'categories' | 'classes' | 'majors'
  const [currentCategory, setCurrentCategory] = useState(null); // 当前选中的学科门类
  const [currentClass, setCurrentClass] = useState(null);       // 当前选中的专业类

  // Data
  const [categories, setCategories] = useState([]);
  const [classes, setClasses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [courses, setCourses] = useState({ required: [], elective: [] });
  const [activeTab, setActiveTab] = useState('majors'); // 'majors' | 'courses'

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const debounceRef = useRef(null);

  // Fetch categories on mount
  useEffect(() => {
    setLoading(true);
    api
      .get('/majors/categories')
      .then((res) => setCategories(res.data.data || []))
      .catch(() => setError('加载失败，请稍后重试'))
      .finally(() => setLoading(false));
  }, []);

  // Navigate to classes view
  const goToClasses = (category) => {
    setCurrentCategory(category);
    setViewLevel('classes');
    setLoading(true);
    setError('');
    api
      .get('/majors', { params: { parent: category._id } })
      .then((res) => setClasses(res.data.data || []))
      .catch(() => setError('加载失败'))
      .finally(() => setLoading(false));
  };

  // Navigate to majors view
  const goToMajors = (cls) => {
    setCurrentClass(cls);
    setViewLevel('majors');
    setActiveTab('majors');
    setLoading(true);
    setError('');
    api
      .get('/majors', { params: { parent: cls._id } })
      .then((res) => setMajors(res.data.data || []))
      .catch(() => setError('加载失败'))
      .finally(() => setLoading(false));

    // Fetch courses in parallel
    api
      .get('/courses', { params: { parent: cls._id } })
      .then((res) => setCourses(res.data.data || { required: [], elective: [] }))
      .catch(() => {});
  };

  // Go back to categories
  const goToCategories = () => {
    setViewLevel('categories');
    setCurrentCategory(null);
    setCurrentClass(null);
    setClasses([]);
    setMajors([]);
    setLoading(false);
  };

  // Go back to classes
  const goBack = () => {
    if (viewLevel === 'majors') {
      setViewLevel('classes');
      setCurrentClass(null);
      setMajors([]);
      setCourses({ required: [], elective: [] });
      setActiveTab('majors');
      setLoading(false);
    } else if (viewLevel === 'classes') {
      goToCategories();
    }
  };

  // Search with debounce
  const handleSearch = useCallback(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    api
      .get('/majors/search', { params: { q: search.trim() } })
      .then((res) => setSearchResults(res.data.data || []))
      .catch(() => {})
      .finally(() => setSearching(false));
  }, [search]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceRef.current);
  }, [handleSearch]);

  const getColor = (name) => categoryColors[name] || defaultColor;

  return (
    <section id="major-section" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">大学本科专业目录</h2>
          <p className="text-gray-500 mt-1">
            {viewLevel === 'categories'
              ? `${categories.length} 个学科门类`
              : `${currentCategory?.classCount || classes.length} 个专业类`}
          </p>
        </div>

        {/* 搜索框 */}
        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="搜索专业名称..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 搜索结果 */}
        {search.trim() && (
          <div className="mb-6">
            {searching ? (
              <Spinner className="py-4" />
            ) : searchResults.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-4 max-h-80 overflow-y-auto">
                <p className="text-sm text-gray-500 mb-3">找到 {searchResults.length} 个结果</p>
                <div className="space-y-2">
                  {searchResults.map((r) => {
                    const color = getColor(r.category);
                    return (
                      <div key={r._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${color.light} ${color.text}`}>
                          {r.level === '门类' ? '门类' : r.level === '专业类' ? '专业类' : '专业'}
                        </span>
                        <span className="text-sm text-gray-700">{r.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">{r.code}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-gray-400 py-4">未找到匹配的专业</p>
            )}
          </div>
        )}

        {/* 面包屑导航 */}
        {viewLevel !== 'categories' && !search.trim() && (
          <div className="flex items-center gap-2 mb-6 text-sm">
            <button
              onClick={goToCategories}
              className="text-gray-500 hover:text-primary-600 transition-colors"
            >
              全部学科
            </button>
            {currentCategory && (
              <>
                <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
                <button
                  onClick={goToCategories}
                  className="text-primary-600 font-medium"
                >
                  {currentCategory.name}
                </button>
              </>
            )}
            {currentClass && (
              <>
                <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
                <span className="text-primary-600 font-medium">{currentClass.name}</span>
              </>
            )}
          </div>
        )}

        {/* 返回按钮 */}
        {viewLevel !== 'categories' && !search.trim() && (
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            返回上一级
          </button>
        )}

        {/* 内容区域 */}
        {loading ? (
          <Spinner className="py-12" />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => {
                if (viewLevel === 'categories') {
                  setLoading(true);
                  api.get('/majors/categories')
                    .then((res) => setCategories(res.data.data || []))
                    .catch(() => {})
                    .finally(() => setLoading(false));
                }
              }}
              className="mt-3 text-sm text-primary-600 hover:underline"
            >
              重试
            </button>
          </div>
        ) : !search.trim() && (
          <>
            {/* ===== 门类视图 ===== */}
            {viewLevel === 'categories' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
                {categories.map((cat) => {
                  const color = getColor(cat.name);
                  return (
                    <button
                      key={cat._id}
                      onClick={() => goToClasses(cat)}
                      className={`group rounded-xl border ${color.border} bg-white p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
                    >
                      <div className={`${color.bg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {cat.classCount} 个专业类
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ===== 专业类视图 ===== */}
            {viewLevel === 'classes' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {classes.map((cls) => {
                  const color = getColor(currentCategory?.name);
                  return (
                    <button
                      key={cls._id}
                      onClick={() => goToMajors(cls)}
                      className={`group rounded-xl border ${color.border} bg-white p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-2">
                            {cls.name}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            {cls.code} · {cls.majorCount || 0} 个专业
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 flex-shrink-0 mt-0.5 transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ===== 具体专业视图（标签切换） ===== */}
            {viewLevel === 'majors' && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Tab 切换栏 */}
                <div className="flex border-b border-gray-100">
                  <button
                    onClick={() => setActiveTab('majors')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === 'majors'
                        ? 'text-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                    专业列表
                    <span className="ml-1.5 text-xs text-gray-400">({majors.length})</span>
                    {activeTab === 'majors' && (
                      <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary-500 rounded-full" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === 'courses'
                        ? 'text-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                    课程设置
                    <span className="ml-1.5 text-xs text-gray-400">
                      ({courses.required.length + courses.elective.length})
                    </span>
                    {activeTab === 'courses' && (
                      <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary-500 rounded-full" />
                    )}
                  </button>
                </div>

                {/* 专业列表 Tab */}
                {activeTab === 'majors' && (
                  <div className="divide-y divide-gray-50">
                    {majors.length === 0 ? (
                      <div className="px-4 py-12 text-center text-sm text-gray-400">
                        暂无具体专业信息
                      </div>
                    ) : (
                      majors.map((major) => (
                        <div
                          key={major._id}
                          className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-4 h-4 text-gray-300 flex-shrink-0" />
                            <span className="text-sm text-gray-800">{major.name}</span>
                          </div>
                          <span className="text-xs text-gray-400 font-mono">{major.code}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 课程设置 Tab */}
                {activeTab === 'courses' && (
                  <div className="p-4 space-y-5">
                    {/* 专业课 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <h4 className="text-sm font-semibold text-gray-800">专业课</h4>
                        <span className="text-xs text-gray-400">({courses.required.length} 门)</span>
                      </div>
                      {courses.required.length === 0 ? (
                        <p className="text-sm text-gray-400 pl-4">暂无专业课信息</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {courses.required.map((c, i) => (
                            <CourseCard key={c._id || i} course={c} category="required" />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 选修课 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <h4 className="text-sm font-semibold text-gray-800">选修课</h4>
                        <span className="text-xs text-gray-400">({courses.elective.length} 门)</span>
                      </div>
                      {courses.elective.length === 0 ? (
                        <p className="text-sm text-gray-400 pl-4">暂无选修课信息</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {courses.elective.map((c, i) => (
                            <CourseCard key={c._id || i} course={c} category="elective" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
