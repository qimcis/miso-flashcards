'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { flashcardService } from '../lib/flashcard-service';
import { Database } from '@/types/database';
import Layout from '../components/layout/layout';
import DeckContextProvider from '../contexts/DeckContext';

type Deck = Database['public']['Tables']['decks']['Row'];
type Flashcard = Database['public']['Tables']['flashcards']['Row'];

const FlashcardApp = () => {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(!user);
  }, [user]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <DeckContextProvider>
      <Layout />
    </DeckContextProvider>
  );
};

export default FlashcardApp;