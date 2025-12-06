'use client';
import PerformanceTable from '@/components/dashboard/PerformanceTable';
export default function PerformanceReportPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Performance Report</h1>
      <PerformanceTable recruiters={[]} />
    </div>
  );
}