// src/app/api/ping/route.ts
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';          // optional
export async function GET() {
  return NextResponse.json({ ok: true });
}
