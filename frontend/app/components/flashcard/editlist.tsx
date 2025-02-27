import React, { useState } from 'react';
import { X, Pencil, Trash2 } from 'lucide-react';
import { useDeckContext } from '../../contexts/DeckContext';
import { Database } from '@/types/database';

type Flashcard = Database['public']['Tables']['flashcards']['Row'];

const FlashcardEditList = () => {
  const { flashcards, updateFlashcard, deleteFlashcard } = useDeckContext();
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const handleEditCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
  
    await updateFlashcard(
      editingCard.id,
      editingCard.question,
      editingCard.answer
    );
    setEditingCard(null);
  };
  
  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) return;
    await deleteFlashcard(cardId);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg lg:text-xl font-semibold text-white">Edit Flashcards</h2>
      </div>
      <div className="space-y-4">
        {flashcards.map((card) => (
          <div key={card.id} className="bg-[#151515] rounded-lg border border-[#2D2D2D] p-6">
            {editingCard?.id === card.id ? (
              <form onSubmit={handleEditCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">Question</label>
                  <textarea
                    value={editingCard.question}
                    onChange={(e) => setEditingCard({ ...editingCard, question: e.target.value })}
                    className="w-full p-2 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg text-gray-200 focus:border-carpe_green transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">Answer</label>
                  <textarea
                    value={editingCard.answer}
                    onChange={(e) => setEditingCard({ ...editingCard, answer: e.target.value })}
                    className="w-full p-2 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg text-gray-200 focus:border-carpe_green transition-colors"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCard(null)}
                    className="px-4 py-2 text-gray-300 hover:bg-[#1E1E1E] rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-carpe_green text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Question</h3>
                  <p className="text-gray-200">{card.question}</p>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Answer</h3>
                  <p className="text-gray-200">{card.answer}</p>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-2 text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={() => setEditingCard(card)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Pencil size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardEditList;