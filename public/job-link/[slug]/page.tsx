// ============================================================================
// Public API: Job Link Details (src/app/api/public/job-link/[slug]/route.ts)
// Fetches job title and organization name for the public form.
// ============================================================================

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * GET /api/public/job-link/[slug]
 * Fetches the job title and organization name associated with the public slug.
 */
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const supabase = createServerClient();

  try {
    // 1. Find the public job link by slug
    const { data: jobLink, error: linkError } = await supabase
      .from('public_job_links')
      .select('job_id, organization_id, is_active')
      .eq('public_slug', slug)
      .eq('is_active', true)
      .single();

    if (linkError || !jobLink) {
      return NextResponse.json(
        { message: 'Job link not found or inactive.' },
        { status: 404 }
      );
    }

    // 2. Fetch the job title
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('title')
      .eq('id', jobLink.job_id)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { message: 'Associated job not found.' },
        { status: 404 }
      );
    }

    // 3. Fetch the organization name
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', jobLink.organization_id)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { message: 'Organization not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      jobTitle: job.title,
      organizationName: organization.name,
      organizationId: jobLink.organization_id,
      jobId: jobLink.job_id,
    });
  } catch (error) {
    console.error('Error fetching public job link details:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}