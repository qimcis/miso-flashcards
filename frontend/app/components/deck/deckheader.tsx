import React, { useState } from 'react';
import { Plus, FileText, Pencil } from 'lucide-react';
import { useDeckContext } from '../../contexts/DeckContext';
import PDFUploadModal from '../pdfupload';
import FlashcardFormModal from '../modals/FlashcardFormModal';
import BulkGenerateModal from '../modals/BulkGenerateModal';

interface DeckHeaderProps {
  onEditModeToggle: () => void;
  isEditMode: boolean;
}

const DeckHeader: React.FC<DeckHeaderProps> = ({ onEditModeToggle, isEditMode }) => {
  const { selectedDeck } = useDeckContext();
  const [showPDFUpload, setShowPDFUpload] = useState(false);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [showBulkGenerateForm, setShowBulkGenerateForm] = useState(false);
  
  if (!selectedDeck) return null;

  return (
    <div className="border-b border-[#2D2D2D] bg-[#151515]">
      <div className="px-4 lg:px-8 py-6 mt-12 lg:mt-0">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-carpe_green mb-1">{selectedDeck.category}</p>
              <h1 className="text-xl lg:text-2xl font-semibold text-white">{selectedDeck.title}</h1>
            </div>
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <button
                onClick={() => setShowPDFUpload(true)}
                className="px-3 lg:px-4 py-2 bg-[#1E1E1E] text-white rounded-lg hover:bg-[#2D2D2D] transition-colors flex items-center gap-2 text-sm font-medium border border-[#2D2D2D]"
              >
                <FileText size={16} />
                <span className="hidden sm:inline">Upload PDF</span>
              </button>
              <button
                onClick={() => setShowBulkGenerateForm(true)}
                className="px-3 lg:px-4 py-2 bg-[#1E1E1E] text-white rounded-lg hover:bg-[#2D2D2D] transition-colors flex items-center gap-2 text-sm font-medium border border-[#2D2D2D]"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Generate</span>
              </button>
              <button
                onClick={onEditModeToggle}
                className="px-3 lg:px-4 py-2 bg-[#1E1E1E] text-white rounded-lg hover:bg-[#2D2D2D] transition-colors flex items-center gap-2 text-sm font-medium border border-[#2D2D2D]"
              >
                <Pencil size={16} />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => setShowAddCardForm(true)}
                className="px-3 lg:px-4 py-2 bg-carpe_green text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-medium"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Card</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPDFUpload && selectedDeck && (
        <PDFUploadModal
          isOpen={showPDFUpload}
          onClose={() => setShowPDFUpload(false)}
          deckId={selectedDeck.id}
          onCardsGenerated={() => {
            setShowPDFUpload(false);
          }}
        />
      )}

      {showAddCardForm && (
        <FlashcardFormModal onClose={() => setShowAddCardForm(false)} />
      )}

      {showBulkGenerateForm && (
        <BulkGenerateModal onClose={() => setShowBulkGenerateForm(false)} />
      )}
    </div>
  );
};

export default DeckHeader;