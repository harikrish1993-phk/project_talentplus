// app/api/linkedin/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchLinkedInProfiles } from '@/lib/linkedin/scraper';

export async function POST(request: NextRequest) {
  try {
    const { keywords, location } = await request.json();
    
    const profiles = await searchLinkedInProfiles(keywords, location);
    
    return NextResponse.json({
      success: true,
      data: profiles,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}