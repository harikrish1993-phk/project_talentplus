'use client';
import JobForm from '@/components/jobs/JobForm';
import { useParams, useRouter } from 'next/navigation';

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Edit Job</h1>
      <JobForm initialData={{}} onSubmit={async (data) => { router.push(`/jobs/${id}`); }} />
    </div>
  );
}