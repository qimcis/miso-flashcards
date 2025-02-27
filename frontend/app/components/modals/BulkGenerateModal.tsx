import React, { useState } from 'react';
import { useDeckContext } from '../../contexts/DeckContext';
import Modal from './modal';
import { flashcardService } from '@/app/lib/flashcard-service';

interface BulkGenerateModalProps {
  onClose: () => void;
}

const BulkGenerateModal: React.FC<BulkGenerateModalProps> = ({ onClose }) => {
  const [subject, setSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedDeck, loadFlashcards } = useDeckContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeck || !subject) return;

    setIsGenerating(true);
    try {
      await flashcardService.addBulkCards(selectedDeck.id, subject);
      await loadFlashcards(selectedDeck.id);
      onClose();
    } catch (error) {
      console.error('Error generating flashcards:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal title="Generate Flashcards" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-200">Subject</label>
          <input 
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter a subject (e.g., 'Ancient Rome', 'JavaScript Basics')"
            className="w-full p-2 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg text-gray-200 focus:border-carpe_green transition-colors"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:bg-[#1E1E1E] rounded-lg transition-colors"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-carpe_green text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">↻</span>
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BulkGenerateModal;