'use client';
import CandidateForm from '@/components/candidates/CandidateForm';
export default function EditCandidatePage() {
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Edit Candidate</h1>
      <CandidateForm initialData={{}} onSubmit={async () => {}} />
    </div>
  );
}