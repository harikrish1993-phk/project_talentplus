'use client';
import ClientForm from '@/components/clients/ClientForm';
export default function EditClientPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Client</h1>
      <ClientForm initialData={{}} onSubmit={async () => {}} />
    </div>
  );
}