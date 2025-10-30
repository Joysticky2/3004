// src/app/api/export/txt/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

function sanitize(name: string) {
  return name.replace(/[^\w\-]+/g, '_').slice(0, 60);
}

export async function POST(req: NextRequest) {
  const { title = 'content', prompt = '', output = '' } = await req.json();

  const body = [
    `Title: ${title}`,
    `Exported: ${new Date().toLocaleString()}`,
    '',
    '--- Prompt ---',
    prompt,
    '',
    '--- Output ---',
    output
  ].join('\n');

  // UTF-8 BOM for Windows Notepad
  const BOM = '\uFEFF';
  const text = BOM + body;

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${sanitize(title)}_${ts}.txt`;

  return new Response(text, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
