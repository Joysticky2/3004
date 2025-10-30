'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

// --- export helper (unchanged) ---
async function exportTxtViaApi(title: string, prompt: string, output: string) {
  const r = await fetch('/api/export/txt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, prompt, output }),
  });
  if (!r.ok) throw new Error(`Export failed: ${r.status}`);
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const draftId = String(id);
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  // Controls
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [platform, setPlatform] =
    useState<'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok'>('instagram');
  const [maxChars, setMaxChars] = useState<number>(2200);
  const [genLoading, setGenLoading] = useState(false);
  const [genErr, setGenErr] = useState<string | null>(null);

  // Analysis
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisErr, setAnalysisErr] = useState<string | null>(null);

  // sensible defaults by platform
  const defaultLimit = useMemo(() => {
    switch (platform) {
      case 'twitter': return 280;
      case 'linkedin': return 3000;
      case 'instagram': return 2200;
      case 'facebook': return 63206;
      case 'tiktok': return 2200;
    }
  }, [platform]);

  useEffect(() => {
    setMaxChars(defaultLimit);
  }, [defaultLimit]);

  // Load draft
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data } = await supabase
        .from('content_drafts')
        .select('content_text')
        .eq('draft_id', draftId)
        .single();

      if (data?.content_text) setText(data.content_text);
      setLoading(false);
    })();
  }, [draftId, router, supabase]);

  // Autosave
  useEffect(() => {
    if (loading) return;
    const t = setInterval(async () => {
      await supabase
        .from('content_drafts')
        .update({ content_text: text, updated_at: new Date().toISOString() })
        .eq('draft_id', draftId);
    }, 8000);
    return () => clearInterval(t);
  }, [text, draftId, loading, supabase]);

  const handleExport = async () => {
    try {
      const composedPrompt = [
        `Platform: ${platform}`,
        `Max characters: ${maxChars}`,
        `Topic: ${topic}`,
        `Keywords: ${keywords}`,
      ].join('\n');
      await exportTxtViaApi(`Draft_${draftId}`, composedPrompt, text);
    } catch (e: any) {
      alert(e.message ?? 'Export failed');
    }
  };

 const handleGenerate = async () => {
  setGenErr(null);
  if (!topic.trim()) { setGenErr('Please enter a topic.'); return; }

  try {
    setGenLoading(true);

    // 👇 Get access token for Authorization header
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('No active session');

    // Include draftId so the server updates THIS row (not insert a new one)
    const reqBody = {
      draftId,
      contentType: 'social',
      topic: `[${platform.toUpperCase()} | max ${maxChars} chars] ${topic}`,
      keywords,
    };

    const r = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 👇 send Bearer token
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(reqBody),
    });

    const json = await r.json();
    if (!r.ok) throw new Error(json?.error || 'Failed to generate');

    const generated = (json?.draft?.content_text ?? '').toString();
    const trimmed = maxChars ? generated.slice(0, maxChars) : generated;
    setText(trimmed);
  } catch (e: any) {
    setGenErr(e.message ?? 'Generate failed');
  } finally {
    setGenLoading(false);
  }
};


  const handleAnalyze = async () => {
    setAnalysisErr(null);
    setAnalysis(null);

    if (!text.trim()) { setAnalysisErr('There is no content to analyze.'); return; }

    try {
      setIsAnalyzing(true);
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json?.error || 'Failed to analyze');

      setAnalysis(json.analysis as string);
    } catch (e: any) {
      setAnalysisErr(e.message ?? 'Analyze failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            <span className="text-indigo-400">AI</span> Content Engine — Editor
          </h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-white/30 text-sm"
          >
            ← Return to Dashboard
          </button>
        </div>
      </header>

      {/* 1:4 layout */}
      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-5 gap-6">
        {/* Left: controls (1/5) */}
        <aside className="col-span-5 md:col-span-1 space-y-4">
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Platform</label>
              <select
                className="w-full rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2 text-white"
                value={platform}
                onChange={e => setPlatform(e.target.value as any)}
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">X / Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Character limit</label>
              <input
                type="number"
                min={50}
                max={65000}
                className="w-full rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2 text-white"
                value={maxChars}
                onChange={e => setMaxChars(Math.max(0, Number(e.target.value || 0)))}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Topic</label>
              <input
                className="w-full rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2 text-white placeholder-slate-400"
                placeholder="Grand opening with live music & discounts"
                value={topic}
                onChange={e => setTopic(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Keywords (optional)</label>
              <input
                className="w-full rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2 text-white placeholder-slate-400"
                placeholder=""
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                className="w-full px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-black font-medium disabled:opacity-60"
                onClick={handleGenerate}
                disabled={genLoading}
              >
                {genLoading ? 'Generating…' : 'Generate with OpenAI'}
              </button>
              <button
                className="w-full px-4 py-2 rounded-lg border border-white/15 hover:border-white/30 text-white"
                onClick={handleExport}
              >
                Export as .TXT
              </button>
              <button
                className="w-full px-4 py-2 rounded-lg border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing…' : 'Run SEO & Tone Analysis'}
              </button>
            </div>

            {genErr && <p className="text-xs text-red-400">{genErr}</p>}
          </div>
        </aside>

        {/* Right: editor (4/5) */}
        <section className="col-span-5 md:col-span-4 space-y-4">
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <textarea
              className="w-full h-[65vh] md:h-[60vh] p-3 rounded-lg border border-white/10 bg-white text-black"
              value={text}
              onChange={(e) =>
                setText(maxChars ? e.target.value.slice(0, maxChars) : e.target.value)
              }
            />
            <div className="mt-2 text-xs text-slate-400">
              {maxChars ? `${text.length}/${maxChars} characters` : `${text.length} characters`}
            </div>
          </div>

          {/* Analysis panel (unselectable) */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="text-sm font-semibold text-emerald-300 mb-2">SEO & Tone Analysis</div>
            {analysisErr ? (
              <div className="text-red-400 text-sm">{analysisErr}</div>
            ) : analysis ? (
              <pre className="text-emerald-200 text-sm whitespace-pre-wrap select-none">
                {analysis}
              </pre>
            ) : (
              <div className="text-slate-400 text-sm select-none">
                No analysis yet. Click “Run SEO & Tone Analysis” after generating or editing content.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
