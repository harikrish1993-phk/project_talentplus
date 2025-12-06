'use client';
import * as React from 'react';
import ClientCard from '@/components/clients/ClientCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClientsPage() {
  const router = useRouter();
  return (
    <div className="p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button onClick={() => router.push('/clients/new')}><Plus className="h-4 w-4 mr-2" />Add Client</Button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {/* Clients will be loaded here */}
      </div>
    </div>
  );
}