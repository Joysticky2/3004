'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type DraftRow = {
  draft_id: string;
  content_type: string | null;
  content_text: string | null;
  created_at: string;
  updated_at: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      setEmail(user.email ?? null);

      // Load recent drafts
      const { data } = await supabase
        .from('content_drafts')
        .select('draft_id, content_type, content_text, created_at, updated_at')
        .order('updated_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(10);

      setDrafts(data ?? []);
      setLoading(false);
    })();
  }, [router]);

  const createNewDraft = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    const { data, error } = await supabase
      .from('content_drafts')
      .insert({
        user_id: user.id,
        content_type: 'social',
        content_text: '',
      })
      .select()
      .single();

    if (error || !data) {
      alert(error?.message ?? 'Could not create draft');
      return;
    }
    router.push(`/dashboard/editor/${data.draft_id}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Go to the public landing page after sign-out
    router.replace('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-xl text-slate-300">Loading your dashboard…</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top Bar */}
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="font-semibold">
            <span className="text-indigo-400">AI</span> Content Engine — Dashboard
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">
              {email ? `Signed in as ${email}` : ''}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-white/15 hover:border-white/30"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold">Quick actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-black font-medium"
              onClick={createNewDraft}
            >
              + New Draft
            </button>
            <Link
              href="/dashboard/profile"
              className="px-4 py-2 rounded-lg border border-white/15 hover:border-white/30"
            >
              Edit Brand Profile
            </Link>
          </div>
        </section>

        {/* Recent Drafts */}
        <section>
          <h2 className="text-lg font-semibold">Recent drafts</h2>
          {drafts.length === 0 ? (
            <p className="mt-3 text-slate-400">No drafts yet. Create your first draft to get started.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 overflow-hidden">
              {drafts.map((d) => (
                <li key={d.draft_id} className="p-4 bg-slate-900/40 hover:bg-slate-900/70 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm text-slate-400 uppercase tracking-wide">
                        {d.content_type ?? 'draft'}
                      </div>
                      <div className="text-slate-100 mt-1 line-clamp-2">
                        {d.content_text?.trim() ? d.content_text.slice(0, 160) : '— Empty draft —'}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Created: {new Date(d.created_at).toLocaleString()}
                        {d.updated_at ? ` • Updated: ${new Date(d.updated_at).toLocaleString()}` : ''}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <Link
                        href={`/dashboard/editor/${d.draft_id}`}
                        className="px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-black text-sm font-medium"
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Helpful Links */}
        <section>
          <h2 className="text-lg font-semibold">Tips</h2>
          <ul className="mt-3 list-disc list-inside text-slate-300 space-y-1">
            <li>Set your brand profile first — tone, industry, products, audience.</li>
            <li>Use keywords in the topic; run SEO analysis after generating a draft.</li>
            <li>Export your final copy as .TXT for sharing or scheduling.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
