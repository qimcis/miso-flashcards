import React, { useState } from 'react';
import { Database } from '@/types/database';
import { RotateCcw, Clock, ThumbsUp, Rocket, RotateCw } from 'lucide-react';

type Flashcard = Database['public']['Tables']['flashcards']['Row'];

interface ReviewOption {
  name: string;
  interval: number;
  easeAdjustment: number;
  color: string;
  icon: React.ReactNode;
}

interface FlashcardReviewProps {
  card: Flashcard;
  totalCards: number;
  remainingCards: number;
  studiedToday: number;
  onReview: (review: {
    cardId: string;
    interval: number;
    ease: number;
    nextReview: Date;
  }) => void;
  onRestartStudy: () => void;
}

const REVIEW_OPTIONS: ReviewOption[] = [
  {
    name: 'Again',
    interval: 1,
    easeAdjustment: 0.15,
    color: 'bg-[#F04A4A]',
    icon: <RotateCcw size={16} />
  },
  {
    name: 'Hard',
    interval: 360,
    easeAdjustment: 0.85,
    color: 'px-3 lg:px-4 py-2 bg-[#1E1E1E] text-white rounded-lg hover:bg-[#2D2D2D] transition-colors flex items-center gap-2 text-sm font-medium border border-[#2D2D2D]',
    icon: <Clock size={16} />
  },
  {
    name: 'Good',
    interval: 600,
    easeAdjustment: 1.0,
    color: 'px-3 lg:px-4 py-2 bg-[#1E1E1E] text-white rounded-lg hover:bg-[#2D2D2D] transition-colors flex items-center gap-2 text-sm font-medium border border-[#2D2D2D]',
    icon: <ThumbsUp size={16} />
  },
  {
    name: 'Easy',
    interval: 4320,
    easeAdjustment: 1.3,
    color: 'bg-carpe_green',
    icon: <Rocket size={16} />
  }
];

const FlashcardReview: React.FC<FlashcardReviewProps> = ({
  card,
  totalCards,
  remainingCards,
  studiedToday,
  onReview,
  onRestartStudy
}) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const handleReview = (option: ReviewOption) => {
    const interval = card.interval || 1;
    const ease = card.ease_factor || 2.5;
    
    let newInterval: number;
    let newEase = Math.max(1.3, ease * option.easeAdjustment);

    if (option.name === 'Again') {
      newInterval = 1;
    } else if (option.name === 'Hard') {
      newInterval = interval * 1.2;
    } else if (option.name === 'Good') {
      newInterval = interval * ease;
    } else {
      newInterval = interval * ease * 1.3;
    }

    newInterval = Math.min(Math.max(1, Math.round(newInterval)), 36500);

    onReview({
      cardId: card.id,
      interval: newInterval,
      ease: newEase,
      nextReview: new Date(Date.now() + newInterval * 60 * 1000)
    });
    setShowAnswer(false);
  };

  //shiow completion screen if no remaining cards
  if (remainingCards === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto text-center">
        <div className="bg-[#151515] rounded-xl border border-[#2D2D2D] p-8 mb-6">
          <h2 className="text-xl text-gray-200 mb-4">Review Complete!</h2>
          <p className="text-gray-400 mb-6">Cards studied today: {studiedToday}</p>
          <button
            onClick={onRestartStudy}
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
      {/* progress display */}
      <div className="flex justify-center gap-4 mb-4 text-sm font-medium">
        <span className="text-[#F04A4A]">Remaining: {remainingCards}</span>
        <span className="text-carpe_green">Studied: {studiedToday}</span>
        <span className="text-gray-400">Total: {totalCards}</span>
      </div>

      {/* flashcard */}
      <div 
        onClick={() => setShowAnswer(!showAnswer)}
        className="w-full bg-[#151515] rounded-xl border border-[#2D2D2D] p-4 lg:p-12 
          mb-4 lg:mb-8 min-h-[300px] lg:min-h-[450px] flex flex-col items-center 
          justify-center text-center cursor-pointer hover:border-carpe_green transition-colors"
      >
        <div className="text-base lg:text-xl text-gray-200 mb-4">
          {showAnswer ? card.answer : card.question}
        </div>
        <div className="text-xs lg:text-sm text-carpe_green">
          Click to reveal {showAnswer ? 'question' : 'answer'}
        </div>
      </div>

      {/* review buttons */}
      <div className="flex gap-2 justify-center mt-4">
        {REVIEW_OPTIONS.map(option => (
          <button
            key={option.name}
            onClick={() => showAnswer && handleReview(option)}
            disabled={!showAnswer}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${option.color} 
              hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {option.icon}
            <span className="hidden sm:inline">{option.name}</span>
          </button>
        ))}
      </div>
      
      {/* interval display */}
      {card.interval && (
        <div className="text-center mt-4 text-sm text-gray-500">
          Current interval: {Math.round(card.interval)} minutes
        </div>
      )}
    </div>
  );
};

export default FlashcardReview;