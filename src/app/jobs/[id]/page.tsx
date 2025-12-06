'use client';
import JobDetailTabs from '@/components/jobs/JobDetailTabs';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Details</h1>
        <Button onClick={() => router.push(`/jobs/${id}/edit`)}>Edit</Button>
      </div>
      <JobDetailTabs job={{}} />
    </div>
  );
}