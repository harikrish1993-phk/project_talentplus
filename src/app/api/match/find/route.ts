// app/api/match/find/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { calculateMatch } from '@/lib/ai/matcher';

export async function POST(request: NextRequest) {
  try {
    const { jobId, candidateId, mode, minScore = 60 } = await request.json();
    
    if (mode === 'job-to-candidates') {
      // Find candidates for a job
      const { data: job } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      const { data: candidates } = await supabase
        .from('candidates')
        .select('*')
        .eq('status', 'active');
      
      if (!job || !candidates) {
        return NextResponse.json({ success: false, error: 'Data not found' }, { status: 404 });
      }
      
      const matches = [];
      for (const candidate of candidates) {
        const matchResult = await calculateMatch(job, candidate);
        if (matchResult.match_score >= minScore) {
          // Save match to database
          const { data: matchData } = await supabase
            .from('matches')
            .upsert([{
              job_id: jobId,
              candidate_id: candidate.id,
              match_score: matchResult.match_score,
              score_breakdown: matchResult.score_breakdown,
              matching_skills: matchResult.matching_skills,
              missing_skills: matchResult.missing_skills,
              ai_summary: matchResult.ai_summary,
            }])
            .select(`
              *,
              job:jobs(*),
              candidate:candidates(*)
            `)
            .single();
          
          if (matchData) {
            matches.push(matchData);
          }
        }
      }
      
      return NextResponse.json({ success: true, data: matches });
    } else {
      // Find jobs for a candidate
      // Similar implementation
    }
  } catch (error: any) {
    console.error('Match error:', error);
    return NextResponse.json({ success: false, error: 'Match failed' }, { status: 500 });
  }
}