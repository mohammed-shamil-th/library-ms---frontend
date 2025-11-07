'use client';

import Modal from './Modal';
import Button from './Button';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ padding: '1rem 0' }}>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>{message}</p>
        <div className="modal-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={loading}
            style={variant === 'danger' ? { backgroundColor: '#dc3545', borderColor: '#dc3545', color: '#fff' } : {}}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

