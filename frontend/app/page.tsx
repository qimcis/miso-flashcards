// app/page.tsx
'use client';
import { useAuth } from './contexts/AuthContext';
import FlashcardApp from './flashcard-app/page';
import AuthPage from './components/auth/page';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return user ? <FlashcardApp /> : <AuthPage />;
}