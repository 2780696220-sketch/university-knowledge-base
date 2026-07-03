import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import ImageUploader from '../../components/admin/ImageUploader';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { Save, CheckCircle } from 'lucide-react';

export default function SiteSettingsPage() {
  const { settings, loading } = useSiteSettings();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        schoolName: settings.schoolName || '',
        schoolNameEn: settings.schoolNameEn || '',
        tagline: settings.tagline || '',
        logoUrl: settings.logoUrl || '',
        faviconUrl: settings.faviconUrl || '',
        heroImageUrl: settings.heroImageUrl || '',
        primaryColor: settings.primaryColor || '#1d4ed8',
        secondaryColor: settings.secondaryColor || '#f59e0b',
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        address: settings.address || '',
        seoDescription: settings.seoDescription || '',
        footerText: settings.footerText || '',
      });
    }
  }, [settings]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
  };

  const handleUpload = (field) => (url) => {
    setForm((prev) => ({ ...prev, [field]: url }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', form);
      setSaved(true);
    } catch (err) {
      alert(err.response?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <Spinner className="py-20" />;
  }

  const fieldClass = 'space-y-2';
  const labelClass = 'block text-sm font-medium text-gray-700';
  const sectionClass = 'card';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">站点设置</h1>
          <p className="text-gray-500 mt-1">管理网站的基本信息、品牌外观和联系方式</p>
        </div>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? (
            '保存中...'
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" /> 保存设置
            </span>
          )}
        </Button>
      </div>

      {saved && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> 设置已保存
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={fieldClass}>
              <label className={labelClass}>学校名称（中文）</label>
              <input className="input-field" value={form.schoolName} onChange={handleChange('schoolName')} />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>学校名称（英文）</label>
              <input className="input-field" value={form.schoolNameEn} onChange={handleChange('schoolNameEn')} />
            </div>
            <div className={`${fieldClass} md:col-span-2`}>
              <label className={labelClass}>标语 / 校训</label>
              <input className="input-field" value={form.tagline} onChange={handleChange('tagline')} />
            </div>
          </div>
        </div>

        {/* 品牌外观 */}
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">品牌外观</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploader
              label="Logo 图片"
              currentUrl={form.logoUrl}
              onUpload={handleUpload('logoUrl')}
            />
            <ImageUploader
              label="网站图标 (Favicon)"
              currentUrl={form.faviconUrl}
              onUpload={handleUpload('faviconUrl')}
            />
            <ImageUploader
              label="首页 Hero 背景图"
              currentUrl={form.heroImageUrl}
              onUpload={handleUpload('heroImageUrl')}
            />
            <div>
              <div className={fieldClass}>
                <label className={labelClass}>主色调</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={handleChange('primaryColor')}
                    className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                  />
                  <input className="input-field w-32" value={form.primaryColor} onChange={handleChange('primaryColor')} />
                </div>
              </div>
              <div className={`${fieldClass} mt-4`}>
                <label className={labelClass}>辅色调</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.secondaryColor}
                    onChange={handleChange('secondaryColor')}
                    className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                  />
                  <input className="input-field w-32" value={form.secondaryColor} onChange={handleChange('secondaryColor')} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 联系方式 */}
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">联系方式</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={fieldClass}>
              <label className={labelClass}>联系邮箱</label>
              <input className="input-field" type="email" value={form.contactEmail} onChange={handleChange('contactEmail')} />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>联系电话</label>
              <input className="input-field" value={form.contactPhone} onChange={handleChange('contactPhone')} />
            </div>
            <div className={`${fieldClass} md:col-span-2`}>
              <label className={labelClass}>地址</label>
              <input className="input-field" value={form.address} onChange={handleChange('address')} />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">SEO 设置</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className={fieldClass}>
              <label className={labelClass}>SEO 描述</label>
              <textarea
                className="input-field"
                rows={2}
                value={form.seoDescription}
                onChange={handleChange('seoDescription')}
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>页脚文字</label>
              <input className="input-field" value={form.footerText} onChange={handleChange('footerText')} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
