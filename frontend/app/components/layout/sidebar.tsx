import React, { useState } from 'react';
import { Search, Plus, LogOut, Folder } from 'lucide-react';
import Image from 'next/image';
import { useDeckContext } from '../../contexts/DeckContext';
import { useAuth } from '@/app/contexts/AuthContext';
import DeckList from '../deck/decklist';
import DeckFormModal from '../modals/DeckFormModal';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  closeMobileMenu: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, closeMobileMenu }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showNewDeckForm, setShowNewDeckForm] = useState(false);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <div 
        className={`
          fixed lg:relative
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-all duration-300 ease-in-out 
          border-r border-[#2D2D2D] 
          bg-[#151515] 
          h-full
          z-40
          flex flex-col
          ${isHovered ? 'w-64' : 'w-16'}
          lg:flex
        `}
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
          
          <DeckList 
            isHovered={isHovered} 
            onItemClick={closeMobileMenu} 
          />
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

      {/* New Deck Modal */}
      {showNewDeckForm && (
        <DeckFormModal 
          onClose={() => setShowNewDeckForm(false)} 
        />
      )}
    </>
  );
};

export default Sidebar;
