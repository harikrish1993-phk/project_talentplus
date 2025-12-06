'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ClientForm({ initialData, onSubmit }: any) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div><Label>Company Name</Label><Input name="name" required defaultValue={initialData?.name} /></div>
      <div><Label>Industry</Label><Input name="industry" defaultValue={initialData?.industry} /></div>
      <div><Label>Contact Email</Label><Input name="contact_email" type="email" defaultValue={initialData?.contact_email} /></div>
      <Button type="submit">Save Client</Button>
    </form>
  );
}