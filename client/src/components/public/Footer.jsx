import { GraduationCap } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { settings } = useSiteSettings();
  const schoolName = settings?.schoolName || '大学云课堂';

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 学校信息 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt={schoolName} className="h-8 w-auto object-contain brightness-0 invert" />
              ) : (
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-lg font-bold text-white">{schoolName}</span>
            </div>
            {settings?.tagline && (
              <p className="text-sm text-gray-400 mb-3">{settings.tagline}</p>
            )}
            {settings?.address && (
              <p className="text-sm text-gray-400">📍 {settings.address}</p>
            )}
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-white font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">首页</Link></li>
              <li><Link to="/news" className="hover:text-white transition-colors">新闻动态</Link></li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h3 className="text-white font-semibold mb-4">联系我们</h3>
            <ul className="space-y-2 text-sm">
              {settings?.contactEmail && <li>📧 {settings.contactEmail}</li>}
              {settings?.contactPhone && <li>📞 {settings.contactPhone}</li>}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>{settings?.footerText || `© ${new Date().getFullYear()} ${schoolName}. All rights reserved.`}</p>
        </div>
      </div>
    </footer>
  );
}
