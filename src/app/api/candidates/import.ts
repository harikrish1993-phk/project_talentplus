import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  const { candidates } = await request.json();
  return NextResponse.json({ success: true, imported: candidates?.length || 0 });
}
