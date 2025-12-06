'use client';
import InterviewForm from '@/components/interviews/InterviewForm';
export default function NewInterviewPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Schedule Interview</h1>
      <InterviewForm onSubmit={async () => {}} />
    </div>
  );
}