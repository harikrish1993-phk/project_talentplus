import { NextResponse } from 'next/server';
import { submitInterviewFeedback } from '@/lib/db/interviews';

export async function POST(request: Request) {
  const body = await request.json();
  const feedback = await submitInterviewFeedback(body);
  return NextResponse.json({ feedback });
}
