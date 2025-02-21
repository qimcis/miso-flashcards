import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Image from 'next/image';
import { supabase } from '@/app/lib/supabase';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex">
      {/* Left Column - Login Form */}
      <div className="w-full lg:w-[880px] p-8 flex flex-col justify-center">
        <div className="w-full max-w-sm mx-auto">
          <Image
            src="/carpe-diem-logo.png"
            alt="Carpe Diem Logo"
            width={48}
            height={48}
            className="mb-8"
          />
          
          <h1 className="text-4xl font-semibold text-white mb-2">
            {isLogin ? 'Sign in to Carpe Diem' : 'Create your account'}
          </h1>
          <p className="text-gray-400 mb-8">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-carpe_green hover:opacity-80"
            >
              {isLogin ? 'Get started' : 'Sign in'}
            </button>
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg text-gray-200 focus:border-carpe_green transition-colors"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg text-gray-200 focus:border-carpe_green transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-carpe_green text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
            >
              {loading ? 'Please wait...' : isLogin ? 'Continue' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2D2D2D]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0C0C0C] text-gray-400">OR</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mt-4 w-full py-2 px-4 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Image
                src="/google.png"
                alt="Google"
                width={36}
                height={20}
              />
              <span className="text-gray-700 font-medium">Continue with Google</span>
            </button>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            By signing in, you agree to our{' '}
            <a href="#" className="text-carpe_green hover:opacity-80">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-carpe_green hover:opacity-80">Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* Right Column - Feature Showcase */}
      <div className="hidden lg:block flex-1 bg-[#151515] p-8 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-carpe_green/20 to-transparent opacity-50"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 0%, #151515 70%)`
          }}
        />
        
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-lg">
              <h2 className="text-3xl font-semibold text-white mb-4">
                Master Any Subject with Smart Flashcards
              </h2>
              <p className="text-gray-400">
                Create, study, and master your learning materials with our advanced spaced repetition system. 
                Generate AI-powered flashcards and track your progress over time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;