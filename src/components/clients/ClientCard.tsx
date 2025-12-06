'use client';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientCard({ client, onView }: any) {
  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Building2 className="h-6 w-6" />
        <h3 className="font-semibold">{client.name}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{client.industry}</p>
      <Button onClick={() => onView?.(client)} variant="outline" className="w-full">View</Button>
    </div>
  );
}