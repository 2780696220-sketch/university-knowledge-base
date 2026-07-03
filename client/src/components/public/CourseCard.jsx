import { useState } from 'react';
import { Play, FileText, ExternalLink, Clock, User, Eye, BookOpen } from 'lucide-react';
import api from '../../api/axios';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import { formatPlayCount, formatDuration } from '../../utils/format';
import { categoryColors } from './majorColors';

export default function CourseCard({ course, category }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colorScheme = category === 'required'
    ? { bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-400', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' }
    : { bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-400', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' };

  const handleClick = async () => {
    setOpen(true);

    // Use cached detail if already fetched
    if (detail) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/courses/${course._id}`);
      setDetail(res.data.data);
    } catch {
      setError('加载课程详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const hasContent = detail && (detail.videos?.length > 0 || detail.books?.length > 0);

  return (
    <>
      {/* Clickable card */}
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-gray-700
          ${colorScheme.bg} ${colorScheme.border}
          hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 text-left w-full
          ${course.enriched ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${colorScheme.dot} flex-shrink-0`} />
        <span className="flex-1 truncate">{course.name}</span>
        {course.enriched && (
          <Play className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Detail Modal */}
      <Modal open={open} onClose={handleClose} title={course.name} size="xl">
        {loading ? (
          <Spinner className="py-8" />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError('');
                api.get(`/courses/${course._id}`)
                  .then((res) => { setDetail(res.data.data); setLoading(false); })
                  .catch(() => { setError('加载课程详情失败'); setLoading(false); });
              }}
              className="mt-2 text-sm text-primary-600 hover:underline"
            >
              重试
            </button>
          </div>
        ) : !hasContent ? (
          <div className="text-center py-8 text-sm text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            该课程暂未收录网课和教材
          </div>
        ) : (
          <div className="space-y-6">
            {/* B站网课 */}
            {detail.videos && detail.videos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Play className="w-4 h-4 text-pink-500" />
                  <h3 className="text-sm font-semibold text-gray-800">
                    B站网课
                    <span className="ml-1.5 text-xs text-gray-400 font-normal">
                      ({detail.videos.length} 个视频)
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detail.videos.map((v, i) => (
                    <a
                      key={v.bvid || i}
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-pink-200 hover:bg-pink-50/50 transition-all group"
                    >
                      {/* Thumbnail */}
                      <div className="w-32 h-18 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
                        {v.thumbnail ? (
                          <img
                            src={v.thumbnail}
                            alt={v.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full items-center justify-center bg-gray-100 ${v.thumbnail ? 'hidden' : 'flex'}`}
                        >
                          <Play className="w-6 h-6 text-gray-400" />
                        </div>
                        {v.duration && (
                          <span className="absolute bottom-0.5 right-0.5 px-1 py-0.5 text-[10px] bg-black/70 text-white rounded">
                            {formatDuration(v.duration)}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-pink-600 transition-colors">
                          {v.title}
                        </h4>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                          {v.author && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {v.author}
                            </span>
                          )}
                          {v.playCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatPlayCount(v.playCount)} 播放
                            </span>
                          )}
                        </div>
                      </div>

                      <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-pink-500 flex-shrink-0 mt-1 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 参考教材 */}
            {detail.books && detail.books.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-gray-800">
                    参考教材
                    <span className="ml-1.5 text-xs text-gray-400 font-normal">
                      ({detail.books.length} 本)
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detail.books.map((b, i) => (
                    <a
                      key={i}
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
                    >
                      {/* Book cover */}
                      <div className="w-14 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                        {b.cover ? (
                          <img
                            src={b.cover}
                            alt={b.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full items-center justify-center bg-gray-100 ${b.cover ? 'hidden' : 'flex'}`}>
                          <BookOpen className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>

                      {/* Book info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {b.title}
                        </h4>
                        {b.author && (
                          <p className="text-xs text-gray-400 mt-0.5">{b.author}</p>
                        )}
                        <div className="mt-1.5 flex items-center gap-2">
                          {b.extension && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded uppercase">
                              {b.extension}
                            </span>
                          )}
                          {b.year && (
                            <span className="text-[10px] text-gray-400">{b.year}</span>
                          )}
                          {b.publisher && (
                            <span className="text-[10px] text-gray-400 truncate">{b.publisher}</span>
                          )}
                        </div>
                      </div>

                      <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-500 flex-shrink-0 mt-1 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Course info footer */}
            <div className="pt-3 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400">
              <span className={`px-2 py-0.5 rounded-full ${colorScheme.badge}`}>
                {course.category}
              </span>
              <span>{course.majorCategory}</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
