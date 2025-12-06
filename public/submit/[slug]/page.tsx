// ============================================================================
// Public Candidate Submission Form (src/app/public/submit/[slug]/page.tsx)
// Allows candidates to apply directly via a public link.
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react';

// Assuming these components exist in your UI library
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// --- Validation Schema ---
const submissionSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().optional(),
  resumeFile: z.any().refine(file => file && file.length > 0, 'Resume file is required.'),
  consentGiven: z.boolean().refine(val => val === true, 'You must consent to the terms.'),
});

type SubmissionFormValues = z.infer<typeof submissionSchema>;

// --- Component ---
export default function PublicSubmissionPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      consentGiven: false,
    },
  });

  const resumeFile = watch('resumeFile');

  // 1. Fetch Job Details based on slug
  useEffect(() => {
    async function fetchJobDetails() {
      if (!slug) return;
      try {
        const response = await fetch(`/api/public/job-link/${slug}`);
        if (!response.ok) {
          throw new Error('Job link not found or inactive.');
        }
        const data = await response.json();
        setJobTitle(data.jobTitle);
        setOrganizationName(data.organizationName);
      } catch (error: any) {
        toast.error(error.message || 'Could not load job details.');
        setJobTitle(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobDetails();
  }, [slug]);

  // 2. Handle Form Submission
  const onSubmit = async (values: SubmissionFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', values.fullName);
      formData.append('email', values.email);
      formData.append('phone', values.phone || '');
      formData.append('consentGiven', String(values.consentGiven));
      formData.append('resumeFile', values.resumeFile[0]);

      const response = await fetch(`/api/public/submit/${slug}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed.');
      }

      toast.success('Application submitted successfully! You will be notified of the next steps.');
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!jobTitle) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md p-6 text-center">
          <CardTitle className="text-2xl font-bold text-red-600">Link Not Found</CardTitle>
          <CardContent className="mt-4 text-gray-600">
            The job link you are trying to access is invalid or has expired.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md p-8 text-center border-green-500 shadow-lg">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
          <CardTitle className="mt-4 text-3xl font-bold text-gray-800">Application Received!</CardTitle>
          <CardContent className="mt-4 text-gray-600">
            Thank you for applying for the **{jobTitle}** position at **{organizationName}**. We have received your submission and will be in touch shortly.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="bg-indigo-600 text-white rounded-t-xl p-6">
          <CardTitle className="text-3xl font-extrabold">Apply for {jobTitle}</CardTitle>
          <p className="text-indigo-200 mt-1">
            Applying to **{organizationName}**
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  {...register('fullName')}
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 555-5555"
                  {...register('phone')}
                />
              </div>
            </div>

            {/* Resume Upload */}
            <div className="space-y-2">
              <Label htmlFor="resumeFile">Upload Resume (PDF or DOCX)</Label>
              <div
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                  errors.resumeFile ? 'border-red-500' : 'border-gray-300'
                }`}
                onClick={() => document.getElementById('resumeFile')?.click()}
              >
                <input
                  id="resumeFile"
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  {...register('resumeFile')}
                  onChange={(e) => {
                    setValue('resumeFile', e.target.files);
                  }}
                />
                {resumeFile && resumeFile.length > 0 ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>{resumeFile[0].name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF or DOCX (Max 5MB)</p>
                  </div>
                )}
              </div>
              {errors.resumeFile && <p className="text-red-500 text-sm mt-1">{errors.resumeFile.message}</p>}
            </div>

            {/* Consent Checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consentGiven"
                {...register('consentGiven')}
                className={errors.consentGiven ? 'border-red-500' : ''}
              />
              <Label htmlFor="consentGiven" className="text-sm font-normal text-gray-600">
                I consent to **{organizationName}** storing my data and resume for the purpose of this application and future job opportunities.
              </Label>
            </div>
            {errors.consentGiven && <p className="text-red-500 text-sm mt-1">{errors.consentGiven.message}</p>}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                'Submit Application'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}