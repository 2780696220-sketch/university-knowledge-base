import { Building2 } from 'lucide-react';

// 省份到颜色的映射（确定性配色）
const provinceColors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500',
  'bg-red-500', 'bg-teal-500', 'bg-pink-500', 'bg-indigo-500',
  'bg-cyan-500', 'bg-orange-500', 'bg-emerald-500', 'bg-violet-500',
  'bg-rose-500', 'bg-sky-500', 'bg-lime-500', 'bg-fuchsia-500',
];

function getColorClass(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return provinceColors[Math.abs(hash) % provinceColors.length];
}

export default function UniversityCard({ university }) {
  const { name, logoUrl, province } = university;

  return (
    <div className="group rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex flex-col items-center text-center">
        {/* Logo 或首字图标 */}
        {logoUrl ? (
          <div className="w-16 h-16 mb-3 flex items-center justify-center">
            <img
              src={logoUrl}
              alt={name}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <div
            className={`w-14 h-14 rounded-xl ${getColorClass(
              province
            )} flex items-center justify-center mb-3 shadow-sm`}
          >
            <span className="text-white text-xl font-bold">
              {name.charAt(0)}
            </span>
          </div>
        )}

        {/* 校名 */}
        <p
          className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug"
          title={name}
        >
          {name}
        </p>

        {/* 省份 */}
        <p className="mt-1 text-xs text-gray-400">{province}</p>
      </div>
    </div>
  );
}
