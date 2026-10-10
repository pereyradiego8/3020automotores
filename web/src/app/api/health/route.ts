import { NextResponse } from 'next/server';

// Lightweight liveness endpoint for hosting checks; intentionally exposes no configuration details.
export function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
