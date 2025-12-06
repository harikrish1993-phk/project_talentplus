import { NextResponse } from 'next/server';
import { getPerformanceReport } from '@/lib/db/reports';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = Object.fromEntries(searchParams);
  const report = await getPerformanceReport(filters);
  return NextResponse.json(report);
}
