import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/auth';
import { openai } from '@/lib/openai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Accept Bearer token from the client
    const authHeader = req.headers.get('authorization') ?? undefined;
    const supabase = createSupabaseServer(authHeader);

    // Auth
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: userErr?.message ?? 'Auth session missing!' }, { status: 401 });
    }

    // Body
    const body = await req.json().catch(() => null);
    const draftId = (body?.draftId ?? '').toString().trim();
    const contentType = body?.contentType as 'blog' | 'social' | 'email' | undefined;
    const topic = (body?.topic ?? '').toString().trim();
    const keywords = (body?.keywords ?? '').toString();

    if (!contentType || !topic) {
      return NextResponse.json({ error: 'contentType and topic are required' }, { status: 400 });
    }

    // Profile (optional)
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('brand_tone, industry, target_audience')
      .eq('user_id', user.id)
      .maybeSingle();
    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });

    // Prompt
    const system = `You are an assistant that writes ${contentType} for a small business.
Tone: ${profile?.brand_tone || 'friendly'}; Industry: ${profile?.industry || 'general'}.
Audience: ${profile?.target_audience || 'customers'}. Use Australian spelling.`;

    const userPrompt = `Topic: ${topic}.
Keywords: ${keywords || ''}.
Write one high-quality draft with a short CTA.`;

    // OpenAI
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const text = resp.choices?.[0]?.message?.content?.trim() ?? '';
    if (!text) return NextResponse.json({ error: 'No content generated' }, { status: 502 });

    // Save: update existing draft if draftId provided; otherwise insert
    if (draftId) {
      const { data: row, error: updErr } = await supabase
        .from('content_drafts')
        .update({
          content_type: contentType,
          content_text: text,
          updated_at: new Date().toISOString(),
        })
        .eq('draft_id', draftId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
      return NextResponse.json({ draft: row }, { status: 200 });
    } else {
      const { data: row, error: insErr } = await supabase
        .from('content_drafts')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_text: text,
        })
        .select()
        .single();

      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
      return NextResponse.json({ draft: row }, { status: 200 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 });
  }
}
