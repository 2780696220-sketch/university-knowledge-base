import { GraduationCap } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function HeroSection() {
  const { settings, loading } = useSiteSettings();

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 h-96 animate-pulse" />
    );
  }

  const schoolName = settings?.schoolName || '大学云课堂';
  const schoolNameEn = settings?.schoolNameEn || '';
  const tagline = settings?.tagline || '追求卓越，知行合一';

  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      {/* 背景图片（如果设置了） */}
      {settings?.heroImageUrl && (
        <div className="absolute inset-0">
          <img
            src={settings.heroImageUrl}
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
        </div>
      )}

      {/* 内容 */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={schoolName}
                className="h-24 w-auto object-contain drop-shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-4 ring-white/30">
                <GraduationCap className="w-14 h-14 text-white" />
              </div>
            )}
          </div>

          {/* 校名 */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3 tracking-tight">
            {schoolName}
          </h1>
          {schoolNameEn && (
            <p className="text-lg md:text-xl text-primary-200 mb-4 font-light tracking-wider">
              {schoolNameEn}
            </p>
          )}

          {/* 标语 */}
          <p className="text-xl md:text-2xl text-white/80 font-light mb-8 max-w-2xl mx-auto">
            {tagline}
          </p>

          {/* 装饰分隔线 */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-0.5 bg-white/40" />
            <div className="w-2 h-2 bg-white/60 rounded-full" />
            <div className="w-12 h-0.5 bg-white/40" />
          </div>
        </div>
      </div>
    </section>
  );
}
