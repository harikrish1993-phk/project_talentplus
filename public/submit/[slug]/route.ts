// ============================================================================
// Public API: Candidate Submission (src/app/api/public/submit/[slug]/route.ts)
// Handles file upload and submission data from the public form.
// ============================================================================

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Set the config for Next.js to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * POST /api/public/submit/[slug]
 * Handles the public candidate submission form.
 */
export async function POST(
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

    const organizationId = jobLink.organization_id;
    const jobId = jobLink.job_id;

    // 2. Parse the form data (including file upload)
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'tmp'),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
    });

    const { fields, files } = await new Promise<{
      fields: Record<string, string | string[]>;
      files: Record<string, any>;
    }>((resolve, reject) => {
      form.parse(request as any, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields: fields as any, files: files as any });
      });
    });

    const resumeFile = files.resumeFile?.[0];
    const fullName = Array.isArray(fields.fullName) ? fields.fullName[0] : fields.fullName;
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const phone = Array.isArray(fields.phone) ? fields.phone[0] : fields.phone;
    const consentGiven = Array.isArray(fields.consentGiven) ? fields.consentGiven[0] === 'true' : fields.consentGiven === 'true';

    if (!resumeFile || !fullName || !email || !consentGiven) {
      // Clean up uploaded file if it exists
      if (resumeFile) await fs.unlink(resumeFile.filepath);
      return NextResponse.json(
        { message: 'Missing required fields: Full Name, Email, Resume, and Consent.' },
        { status: 400 }
      );
    }

    // 3. Upload resume to Supabase Storage (S3)
    const fileExtension = path.extname(resumeFile.originalFilename || '');
    const storagePath = `${organizationId}/${jobId}/submissions/${uuidv4()}${fileExtension}`;

    const fileBuffer = await fs.readFile(resumeFile.filepath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes') // Assuming a bucket named 'resumes'
      .upload(storagePath, fileBuffer, {
        contentType: resumeFile.mimetype || 'application/octet-stream',
        upsert: false,
      });

    // Clean up local temp file
    await fs.unlink(resumeFile.filepath);

    if (uploadError) {
      console.error('Supabase Storage Upload Error:', uploadError);
      return NextResponse.json(
        { message: 'Failed to upload resume file.' },
        { status: 500 }
      );
    }

    const resumeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resumes/${uploadData.path}`;

    // 4. Insert submission into public_submissions table
    const { data: submission, error: submissionError } = await supabase
      .from('public_submissions')
      .insert({
        organization_id: organizationId,
        job_link_id: jobLink.id,
        full_name: fullName,
        email: email,
        phone: phone,
        resume_url: resumeUrl,
        consent_given: consentGiven,
        // ip_address and user_agent can be extracted from request headers
        // For simplicity, we omit that extraction here but it's recommended
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Supabase Submission Error:', submissionError);
      return NextResponse.json(
        { message: 'Failed to record submission in database.' },
        { status: 500 }
      );
    }

    // 5. Trigger internal notification/processing (e.g., webhook, internal activity log)
    // This step would typically involve:
    // - Logging an activity for the organization (e.g., 'new_public_submission')
    // - Sending an internal notification to the recruiter/team lead
    // - Starting a background job to parse the resume and create a candidate record

    return NextResponse.json({
      message: 'Submission successful.',
      submissionId: submission.id,
    });
  } catch (error: any) {
    console.error('General Submission Error:', error);
    if (error.message.includes('maxFileSize')) {
      return NextResponse.json(
        { message: 'File size exceeds the 5MB limit.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Internal server error during submission.' },
      { status: 500 }
    );
  }
}