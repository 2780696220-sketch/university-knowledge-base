import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title || '确认操作'} size="sm">
      <p className="text-gray-600 mb-6">{message || '确定要执行此操作吗？'}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? '处理中...' : '确认'}
        </Button>
      </div>
    </Modal>
  );
}
