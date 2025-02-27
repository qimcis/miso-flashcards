import React, { useState } from 'react';
import Modal from './modal';
import { useDeckContext } from '../../contexts/DeckContext';

interface FlashcardFormModalProps {
  onClose: () => void;
  initialData?: { question: string; answer: string };
}

const FlashcardFormModal: React.FC<FlashcardFormModalProps> = ({ 
  onClose,
  initialData = { question: '', answer: '' }
}) => {
  const [formData, setFormData] = useState(initialData);
  const { createFlashcard } = useDeckContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFlashcard(formData.question, formData.answer);
    onClose();
  };

  return (
    <Modal title="Add New Flashcard" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-200">Question</label>
          <textarea
            value={formData.question}
            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
            className="w-full p-2 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg text-gray-200 focus:border-carpe_green transition-colors"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-200">Answer</label>
          <textarea
            value={formData.answer}
            onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
            className="w-full p-2 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg text-gray-200 focus:border-carpe_green transition-colors"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:bg-[#1E1E1E] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-carpe_green text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Add Card
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FlashcardFormModal;