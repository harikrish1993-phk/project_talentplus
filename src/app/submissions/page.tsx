import SubmissionKanban from '@/components/submissions/SubmissionKanban';

export default function SubmissionsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Submissions Pipeline</h1>
      <SubmissionKanban />
    </div>
  );
}
