import React, { createContext, useState, useContext, useEffect } from 'react';
import { flashcardService } from '../lib/flashcard-service';
import { useAuth } from '@/app/contexts/AuthContext';
import { Database } from '@/types/database';

type Deck = Database['public']['Tables']['decks']['Row'];
type Flashcard = Database['public']['Tables']['flashcards']['Row'];

type DeckContextType = {
  decks: Deck[];
  selectedDeck: Deck | null;
  flashcards: Flashcard[];
  studiedToday: number;
  setSelectedDeck: (deck: Deck | null) => void;
  loadDecks: () => Promise<void>;
  loadFlashcards: (deckId: string) => Promise<void>;
  createDeck: (title: string, description: string, category: string) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<void>;
  createFlashcard: (question: string, answer: string) => Promise<void>;
  updateFlashcard: (cardId: string, question: string, answer: string) => Promise<void>;
  deleteFlashcard: (cardId: string) => Promise<void>;
  reviewFlashcard: (cardId: string, interval: number, easeFactor: number, nextReview: Date) => Promise<void>;
};

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export const useDeckContext = () => {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error('useDeckContext must be used within a DeckContextProvider');
  }
  return context;
};

const DeckContextProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [studiedToday, setStudiedToday] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadDecks();
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedDeck) {
      loadFlashcards(selectedDeck.id);
      loadStudiedCount(selectedDeck.id);
    }
  }, [selectedDeck]);

  const loadDecks = async () => {
    try {
      if (!user?.id) return;
      const fetchedDecks = await flashcardService.getDecks(user.id);
      setDecks(fetchedDecks);
    } catch (error) {
      console.error('Error loading decks:', error);
      setDecks([]);
    }
  };

  const loadFlashcards = async (deckId: string) => {
    try {
      const fetchedCards = await flashcardService.getDueFlashcards(deckId);
      setFlashcards(fetchedCards);
    } catch (error) {
      console.error('Error loading flashcards:', error);
    }
  };

  const loadStudiedCount = async (deckId: string) => {
    try {
      const count = await flashcardService.getStudiedToday(deckId);
      setStudiedToday(count);
    } catch (error) {
      console.error('Error loading studied count:', error);
    }
  };

  const createDeck = async (title: string, description: string, category: string) => {
    try {
      if (!user?.id) return;
      await flashcardService.createDeck(title, description, category, user.id);
      await loadDecks();
    } catch (error) {
      console.error('Error creating deck:', error);
    }
  };

  const deleteDeck = async (deckId: string) => {
    try {
      await flashcardService.deleteDeck(deckId);
      setDecks(decks.filter(d => d.id !== deckId));
      if (selectedDeck?.id === deckId) {
        setSelectedDeck(null);
        setFlashcards([]);
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
    }
  };

  const createFlashcard = async (question: string, answer: string) => {
    try {
      if (!selectedDeck) return;
      await flashcardService.createFlashcard(selectedDeck.id, question, answer);
      await loadFlashcards(selectedDeck.id);
    } catch (error) {
      console.error('Error creating flashcard:', error);
    }
  };

  const updateFlashcard = async (cardId: string, question: string, answer: string) => {
    try {
      const updatedCard = await flashcardService.editFlashcard(cardId, question, answer);
      setFlashcards(flashcards.map(card => 
        card.id === cardId ? updatedCard : card
      ));
    } catch (error) {
      console.error('Error updating flashcard:', error);
    }
  };

  const deleteFlashcard = async (cardId: string) => {
    try {
      await flashcardService.deleteFlashcard(cardId);
      setFlashcards(flashcards.filter(card => card.id !== cardId));
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  const reviewFlashcard = async (cardId: string, interval: number, easeFactor: number, nextReview: Date) => {
    try {
      await flashcardService.updateFlashcardReview(
        cardId,
        interval,
        easeFactor,
        nextReview
      );

      // Remove the reviewed card from the current session
      setFlashcards(flashcards.filter(card => card.id !== cardId));
      setStudiedToday(prev => prev + 1);
    } catch (error) {
      console.error('Error updating flashcard review:', error);
    }
  };

  return (
    <DeckContext.Provider value={{
      decks,
      selectedDeck,
      flashcards,
      studiedToday,
      setSelectedDeck,
      loadDecks,
      loadFlashcards,
      createDeck,
      deleteDeck,
      createFlashcard,
      updateFlashcard,
      deleteFlashcard,
      reviewFlashcard
    }}>
      {children}
    </DeckContext.Provider>
  );
};

export default DeckContextProvider;