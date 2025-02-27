import React from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#151515] rounded-lg p-6 max-w-md w-full border border-[#2D2D2D]">
        <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;