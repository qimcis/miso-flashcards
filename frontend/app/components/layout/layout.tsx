'use client'
import React, { useState } from 'react';
import Sidebar from './sidebar';
import { Menu } from 'lucide-react';
import { useDeckContext } from '../../contexts/DeckContext';
import DeckHeader from '../deck/deckheader';
import FlashcardReviewContainer from '../flashcard/reviewcontainer';
import FlashcardEditList from '../flashcard/editlist';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEditMode, setShowEditMode] = useState(false);
  const { selectedDeck } = useDeckContext();

  return (
    <div className="flex h-screen bg-[#0C0C0C] font-inter relative">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#151515] text-white"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        closeMobileMenu={() => setIsMobileMenuOpen(false)} 
      />

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-[#0C0C0C] min-h-screen w-full">
        {/* Top Navigation */}
        {selectedDeck && (
          <DeckHeader 
            onEditModeToggle={() => setShowEditMode(!showEditMode)}
            isEditMode={showEditMode}
          />
        )}
  
        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8 bg-[#0C0C0C]">
          <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
            {showEditMode ? (
              <FlashcardEditList />
            ) : (
              <FlashcardReviewContainer />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;