import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import ImageUploader from '../../components/admin/ImageUploader';
import { Link } from 'react-router-dom';

const categories = [
  { value: 'announcement', label: '通知公告' },
  { value: 'news', label: '新闻动态' },
  { value: 'event', label: '校园活动' },
  { value: 'academic', label: '学术科研' },
];

export default function NewsEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    coverImageUrl: '',
    category: 'news',
    isPublished: false,
    isPinned: false,
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) return;

    api.get(`/news/admin/${id}`)
      .then((res) => {
        const data = res.data.data;
        setForm({
          title: data.title || '',
          summary: data.summary || '',
          content: data.content || '',
          coverImageUrl: data.coverImageUrl || '',
          category: data.category || 'news',
          isPublished: data.isPublished || false,
          isPinned: data.isPinned || false,
        });
      })
      .catch((err) => setError(err.response?.data?.message || '加载失败'))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleToggle = (field) => () => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('请输入新闻标题');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/news/admin/${id}`, form);
      } else {
        await api.post('/news/admin', form);
      }
      navigate('/admin/news');
    } catch (err) {
      setError(err.response?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner className="py-20" />;
  }

  return (
    <div>
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/news" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? '编辑新闻' : '发布新闻'}
            </h1>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? (
            '保存中...'
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" /> {isEditing ? '更新' : '发布'}
            </span>
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <input
                type="text"
                className="w-full text-2xl font-bold border-0 outline-none focus:ring-0 p-0"
                placeholder="新闻标题"
                value={form.title}
                onChange={handleChange('title')}
                autoFocus
              />
            </div>

            <div className="card">
              <label className="block text-sm font-medium text-gray-700 mb-2">摘要</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="简要描述（显示在新闻卡片中）"
                value={form.summary}
                onChange={handleChange('summary')}
              />
            </div>

            <div className="card">
              <label className="block text-sm font-medium text-gray-700 mb-2">正文内容</label>
              <textarea
                className="input-field font-mono text-sm"
                rows={20}
                placeholder="支持 HTML 标签，例如：&lt;p&gt;段落&lt;/p&gt; &lt;h2&gt;标题&lt;/h2&gt; &lt;img src='...' /&gt;"
                value={form.content}
                onChange={handleChange('content')}
              />
              <p className="text-xs text-gray-400 mt-2">
                提示：可以直接输入 HTML 代码来排版内容
              </p>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 发布状态 */}
            <div className="card space-y-4">
              <h3 className="font-semibold text-gray-900">发布设置</h3>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">发布状态</span>
                <button
                  type="button"
                  onClick={handleToggle('isPublished')}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isPublished ? 'bg-primary-600' : 'bg-gray-300'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isPublished ? 'translate-x-5' : ''}`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">置顶</span>
                <button
                  type="button"
                  onClick={handleToggle('isPinned')}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isPinned ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isPinned ? 'translate-x-5' : ''}`}
                  />
                </button>
              </label>
            </div>

            {/* 分类 */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">分类</h3>
              <select
                className="input-field"
                value={form.category}
                onChange={handleChange('category')}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* 封面图 */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">封面图片</h3>
              <ImageUploader
                currentUrl={form.coverImageUrl}
                onUpload={(url) => setForm((prev) => ({ ...prev, coverImageUrl: url }))}
                label="上传封面图"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
