import React from 'react';
import Modal from './modal';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmButtonClass = 'bg-carpe_green',
  onConfirm,
  onCancel
}) => {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="text-[#8F9BA8] mb-6 break-words">
        <p>{message}</p>
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-[#8F9BA8] hover:bg-[#2D2D2D] rounded-lg transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 ${confirmButtonClass} text-white rounded-lg hover:opacity-90 transition-opacity`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;