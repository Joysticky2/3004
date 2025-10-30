'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!email || !password) return setErr('Email and password are required.');
    if (password !== confirm) return setErr('Passwords do not match.');

    setLoading(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setErr(error.message);
    } else {
      setMsg('Check your email to confirm your account, then log in.');
      // If confirmations are OFF, you could redirect here (not adding per your request)
      // window.location.href = '/dashboard';
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white px-6">
      <div className="w-full max-w-md bg-slate-900/60 border border-white/10 rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-indigo-400">Create an account</h1>
          <p className="mt-2 text-slate-400 text-sm">Join to start generating on-brand content</p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-800/70 px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="confirm">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-800/70 px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-black font-semibold transition disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        {/* Messages */}
        {err && <p className="text-red-400 text-sm">{err}</p>}
        {msg && <p className="text-emerald-400 text-sm">{msg}</p>}

        {/* Footer link */}
        <div className="text-center text-sm text-slate-400 mt-2">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
