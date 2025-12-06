'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PerformanceTable({ recruiters }: any) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Recruiter</TableHead>
          <TableHead>Submissions</TableHead>
          <TableHead>Placements</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recruiters?.map((r: any) => (
          <TableRow key={r.id}>
            <TableCell>{r.name}</TableCell>
            <TableCell>{r.submissions}</TableCell>
            <TableCell>{r.placements}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}