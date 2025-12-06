'use client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statuses = ['new', 'pre_screening', 'submitted_to_client', 'interview_scheduled', 'hired', 'rejected'];

export default function StatusDropdown({ currentStatus, onChange }: any) {
  return (
    <Select value={currentStatus} onValueChange={onChange}>
      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
      <SelectContent>
        {statuses.map(status => (
          <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
