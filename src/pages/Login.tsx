import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../supabase';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app/home`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface p-8 rounded-[2.5rem] shadow-xl border border-accent text-center"
      >
        <div className="mb-8">
          <div className="w-24 h-24 bg-primary rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <span className="text-white text-4xl font-serif font-bold">A</span>
          </div>
          <h1 className="text-3xl font-serif text-primary mb-2">AcaciaVeld</h1>
          <p className="text-primary-light font-medium">Ranch Operations System</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-60"
        >
          {loading
            ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <LogIn size={20} />
          }
          {loading ? 'Redirecting...' : 'Sign in with Google'}
        </button>

        <p className="mt-8 text-xs text-primary-light/60 uppercase tracking-widest font-bold">
          Field-ready livestock control
        </p>
      </motion.div>
    </div>
  );
}
