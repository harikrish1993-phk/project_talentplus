'use client';
import CandidateForm from '@/components/candidates/CandidateForm';
import ResumeUpload from '@/components/candidates/ResumeUpload';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NewCandidatePage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    const response = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) router.push('/candidates');
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Add New Candidate</h1>
      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="upload">Upload Resume</TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="mt-6">
          <CandidateForm onSubmit={handleSubmit} />
        </TabsContent>
        <TabsContent value="upload" className="mt-6">
          <ResumeUpload onParsed={(data) => handleSubmit(data)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
