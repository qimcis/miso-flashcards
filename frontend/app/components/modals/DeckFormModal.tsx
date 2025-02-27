import React, { useState } from 'react';
import Modal from './modal';
import { useDeckContext } from '../../contexts/DeckContext';

interface DeckFormModalProps {
  onClose: () => void;
}

const DeckFormModal: React.FC<DeckFormModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  
  const { createDeck } = useDeckContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDeck(formData.title, formData.description, formData.category);
    onClose();
  };

  return (
    <Modal title="Create New Collection" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-200">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg text-gray-200 focus:border-carpe_green transition-colors"
            required
            placeholder="Enter collection title"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-200">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg text-gray-200 focus:border-carpe_green transition-colors"
            required
            placeholder="Enter collection description"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-200">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full p-2 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg text-gray-200 focus:border-carpe_green transition-colors"
            required
            placeholder="Enter a category (e.g., Mathematics, Physics)"
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
            Create Collection
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DeckFormModal;