'use client'
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Folder } from 'lucide-react';
import Image from 'next/image';
import { flashcardService } from './lib/flashcard-service';
import { Database } from '../types/database';

type Deck = Database['public']['Tables']['decks']['Row'];
type Flashcard = Database['public']['Tables']['flashcards']['Row'];

interface ReviewOption {
  name: 'Hard' | 'Easy';
  color: string;
  factor: number;
}

const FlashcardApp = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [newCard, setNewCard] = useState({ question: '', answer: '' });
  const [showBulkGenerateForm, setShowBulkGenerateForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const reviewOptions: ReviewOption[] = [
    { name: 'Hard', color: 'bg-carpe_green', factor: 0 },
    { name: 'Easy', color: 'bg-carpe_green', factor: 3.5 },
  ];

  useEffect(() => {
    loadDecks();
  }, []);

  useEffect(() => {
    if (selectedDeck) {
      loadFlashcards(selectedDeck.id);
    }
  }, [selectedDeck]);

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeck || !subject) return;

    setIsGenerating(true);
    try {
      await flashcardService.addBulkCards(selectedDeck.id, subject);
      await loadFlashcards(selectedDeck.id);
      setSubject('');
      setShowBulkGenerateForm(false);
    } catch (error) {
      console.error('Error generating flashcards:', error);
    } finally {
      setIsGenerating(false);
    }
  };


  const loadDecks = async () => {
    try {
      const userId = 'test-user';
      const fetchedDecks = await flashcardService.getDecks(userId);
      setDecks(fetchedDecks);
      setLoading(false);
    } catch (error) {
      console.error('Error loading decks:', error);
      setDecks([]);
      setLoading(false);
    }
  };

  const loadFlashcards = async (deckId: string) => {
    try {
      const fetchedCards = await flashcardService.getFlashcardsByDeck(deckId);
      setFlashcards(fetchedCards);
      setCurrentCardIndex(0);
      setShowAnswer(false);
    } catch (error) {
      console.error('Error loading flashcards:', error);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeck) return;

    try {
      await flashcardService.createFlashcard(
        selectedDeck.id,
        newCard.question,
        newCard.answer
      );

      await loadFlashcards(selectedDeck.id);
      setNewCard({ question: '', answer: '' });
      setShowAddCardForm(false);
    } catch (error) {
      console.error('Error adding flashcard:', error);
    }
  };

  const handleReview = async (option: ReviewOption) => {
    if (!flashcards.length) return;

    const currentCard = flashcards[currentCardIndex];
    const newInterval = Math.ceil((currentCard.interval || 1) * option.factor);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    try {
      await flashcardService.updateFlashcardReview(
        currentCard.id,
        newInterval,
        currentCard.ease_factor * (option.factor > 0 ? 1.1 : 0.85),
        nextReview
      );

      const updatedFlashcards = flashcards.filter((_, index) => index !== currentCardIndex);
      setFlashcards(updatedFlashcards);
      
      if (updatedFlashcards.length > 0) {
        setCurrentCardIndex(currentCardIndex % updatedFlashcards.length);
      }
      setShowAnswer(false);
    } catch (error) {
      console.error('Error updating flashcard review:', error);
    }
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setShowAnswer(false);
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setShowAnswer(false);
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-carpe_green p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Image
            src="/carpe-diem-logo.png"
            alt="Carpe Diem Logo"
            width={400}
            height={128}
            className="object-contain"
          />
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search collections..."
            className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm"
          />
        </div>

        <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {decks.map((deck) => (
            <button
              key={deck.id}
              onClick={() => setSelectedDeck(deck)}
              className={`flex justify-between items-center px-3 py-2 rounded-lg text-left ${
                selectedDeck?.id === deck.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder size={16} className="text-carpe_green" />
                <span className="text-black">{deck.title}</span>
              </div>
              <span className="text-gray-400 text-sm">
                {selectedDeck?.id === deck.id ? flashcards.length : '—'}
              </span>
            </button>
          ))}
        </div>

        <button className="mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 py-2 px-3 rounded-lg hover:bg-gray-50">
          <Plus size={20} />
          <span>New Collection</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-8 flex-1 flex flex-col">
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex justify-between items-center mb-12">
              <div>
                <div className="text-sm text-blue-500 mb-2">{selectedDeck?.category}</div>
                <h1 className="text-4xl font-bold text-gray-900">{selectedDeck?.title}</h1>
              </div>
              {selectedDeck && (
                <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkGenerateForm(true)}
                  className="px-4 py-2 bg-carpe_green text-white rounded-lg hover:opacity-80 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Generate Cards
                </button>
                <button
                  onClick={() => setShowAddCardForm(true)}
                  className="px-4 py-2 bg-carpe_green text-white rounded-lg hover:opacity-80 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add
                </button>
              </div>
              )}
            </div>
          </div>

          {/* Add Card Form Modal */}
          {showAddCardForm && (
            <div className="fixed inset-0 bg-black text-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Add New Flashcard</h2>
                <form onSubmit={handleAddCard}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Question</label>
                    <textarea
                      value={newCard.question}
                      onChange={(e) => setNewCard(prev => ({ ...prev, question: e.target.value }))}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Answer</label>
                    <textarea
                      value={newCard.answer}
                      onChange={(e) => setNewCard(prev => ({ ...prev, answer: e.target.value }))}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCardForm(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-carpe_green text-white rounded-lg hover:opacity-80"
                    >
                      Add Card
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showBulkGenerateForm && (
            <div className="fixed inset-0 bg-black text-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Generate Flashcards</h2>
                <form onSubmit={handleBulkGenerate}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter a subject (e.g., 'Ancient Rome', 'JavaScript Basics')"
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBulkGenerateForm(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      disabled={isGenerating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:opacity-80 flex items-center gap-2"
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
              </div>
            </div>
          )}

          {/* Centered Flashcard Container */}
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
            {flashcards.length > 0 ? (
              <>
                {/* Flashcard */}
                <div 
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 mb-8 min-h-[300px] flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-200 transition-colors"
                >
                  <div className="text-xl text-gray-900 mb-4">
                    {showAnswer ? flashcards[currentCardIndex].answer : flashcards[currentCardIndex].question}
                  </div>
                  <div className="text-sm text-blue-500">
                    Click to reveal {showAnswer ? 'question' : 'answer'}
                  </div>
                </div>

                {/* Review buttons */}
                {showAnswer && (
                  <div className="flex gap-4 mb-8 w-full justify-center">
                    {reviewOptions.map((option) => (
                      <button
                        key={option.name}
                        onClick={() => handleReview(option)}
                        className={`px-6 py-2 rounded-lg text-white ${option.color} hover:opacity-90 transition-opacity`}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={previousCard}
                    disabled={currentCardIndex === 0}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={24} className="text-gray-600" />
                  </button>
                  <button
                    onClick={nextCard}
                    disabled={currentCardIndex === flashcards.length - 1}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={24} className="text-gray-600" />
                  </button>
                </div>
              </>
            ) : (
              <div className=" font-semibold text-center text-carpe_green text-2xl">
                {selectedDeck ? 'No cards in this deck' : 'Select a deck to start reviewing'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardApp;