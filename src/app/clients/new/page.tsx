'use client';
import ClientForm from '@/components/clients/ClientForm';
import { useRouter } from 'next/navigation';

export default function NewClientPage() {
  const router = useRouter();
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Add New Client</h1>
      <ClientForm onSubmit={async (data) => { router.push('/clients'); }} />
    </div>
  );
}