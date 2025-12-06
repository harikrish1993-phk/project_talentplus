'use client';
import SearchInput from '@/components/shared/SearchInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function JobFilters({ filters, onChange }: any) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <SearchInput value={filters.search || ''} onChange={(v) => onChange({ ...filters, search: v })} />
      <Select onValueChange={(v) => onChange({ ...filters, status: v })}>
        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}