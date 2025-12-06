'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/shared/DataTable';
import CandidateFilters from '@/components/candidates/CandidateFilters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = React.useState([]);
  const [filters, setFilters] = React.useState({});

  React.useEffect(() => {
    fetch('/api/candidates').then(r => r.json()).then(d => setCandidates(d.data || []));
  }, [filters]);

  const columns = [
    { accessorKey: 'first_name', header: 'First Name' },
    { accessorKey: 'last_name', header: 'Last Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'current_title', header: 'Title' },
    { accessorKey: 'location', header: 'Location' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Candidates</h1>
        <Button onClick={() => router.push('/candidates/new')}>
          <Plus className="h-4 w-4 mr-2" /> Add Candidate
        </Button>
      </div>
      <CandidateFilters filters={filters} onChange={setFilters} />
      <DataTable
        columns={columns}
        data={candidates}
        searchKey="first_name"
        onRowClick={(row) => router.push(`/candidates/${row.id}`)}
      />
    </div>
  );
}
