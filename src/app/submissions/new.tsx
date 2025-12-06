'use client';
import SubmissionForm from '@/components/submissions/SubmissionForm';
import { useRouter } from 'next/navigation';

export default function NewSubmissionPage() {
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (response.ok) router.push('/submissions');
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create Submission</h1>
      <SubmissionForm onSubmit={handleSubmit} />
    </div>
  );
}
