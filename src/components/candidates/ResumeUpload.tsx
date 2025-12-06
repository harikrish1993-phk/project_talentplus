'use client';
import * as React from 'react';
import FileUpload from '@/components/shared/FileUpload';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ResumeUpload({ onParsed }: { onParsed: (data: any) => void }) {
  const [parsing, setParsing] = React.useState(false);
  const [parsedData, setParsedData] = React.useState<any>(null);

  const handleUpload = async (files: File[]) => {
    setParsing(true);
    try {
      const file = files[0];
      const text = await file.text();
      const response = await fetch('/api/candidates/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: text }),
      });
      const result = await response.json();
      if (result.success) {
        setParsedData(result.data);
        onParsed(result.data);
      }
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileUpload onUpload={handleUpload} accept=".pdf,.doc,.docx,.txt" />
      {parsing && <LoadingSpinner text="Parsing resume..." />}
      {parsedData && (
        <div className="p-4 border rounded-lg bg-green-50">
          <p className="text-sm font-medium text-green-900">Resume parsed successfully!</p>
        </div>
      )}
    </div>
  );
}
