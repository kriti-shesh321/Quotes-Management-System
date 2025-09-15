// src/components/Auth.tsx
import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks';
import { login, register } from '../store/slices/authSlice';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { truncate, marqueeAnimation } from '../utils/utils';

type QuoteItem = { id: number; text: string; author?: string | null; };

export default function Auth() {
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [publicQuotes, setPublicQuotes] = useState<QuoteItem[]>([]);

  useEffect(() => {
    let mounted = true;

    async function fetchQuotes() {
      try {
        const r = await api.get('/quotes', { params: { limit: 20 } });
        if (!mounted) return;

        const data: QuoteItem[] = Array.isArray(r.data)
          ? r.data.filter((q: any) => q.is_public)
          : [];
        setPublicQuotes(data.slice(0, 20));
      } catch (err) {
        console.error("public quotes fetch error", err);
      }
    }
    
    fetchQuotes();
    return () => {
      mounted = false;
    };
  }, []);


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await dispatch(login({ email, password })).unwrap();
        toast.success('Logged in');
      } else {
        await dispatch(register({ username, email, password })).unwrap();
        await dispatch(login({ email, password })).unwrap();
        toast.success('Registered & logged in.');
      }
    } catch (err: any) {
      const message = mode === 'login' ? 'Sign in failed' : 'Signup failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen h-screen flex flex-col md:flex-row">

      <aside className="md:w-1/2 w-full flex items-center justify-center bg-gradient-to-b from-sky-900 via-indigo-900 to-slate-900 text-white p-6">
        <div className="max-w-lg w-full flex flex-col gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">Quotes App</h1>
            <p className="mt-3 text-sm md:text-base text-sky-100/90">
              Discover & save inspiring quotes. Sign in to manage your collection or browse public quotes below.
            </p>
          </div>

          <div className="w-full bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            <div
              className="relative h-44 md:h-56"
            >
              <div
                className="absolute inset-0"
                style={{
                  display: 'inline-block',
                  animation: marqueeAnimation(publicQuotes.length),
                  willChange: 'transform',
                }}
              >
                <div className="flex flex-col gap-4 p-4">
                  {publicQuotes.length === 0 ? (
                    <div className="text-sm text-sky-100/80">Loading quotes...</div>
                  ) : (
                    publicQuotes.map((q) => (
                      <div
                        key={q.id}
                        className="bg-white/4 rounded-lg p-3 border border-white/5 max-w-full"
                        style={{ backdropFilter: 'blur(4px)' }}
                      >
                        <div className="text-sm md:text-base leading-snug text-white">
                          <strong className="font-medium">“{truncate(q.text, 120)}”</strong>
                        </div>
                        <div className="text-xs text-sky-200 mt-1">— {q.author ?? 'Unknown'}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-sky-200/80 italic">Mark quotes as favorites and filter by topic once signed in.</p>
        </div>
      </aside>

      <main className="md:w-1/2 w-full flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>

          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            {mode === 'register' && (
              <input
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            )}

            <input
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <input
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            {error && <div className="text-sm text-red-600">{error}</div>}

            <button
              className={`w-full py-3 rounded-lg text-white font-medium transition ${loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              type="submit"
              disabled={loading}
            >
              {loading ? (mode === 'login' ? 'Signing in...' : 'Creating...') : (mode === 'login' ? 'Sign in' : 'Create account')}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            <button
              onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
              className="text-indigo-600 hover:underline"
              disabled={loading}
            >
              {mode === 'login' ? 'Create account' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
