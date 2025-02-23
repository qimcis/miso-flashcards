import { supabase } from './supabase'
import { Database } from '@/types/database'
import OpenAI from 'openai'
import { GenerateResponse, APIErrorResponse } from '@/types/flashcard'

type Deck = Database['public']['Tables']['decks']['Row']
type Flashcard = Database['public']['Tables']['flashcards']['Row']
type NewDeck = Omit<Deck, 'id'>

const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

export const flashcardService = {
  async getDecks(userId: string) {
    console.log('Fetching decks for user:', userId);
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching decks:', error);
      throw error;
    }
    
    console.log('Fetched decks:', data);
    return data;
  },

  async getDeckById(deckId: string) {
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getFlashcardsByDeck(deckId: string) {
    console.log('Fetching flashcards for deck:', deckId);
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching flashcards:', error);
      throw error;
    }
    
    console.log('Fetched flashcards:', data);
    return data;
  },

  async getDueFlashcards(deckId: string) {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .or('next_review.is.null,next_review.lte.' + new Date().toISOString())
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createFlashcard(deckId: string, question: string, answer: string) {
    console.log('Creating flashcard in deck:', deckId);
    const { data, error } = await supabase
      .from('flashcards')
      .insert([
        {
          deck_id: deckId,
          question,
          answer,
          ease_factor: 2.5,    
          interval: 1,        
          created_at: new Date().toISOString()
        }
      ])
      .select();
  
    if (error) {
      console.error('Error creating flashcard:', error);
      throw error;
    }
  
    console.log('Created flashcard:', data);
    return data[0];
  },

  async updateFlashcardReview(
    flashcardId: string,
    interval: number,
    easeFactor: number,
    nextReview: Date
  ) {
    console.log('Updating flashcard review:', { flashcardId, interval, easeFactor, nextReview });
    const { data, error } = await supabase
      .from('flashcards')
      .update({
        interval,
        ease_factor: easeFactor,
        last_reviewed: new Date().toISOString(),
        next_review: nextReview.toISOString(),
      })
      .eq('id', flashcardId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating flashcard review:', error);
      throw error;
    }
    
    console.log('Updated flashcard:', data);
    return data;
  },

  async generateFlashcards(deckId: string, subject: string): Promise<Flashcard[]> {
    console.log('Generating flashcards for subject:', subject);
    
    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject }),
      });

      if (!response.ok) {
        const errorData = await response.json() as APIErrorResponse;
        throw new Error(errorData.error || 'Failed to generate flashcards');
      }

      const data = await response.json() as GenerateResponse;
      
      const flashcardsToInsert = data.flashcards.map((card) => ({
        deck_id: deckId,
        question: card.question,
        answer: card.answer,
        ease_factor: 2.5,
        interval: 1,
        created_at: new Date().toISOString()
      }));

      const { data: insertedData, error } = await supabase
        .from('flashcards')
        .insert(flashcardsToInsert)
        .select();

      if (error) {
        console.error('Error inserting generated flashcards:', error);
        throw error;
      }

      if (!insertedData) {
        throw new Error('No data returned from insert operation');
      }

      console.log('Successfully generated and inserted flashcards:', insertedData);
      return insertedData;

    } catch (error) {
      console.error('Error in generateFlashcards:', error);
      throw error;
    }
  },

  async addBulkCards(deckId: string, subject: string): Promise<Flashcard[]> {
    try {
      const newCards = await flashcardService.generateFlashcards(deckId, subject);
      return newCards;
    } catch (error) {
      console.error('Error adding bulk cards:', error);
      throw error;
    }
  },

  async createDeck(title: string, description: string, category: string, userId: string): Promise<Deck> {
    console.log('Creating new deck:', { title, description, category, userId });
    
    const newDeck: NewDeck = {
      title,
      description,
      category,
      user_id: userId.toString(), 
      created_at: new Date().toISOString()
    };
  
    const { data, error } = await supabase
      .from('decks')
      .insert([newDeck])
      .select();
  
    if (error) {
      console.error('Error creating deck:', error);
      throw error;
    }
  
    if (!data || data.length === 0) {
      throw new Error('No data returned from insert operation');
    }
  
    return data[0];
  },
  
  async editFlashcard(
    flashcardId: string,
    question: string,
    answer: string
  ): Promise<Flashcard> {
    console.log('Editing flashcard:', { flashcardId, question, answer });
    
    const { data, error } = await supabase
      .from('flashcards')
      .update({
        question,
        answer,
      })
      .eq('id', flashcardId)
      .select()
      .single();

    if (error) {
      console.error('Error editing flashcard:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from update operation');
    }

    console.log('Updated flashcard:', data);
    return data;
  },

  async deleteFlashcard(flashcardId: string): Promise<void> {
    console.log('Deleting flashcard:', flashcardId);
    
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', flashcardId);

    if (error) {
      console.error('Error deleting flashcard:', error);
      throw error;
    }

    console.log('Successfully deleted flashcard:', flashcardId);
  },
  async deleteDeck(deckId: string): Promise<void> {
    console.log('Deleting deck:', deckId);
    
    // First delete all flashcards in the deck
    const { error: flashcardsError } = await supabase
      .from('flashcards')
      .delete()
      .eq('deck_id', deckId);

    if (flashcardsError) {
      console.error('Error deleting deck flashcards:', flashcardsError);
      throw flashcardsError;
    }

    // Then delete the deck itself
    const { error: deckError } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId);

    if (deckError) {
      console.error('Error deleting deck:', deckError);
      throw deckError;
    }

    console.log('Successfully deleted deck and its flashcards:', deckId);
  }
}


