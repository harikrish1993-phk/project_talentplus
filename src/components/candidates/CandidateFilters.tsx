'use client';
import SearchInput from '@/components/shared/SearchInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CandidateFilters({ filters, onChange }: any) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <SearchInput
        value={filters.search || ''}
        onChange={(value) => onChange({ ...filters, search: value })}
        placeholder="Search candidates..."
      />
      <Select onValueChange={(value) => onChange({ ...filters, status: value })}>
        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="placed">Placed</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => onChange({ ...filters, experience: value })}>
        <SelectTrigger><SelectValue placeholder="Experience" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Experience</SelectItem>
          <SelectItem value="0-2">0-2 years</SelectItem>
          <SelectItem value="3-5">3-5 years</SelectItem>
          <SelectItem value="5+">5+ years</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
