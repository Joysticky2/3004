// src/app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "text"' }, { status: 400 });
    }

    const prompt = `
Analyze the following marketing copy for SEO and tone.
Return concise, structured feedback including:
- Strengths & weaknesses (bulleted)
- Recommended keywords (comma-separated)
- Suggested title (<= 60 chars)
- Meta description (<= 160 chars)
- 3 specific improvement tips

Content:
"""${text}"""
`;

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a precise SEO and tone analyst.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 600
    });

    const analysis = resp.choices?.[0]?.message?.content?.trim();
    if (!analysis) {
      return NextResponse.json({ error: 'No analysis produced' }, { status: 502 });
    }

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: err?.status ?? 500 });
  }
}
