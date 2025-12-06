'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = React.useState([]);

  React.useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(d => setJobs(d.data || []));
  }, []);

  const columns = [
    { accessorKey: 'title', header: 'Job Title' },
    { accessorKey: 'client_name', header: 'Client' },
    { accessorKey: 'location', header: 'Location' },
    { accessorKey: 'status', header: 'Status' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Jobs</h1>
        <Button onClick={() => router.push('/jobs/new')}>
          <Plus className="h-4 w-4 mr-2" /> Create Job
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={jobs}
        searchKey="title"
        onRowClick={(row) => router.push(`/jobs/${row.id}`)}
      />
    </div>
  );
}
