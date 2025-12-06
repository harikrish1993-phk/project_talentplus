'use client';

import { useState, useEffect } from 'react';
import SubmissionKanban from '@/components/submissions/SubmissionKanban';
import { createClient } from '@/lib/supabase/client';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('submissions')
        .update({ status: newStatus })
        .eq('id', submissionId);

      if (!error) {
        await loadSubmissions();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading submissions...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Submissions Pipeline</h1>
      <SubmissionKanban submissions={submissions} onStatusChange={handleStatusChange} />
    </div>
  );
}