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

    const up = {
      ...data,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(up, { onConflict: 'user_id' }) // requires unique(user_id) on profiles (recommended)
      .select()
      .single();

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    setMsg('Profile saved!');
    // Immediately return to dashboard after successful save
    router.push('/dashboard');
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto p-6 text-gray-400">Loading…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Brand Profile</h1>

      <div className="space-y-1">
        <label className="block text-sm">Brand tone</label>
        <select
          className="w-full border rounded p-2 bg-white text-black"
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

      <div className="space-y-1">
        <label className="block text-sm">Industry</label>
        <input
          className="w-full border rounded p-2 bg-white text-black"
          placeholder="e.g., Cafe, Landscaping, Accounting"
          value={data.industry}
          onChange={e => setData(d => ({ ...d, industry: e.target.value }))}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm">Products / services</label>
        <textarea
          className="w-full border rounded p-2 min-h-[90px] bg-white text-black"
          placeholder="Comma-separated list (e.g., soy candles, wax melts, gift boxes)"
          value={data.product_list}
          onChange={e => setData(d => ({ ...d, product_list: e.target.value }))}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm">Target audience</label>
        <textarea
          className="w-full border rounded p-2 min-h-[90px] bg-white text-black"
          placeholder="e.g., Young adults in Melbourne interested in wellness"
          value={data.target_audience}
          onChange={e => setData(d => ({ ...d, target_audience: e.target.value }))}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          onClick={save}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save & Return'}
        </button>

        <button
          type="button"
          className="px-4 py-2 rounded border border-slate-300 text-slate-800 hover:bg-slate-100"
          onClick={() => router.push('/dashboard')}
        >
          Return without saving
        </button>

        {msg && <span className="text-green-600 text-sm">{msg}</span>}
        {err && <span className="text-red-600 text-sm">{err}</span>}
      </div>
    </div>
  );
}
