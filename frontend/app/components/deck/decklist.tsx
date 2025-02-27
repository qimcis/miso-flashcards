import React from 'react';
import { Folder, Trash2 } from 'lucide-react';
import { useDeckContext } from '../../contexts/DeckContext';
import ConfirmModal from '../modals/ConfirmModal';
import { useState } from 'react';

interface DeckListProps {
  isHovered: boolean;
  onItemClick: () => void;
}

const DeckList: React.FC<DeckListProps> = ({ isHovered, onItemClick }) => {
  const { decks, selectedDeck, setSelectedDeck, deleteDeck } = useDeckContext();
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);

  const truncateString = (str: string, maxLength: number = 10) => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  };

  const handleDeleteClick = (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeckToDelete(deckId);
  };

  const handleConfirmDelete = async () => {
    if (deckToDelete) {
      await deleteDeck(deckToDelete);
      setDeckToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-0.5 px-2">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="flex items-center group"
          >
            <button
              onClick={() => {
                setSelectedDeck(deck);
                onItemClick();
              }}
              className={`flex-1 flex items-center px-2 py-2 rounded-lg text-left transition-colors ${
                selectedDeck?.id === deck.id
                  ? 'text-white'
                  : 'text-gray-300 hover:bg-[#1E1E1E] hover:text-white'
              }`}
            >
              <Folder size={16} className={`flex-shrink-0 ${
                selectedDeck?.id === deck.id ? 'text-carpe_green' : 'text-gray-400'
              }`} />
              {isHovered && (
                <div className="ml-2 flex-1 flex items-center justify-between">
                  <span className="text-sm">{truncateString(deck.title)}</span>
                  <span className="ml-2 text-xs text-gray-500">—</span>
                </div>
              )}
            </button>
            {isHovered && (
              <button
                onClick={(e) => handleDeleteClick(deck.id, e)}
                className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete deck"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deckToDelete && (
        <ConfirmModal
          title="Delete Collection"
          message="Are you sure you want to delete this collection? This action cannot be undone and will delete all flashcards in this collection."
          confirmLabel="Delete"
          confirmButtonClass="bg-[#F04A4A]"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeckToDelete(null)}
        />
      )}
    </>
  );
};

export default DeckList;