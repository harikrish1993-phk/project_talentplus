import { NextResponse } from 'next/server';
import { createInterview, getInterviews } from '@/lib/db/interviews';

export async function GET(request: Request) {
  const interviews = await getInterviews();
  return NextResponse.json({ interviews });
}

export async function POST(request: Request) {
  const body = await request.json();
  const interview = await createInterview(body);
  return NextResponse.json({ interview });
}
