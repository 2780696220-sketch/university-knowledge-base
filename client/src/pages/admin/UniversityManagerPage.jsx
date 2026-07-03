import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Edit3, Trash2, Building2, Search } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const provinces = [
  '',
  '北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江',
  '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州',
  '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆',
];

const typeLabels = {
  '综合': '综合', '理工': '理工', '师范': '师范', '医药': '医药',
  '农林': '农林', '财经': '财经', '政法': '政法', '体育': '体育',
  '艺术': '艺术', '民族': '民族', '语言': '语言', '军事': '军事',
};

export default function UniversityManagerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [universities, setUniversities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentProvince = searchParams.get('province') || '';
  const currentType = searchParams.get('type') || '';
  const currentLevel = searchParams.get('level') || '';
  const current985 = searchParams.get('is985') || '';
  const current211 = searchParams.get('is211') || '';
  const currentDFC = searchParams.get('isDoubleFirstClass') || '';
  const currentSearch = searchParams.get('search') || '';

  const fetchUniversities = useCallback(() => {
    setLoading(true);
    const params = { page: currentPage, limit: 20 };
    if (currentProvince) params.province = currentProvince;
    if (currentType) params.type = currentType;
    if (currentLevel) params.level = currentLevel;
    if (current985) params.is985 = current985;
    if (current211) params.is211 = current211;
    if (currentDFC) params.isDoubleFirstClass = currentDFC;
    if (currentSearch) params.search = currentSearch;

    api.get('/universities/admin/list', { params })
      .then((res) => {
        setUniversities(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentPage, currentProvince, currentType, currentLevel, current985, current211, currentDFC, currentSearch]);

  useEffect(() => { fetchUniversities(); }, [fetchUniversities]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/universities/admin/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchUniversities();
    } catch (err) {
      alert(err.response?.data?.message || '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">院校管理</h1>
          <p className="text-gray-500 mt-1">共 {pagination.total} 所院校</p>
        </div>
        <Link to="/admin/universities/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加院校
        </Link>
      </div>

      {/* 筛选 */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="搜索院校..."
          className="input-field w-48"
          value={currentSearch}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams);
            params.set('page', '1');
            if (e.target.value) params.set('search', e.target.value);
            else params.delete('search');
            setSearchParams(params);
          }}
        />
        <select
          value={currentProvince}
          onChange={(e) => setFilter('province', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">全部省份</option>
          {provinces.filter(Boolean).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={currentType}
          onChange={(e) => setFilter('type', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">全部类型</option>
          {Object.entries(typeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={currentLevel}
          onChange={(e) => setFilter('level', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">全部层次</option>
          <option value="本科">本科</option>
          <option value="专科">专科</option>
        </select>
        <select
          value={current985}
          onChange={(e) => setFilter('is985', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">985: 全部</option>
          <option value="true">985: 是</option>
        </select>
        <select
          value={current211}
          onChange={(e) => setFilter('is211', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">211: 全部</option>
          <option value="true">211: 是</option>
        </select>
        <select
          value={currentDFC}
          onChange={(e) => setFilter('isDoubleFirstClass', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">双一流: 全部</option>
          <option value="true">双一流: 是</option>
        </select>
      </div>

      {/* 表格 */}
      {loading ? (
        <Spinner className="py-20" />
      ) : universities.length > 0 ? (
        <div className="card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">院校名称</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">省份</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">类型</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">层次</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">标签</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {universities.map((uni) => (
                  <tr key={uni._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">
                        {uni.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{uni.province}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{uni.type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        uni.level === '本科' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {uni.level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {uni.is985 && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">985</span>
                        )}
                        {uni.is211 && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">211</span>
                        )}
                        {uni.isDoubleFirstClass && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">双一流</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/universities/${uni._id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(uni)}
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
                        const params = new URLSearchParams(searchParams);
                        params.set('page', String(page));
                        setSearchParams(params);
                      }}
                      className={`w-8 h-8 rounded text-sm font-medium ${
                        page === pagination.page ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                      }`}
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
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">暂未添加院校</p>
          <Link to="/admin/universities/new" className="btn-primary mt-4 inline-block">
            添加第一所院校
          </Link>
        </div>
      )}

      {/* 删除确认 */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="删除院校"
        message={`确定要删除「${deleteTarget?.name}」吗？此操作不可撤销。`}
        loading={deleting}
      />
    </div>
  );
}
