'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      router.push('/dashboard'); // redirect after login
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white px-6">
      <div className="w-full max-w-md bg-slate-900/60 border border-white/10 rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-indigo-400">Welcome back</h1>
          <p className="mt-2 text-slate-400 text-sm">Log in to access your dashboard</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-800/70 px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-800/70 px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Login button */}
        <div>
          <button
            onClick={handleLogin}
            className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-black font-semibold transition"
          >
            Log in
          </button>
        </div>

        {/* Footer links */}
        <div className="text-center text-sm text-slate-400 mt-4">
          Don’t have an account?{' '}
          <a href="/auth/register" className="text-indigo-400 hover:text-indigo-300">
            Register
          </a>
        </div>
      </div>
    </main>
  );
}
