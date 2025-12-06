import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID required' },
        { status: 400 }
      );
    }

    // Fetch candidate
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (candidateError || !candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Return mock insights for now (implement AI later)
    const insights = {
      strengths: [
        'Strong technical background',
        'Relevant industry experience',
        'Good communication skills'
      ],
      improvements: [
        'Consider additional certifications',
        'Expand project portfolio'
      ],
      recommendations: [
        'Well-suited for mid-level positions',
        'Strong match for technical roles'
      ]
    };

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
