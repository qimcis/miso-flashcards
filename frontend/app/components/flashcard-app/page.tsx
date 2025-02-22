'use client'
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Folder, Search, LogOut, Pencil, X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { flashcardService } from '../../lib/flashcard-service';
import { Database } from '@/types/database';
import { useAuth } from '@/app/contexts/AuthContext';

type Deck = Database['public']['Tables']['decks']['Row'];
type Flashcard = Database['public']['Tables']['flashcards']['Row'];

interface ReviewOption {
  name: 'Hard' | 'Easy';
  color: string;
  factor: number;
}

interface DeckFormData {
  title: string;
  description: string;
  category: string;
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
  const [showNewDeckForm, setShowNewDeckForm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showEditMode, setShowEditMode] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const { user } = useAuth();
  const { signOut } = useAuth();

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
      if (!user?.id) return;
      const fetchedDecks = await flashcardService.getDecks(user.id);
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

  const [newDeck, setNewDeck] = useState<DeckFormData>({
    title: '',
    description: '',
    category: ''
  });

  const handleCreateDeck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) return;
    
    try {
      await flashcardService.createDeck(
        newDeck.title,
        newDeck.description,
        newDeck.category,
        user.id
      );
      await loadDecks();
      setNewDeck({ title: '', description: '', category: '' });
      setShowNewDeckForm(false);
    } catch (error) {
      console.error('Error creating deck:', error);
    }
  };

  const handleEditCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
  
    try {
      const updatedCard = await flashcardService.editFlashcard(
        editingCard.id,
        editingCard.question,
        editingCard.answer
      );
  
      setFlashcards(flashcards.map(card => 
        card.id === editingCard.id ? updatedCard : card
      ));
      setEditingCard(null);
    } catch (error) {
      console.error('Error updating flashcard:', error);
    }
  };
  
  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) return;
  
    try {
      await flashcardService.deleteFlashcard(cardId);
      setFlashcards(flashcards.filter(card => card.id !== cardId));
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };


  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-[#0C0C0C] font-inter">
      {/* Sidebar */}
      <div 
        className={`transition-all duration-300 ease-in-out border-r border-[#2D2D2D] bg-[#151515] flex flex-col ${
          isHovered ? 'w-64' : 'w-16'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo Section */}
        <div className="px-4 py-6 border-b border-[#2D2D2D]">
          {isHovered ? (
            <Image
              src="/miso.png"
              alt="Carpe Diem Logo"
              width={120}
              height={32}
              className="object-contain"
            />
          ) : (
            <div className="w-8 h-8 bg-carpe_green rounded-full" />
          )}
        </div>
  
        {/* Search and New Collection Section */}
        <div className="px-3 py-4 border-b border-[#2D2D2D] space-y-3">
          {/* Search Bar */}
          <div className={`relative ${isHovered ? 'block' : 'hidden'}`}>
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search collections..."
              className="w-full pl-9 pr-4 py-2 bg-[#1E1E1E] text-gray-200 text-sm rounded-lg border border-[#2D2D2D] focus:outline-none focus:border-carpe_green transition-colors"
            />
          </div>
  
          {/* New Collection Button */}
          <button 
            onClick={() => setShowNewDeckForm(true)} 
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-gray-300 hover:bg-[#1E1E1E] hover:text-white transition-colors"
          >
            <Plus size={18} className="flex-shrink-0" />
            {isHovered && <span className="text-sm">New Collection</span>}
          </button>
        </div>
  
        {/* Collections List */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className={`px-3 mb-2 ${isHovered ? 'block' : 'hidden'}`}>
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Collections</h2>
          </div>
          
          <div className="space-y-0.5 px-2">
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => setSelectedDeck(deck)}
                className={`w-full flex items-center px-2 py-2 rounded-lg text-left transition-colors ${
                  selectedDeck?.id === deck.id
                    ? ' text-white'
                    : 'text-gray-300 hover:bg-[#1E1E1E] hover:text-white'
                }`}
              >
                <Folder size={16} className={`flex-shrink-0 ${
                  selectedDeck?.id === deck.id ? 'text-carpe_green' : 'text-gray-400'
                }`} />
                {isHovered && (
                  <>
                    <span className="ml-2 text-sm truncate">{deck.title}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {selectedDeck?.id === deck.id ? flashcards.length : '—'}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
  
        {/* Logout Button */}
        <div className="px-3 py-4 border-t border-[#2D2D2D]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-gray-300 hover:bg-[#1E1E1E] hover:text-white transition-colors"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {isHovered && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>
  
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-[#0C0C0C]">
        {/* Top Navigation */}
        <div className="border-b border-[#2D2D2D] bg-[#151515]">
          <div className="px-8 py-6">
            <div className="max-w-4xl mx-auto">
              {selectedDeck ? (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-carpe_green mb-1">{selectedDeck.category}</p>
                    <h1 className="text-2xl font-semibold text-white">{selectedDeck.title}</h1>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowBulkGenerateForm(true)}
                      className="px-4 py-2 bg-[#1E1E1E] text-white rounded-lg hover:bg-[#2D2D2D] transition-colors flex items-center gap-2 text-sm font-medium border border-[#2D2D2D]"
                    >
                      <Plus size={16} />
                      Generate Cards
                    </button>
                    <button
                      onClick={() => setShowEditMode(true)}
                      className="px-4 py-2 bg-[#1E1E1E] text-white rounded-lg hover:bg-[#2D2D2D] transition-colors flex items-center gap-2 text-sm font-medium border border-[#2D2D2D]"
                    >
                      <Pencil size={16} />
                      Edit Cards
                    </button>
                    <button
                      onClick={() => setShowAddCardForm(true)}
                      className="px-4 py-2 bg-carpe_green text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-medium"
                    >
                      <Plus size={16} />
                      Add Card
                    </button>
                  </div>
                </div>
              ) : (
                <h1 className="text-2xl font-semibold text-white">Flashcards</h1>
              )}
            </div>
          </div>
        </div>
  
        {/* Main Content */}
        <div className="flex-1 p-8 bg-[#0C0C0C]">
          <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
            {showEditMode ? (
              <div className="w-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">Edit Flashcards</h2>
                  <button
                    onClick={() => setShowEditMode(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
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
            ) : (
              <>
                {flashcards.length > 0 ? (
                  <>
                    {/* Flashcard */}
                    <div 
                      onClick={() => setShowAnswer(!showAnswer)}
                      className="w-full bg-[#151515] rounded-xl border border-[#2D2D2D] p-12 mb-8 min-h-[450px] flex flex-col items-center justify-center text-center cursor-pointer hover:border-carpe_green transition-colors"
                    >
                      <div className="text-xl text-gray-200 mb-4">
                        {showAnswer ? flashcards[currentCardIndex].answer : flashcards[currentCardIndex].question}
                      </div>
                      <div className="text-sm text-carpe_green">
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
                        className="p-2 rounded-lg hover:bg-[#1E1E1E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft size={24} className="text-gray-400" />
                      </button>
                      <button
                        onClick={nextCard}
                        disabled={currentCardIndex === flashcards.length - 1}
                        className="p-2 rounded-lg hover:bg-[#1E1E1E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight size={24} className="text-gray-400" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="font-semibold text-center text-carpe_green text-2xl">
                    {selectedDeck ? 'No cards in this deck' : 'Select a deck to start reviewing'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>  

        {/* Dark mode modals */}
        {showAddCardForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-[#151515] rounded-lg p-6 max-w-md w-full border border-[#2D2D2D]">
              <h2 className="text-xl font-bold mb-4 text-white">Add New Flashcard</h2>
              <form onSubmit={handleAddCard}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-200">Question</label>
                  <textarea
                    value={newCard.question}
                    onChange={(e) => setNewCard(prev => ({ ...prev, question: e.target.value }))}
                    className="w-full p-2 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg text-gray-200 focus:border-carpe_green transition-colors"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-200">Answer</label>
                  <textarea
                    value={newCard.answer}
                    onChange={(e) => setNewCard(prev => ({ ...prev, answer: e.target.value }))}
                    className="w-full p-2 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg text-gray-200 focus:border-carpe_green transition-colors"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCardForm(false)}
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
            </div>
          </div>
        )}

        {showBulkGenerateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-[#151515] rounded-lg p-6 max-w-md w-full border border-[#2D2D2D]">
              <h2 className="text-xl font-bold mb-4 text-white">Generate Flashcards</h2>
              <form onSubmit={handleBulkGenerate}>
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
                    onClick={() => setShowBulkGenerateForm(false)}
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
            </div>
          </div>
        )}

        {/* New Deck Modal */}
        {showNewDeckForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-[#151515] rounded-lg p-6 max-w-md w-full border border-[#2D2D2D]">
              <h2 className="text-xl font-bold mb-4 text-white">Create New Collection</h2>
              <form onSubmit={handleCreateDeck}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-200">Title</label>
                  <input
                    type="text"
                    value={newDeck.title}
                    onChange={(e) => setNewDeck(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg text-gray-200 focus:border-carpe_green transition-colors"
                    required
                    placeholder="Enter collection title"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-200">Description</label>
                  <textarea
                    value={newDeck.description}
                    onChange={(e) => setNewDeck(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg text-gray-200 focus:border-carpe_green transition-colors"
                    required
                    placeholder="Enter collection description"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-200">Category</label>
                  <input
                    type="text"
                    value={newDeck.category}
                    onChange={(e) => setNewDeck(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg text-gray-200 focus:border-carpe_green transition-colors"
                    required
                    placeholder="Enter a category (e.g., Mathematics, Physics)"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewDeckForm(false)}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default FlashcardApp;