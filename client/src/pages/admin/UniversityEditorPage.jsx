import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import ImageUploader from '../../components/admin/ImageUploader';

const provinces = [
  '北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江',
  '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州',
  '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆',
];

const types = [
  '综合', '理工', '师范', '医药', '农林', '财经', '政法', '体育',
  '艺术', '民族', '语言', '军事',
];

export default function UniversityEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [form, setForm] = useState({
    name: '',
    province: '北京',
    city: '',
    type: '综合',
    level: '本科',
    website: '',
    logoUrl: '',
    is985: false,
    is211: false,
    isDoubleFirstClass: false,
    isPinned: false,
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) return;

    api.get(`/universities/admin/${id}`)
      .then((res) => {
        const data = res.data.data;
        setForm({
          name: data.name || '',
          province: data.province || '北京',
          city: data.city || '',
          type: data.type || '综合',
          level: data.level || '本科',
          website: data.website || '',
          logoUrl: data.logoUrl || '',
          is985: data.is985 || false,
          is211: data.is211 || false,
          isDoubleFirstClass: data.isDoubleFirstClass || false,
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

    if (!form.name.trim()) {
      setError('请输入院校名称');
      return;
    }
    if (!form.province) {
      setError('请选择省份');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/universities/admin/${id}`, form);
      } else {
        await api.post('/universities/admin', form);
      }
      navigate('/admin/universities');
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
          <Link to="/admin/universities" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? '编辑院校' : '添加院校'}
            </h1>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? (
            '保存中...'
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" /> {isEditing ? '更新' : '添加'}
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
                placeholder="院校名称"
                value={form.name}
                onChange={handleChange('name')}
                autoFocus
              />
            </div>

            <div className="card space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">所在城市</label>
                <input
                  className="input-field"
                  placeholder="如：海淀区"
                  value={form.city}
                  onChange={handleChange('city')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">官方网站</label>
                <input
                  className="input-field"
                  placeholder="https://www.xxx.edu.cn"
                  value={form.website}
                  onChange={handleChange('website')}
                />
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="card space-y-4">
              <h3 className="font-semibold text-gray-900">基本信息</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">省份</label>
                <select
                  className="input-field"
                  value={form.province}
                  onChange={handleChange('province')}
                >
                  {provinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <select
                  className="input-field"
                  value={form.type}
                  onChange={handleChange('type')}
                >
                  {types.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">层次</label>
                <select
                  className="input-field"
                  value={form.level}
                  onChange={handleChange('level')}
                >
                  <option value="本科">本科</option>
                  <option value="专科">专科</option>
                </select>
              </div>
            </div>

            {/* 标签开关 */}
            <div className="card space-y-4">
              <h3 className="font-semibold text-gray-900">标签</h3>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">985 工程</span>
                <button
                  type="button"
                  onClick={handleToggle('is985')}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.is985 ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is985 ? 'translate-x-5' : ''}`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">211 工程</span>
                <button
                  type="button"
                  onClick={handleToggle('is211')}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.is211 ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is211 ? 'translate-x-5' : ''}`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">双一流</span>
                <button
                  type="button"
                  onClick={handleToggle('isDoubleFirstClass')}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isDoubleFirstClass ? 'bg-purple-600' : 'bg-gray-300'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isDoubleFirstClass ? 'translate-x-5' : ''}`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">置顶</span>
                <button
                  type="button"
                  onClick={handleToggle('isPinned')}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isPinned ? 'bg-primary-600' : 'bg-gray-300'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isPinned ? 'translate-x-5' : ''}`}
                  />
                </button>
              </label>
            </div>

            {/* Logo 上传 */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">院校 Logo</h3>
              <ImageUploader
                currentUrl={form.logoUrl}
                onUpload={(url) => setForm((prev) => ({ ...prev, logoUrl: url }))}
                label="上传 Logo"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
