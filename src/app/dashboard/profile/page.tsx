'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useRouter } from 'next/navigation';

const supabase = supabaseBrowser();

type Profile = {
  brand_tone: string;
  industry: string;
  product_list: string;
  target_audience: string;
};

export default function BrandProfile() {
  const router = useRouter();
  const [data, setData] = useState<Profile>({
    brand_tone: 'friendly',
    industry: '',
    product_list: '',
    target_audience: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setErr(null);
      const { data: { user }, error: uErr } = await supabase.auth.getUser();
      if (uErr) { setErr(uErr.message); setLoading(false); return; }
      if (!user) { router.push('/auth/login'); return; }

      const { data: row, error } = await supabase
        .from('profiles')
        .select('brand_tone, industry, product_list, target_audience')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) setErr(error.message);
      if (row) setData(row);
      setLoading(false);
    })();
  }, [router]);

  const save = async () => {
    setSaving(true);
    setErr(null); setMsg(null);

    const { data: { user }, error: uErr } = await supabase.auth.getUser();
    if (uErr || !user) { setErr(uErr?.message ?? 'Not authenticated'); setSaving(false); return; }

    const up = { ...data, user_id: user.id, updated_at: new Date().toISOString() };

    const { error } = await supabase
      .from('profiles')
      .upsert(up, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    setMsg('Profile saved!');
    router.push('/dashboard'); // return after save
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-10 text-slate-300">Loading…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            <span className="text-indigo-400">AI</span> Content Engine — Brand Profile
          </h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-white/30 text-sm"
          >
            ← Return to Dashboard
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Status messages */}
        {(err || msg) && (
          <div
            className={`mb-4 rounded-lg border p-3 text-sm ${
              err
                ? 'border-red-500/50 bg-red-500/10 text-red-300'
                : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
            }`}
          >
            {err ?? msg}
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">
              Brand tone
            </label>
            <select
              className="w-full rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2 text-white"
              value={data.brand_tone}
              onChange={e => setData(d => ({ ...d, brand_tone: e.target.value }))}
            >
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="playful">Playful</option>
              <option value="confident">Confident</option>
              <option value="informative">Informative</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">
              Industry
            </label>
            <input
              className="w-full rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2 text-white placeholder-slate-400"
              placeholder="e.g., Cafe, Landscaping, Accounting"
              value={data.industry}
              onChange={e => setData(d => ({ ...d, industry: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">
              Products / services
            </label>
            <textarea
              className="w-full min-h-[110px] rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2 text-white placeholder-slate-400"
              placeholder="Comma-separated list (e.g., soy candles, wax melts, gift boxes)"
              value={data.product_list}
              onChange={e => setData(d => ({ ...d, product_list: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">
              Target audience
            </label>
            <textarea
              className="w-full min-h-[110px] rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2 text-white placeholder-slate-400"
              placeholder="e.g., Young adults in Melbourne interested in wellness"
              value={data.target_audience}
              onChange={e => setData(d => ({ ...d, target_audience: e.target.value }))}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-black font-medium disabled:opacity-60"
              onClick={save}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save & Return'}
            </button>

            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-white/15 hover:border-white/30"
              onClick={() => router.push('/dashboard')}
            >
              Return without saving
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
