import React from 'react';
import { RotateCw } from 'lucide-react';
import { useDeckContext } from '../../contexts/DeckContext';
import FlashcardReview from '../flashcard-review';

const FlashcardReviewContainer = () => {
  const { 
    selectedDeck, 
    flashcards, 
    studiedToday, 
    reviewFlashcard,
    loadFlashcards 
  } = useDeckContext();

  if (!selectedDeck) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8 bg-[#151515] rounded-xl border border-[#2D2D2D] max-w-md w-full">
          <h2 className="text-xl text-gray-200 mb-4">
            Select a deck to start reviewing
          </h2>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8 bg-[#151515] rounded-xl border border-[#2D2D2D] max-w-md w-full">
          <h2 className="text-xl text-gray-200 mb-4">All caught up!</h2>
          <p className="text-gray-400 mb-6">
            You've reviewed {studiedToday} cards today. Great job!
          </p>
          <button
            onClick={() => {
              if (selectedDeck) {
                loadFlashcards(selectedDeck.id);
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-carpe_green text-white rounded-lg hover:opacity-90 transition-opacity mx-auto"
          >
            <RotateCw size={18} />
            <span>Study Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <FlashcardReview
        card={flashcards[0]}
        totalCards={flashcards.length + studiedToday}
        remainingCards={flashcards.length}
        studiedToday={studiedToday}
        onReview={async (reviewData) => {
          await reviewFlashcard(
            reviewData.cardId,
            reviewData.interval,
            reviewData.ease,
            reviewData.nextReview
          );
        }}
        onRestartStudy={async () => {
          if (selectedDeck) {
            await loadFlashcards(selectedDeck.id);
          }
        }}
      />
    </div>
  );
};

export default FlashcardReviewContainer;
