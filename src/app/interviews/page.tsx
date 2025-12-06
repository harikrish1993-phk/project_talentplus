'use client';
import InterviewCalendar from '@/components/interviews/InterviewCalendar';
export default function InterviewsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Interviews</h1>
      <InterviewCalendar interviews={[]} onDateSelect={() => {}} />
    </div>
  );
}