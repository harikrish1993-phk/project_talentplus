'use client';
import FileUpload from '@/components/shared/FileUpload';
export default function ImportCandidatesPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Import Candidates</h1>
      <FileUpload onUpload={async (files) => {}} accept=".csv" />
    </div>
  );
}