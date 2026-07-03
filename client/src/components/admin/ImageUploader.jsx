import { useState, useRef } from 'react';
import { Upload, X, ImagePlus } from 'lucide-react';
import api from '../../api/axios';

export default function ImageUploader({ currentUrl, onUpload, label = '上传图片' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || '');
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 前端预览
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError('');

    // 上传
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const res = await api.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.data.length > 0) {
        const url = res.data.data[0].url;
        onUpload(url);
        setPreview(url);
      }
    } catch (err) {
      setError(err.response?.data?.message || '上传失败');
      if (!currentUrl) setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onUpload('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="预览"
            className="h-32 rounded-lg border border-gray-200 object-contain bg-gray-50"
          />
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg
                     hover:border-primary-400 hover:bg-primary-50/50 transition-colors text-gray-500"
        >
          <ImagePlus className="w-5 h-5" />
          <span>{uploading ? '上传中...' : label}</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
