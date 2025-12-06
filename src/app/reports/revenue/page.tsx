'use client';
import RevenueChart from '@/components/dashboard/RevenueChart';
export default function RevenueReportPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Revenue Report</h1>
      <RevenueChart data={[]} />
    </div>
  );
}