import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { Database } from '@/types/database';
import { supabase } from '../lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';

type Flashcard = Database['public']['Tables']['flashcards']['Row'];

interface PDFUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: string;
  onCardsGenerated: (cards: Flashcard[]) => void;
}

const PDFUploadModal: React.FC<PDFUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  deckId, 
  onCardsGenerated 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !deckId || !user) {
      setError('Please ensure you are logged in and have selected a file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // First, check if we can access the deck
      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .select('*')
        .eq('id', deckId)
        .eq('user_id', user.id.toString())
        .single();

      if (deckError || !deckData) {
        throw new Error('You do not have access to this deck');
      }

      const response = await fetch('http://localhost:8000/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process PDF');
      }

      const data = await response.json();
      
      // Insert the generated flashcards into the deck
      const flashcardsToInsert = data.flashcards.map((card: { question: string; answer: string }) => ({
        deck_id: deckId,
        question: card.question,
        answer: card.answer,
        ease_factor: 2.5,
        interval: 1,
        created_at: new Date().toISOString()
      }));

      const { data: insertedData, error: insertError } = await supabase
        .from('flashcards')
        .insert(flashcardsToInsert)
        .select();

      if (insertError) {
        console.error('Supabase error:', insertError);
        throw new Error('Failed to save flashcards');
      }

      if (insertedData) {
        onCardsGenerated(insertedData);
        onClose();
      }
    } catch (err) {
      console.error('Error in handleUpload:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[#151515] rounded-lg p-6 max-w-md w-full border border-[#2D2D2D]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Upload PDF</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleUpload}>
          <div className="mb-6">
            <label 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-[#1E1E1E] border-[#2D2D2D] hover:bg-[#2D2D2D] transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 mb-2 text-gray-500" />
                    <p className="text-sm text-gray-400">
                      {file ? file.name : 'Click to upload PDF'}
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:bg-[#1E1E1E] rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-carpe_green text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PDFUploadModal;