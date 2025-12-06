'use client';
import PipelineChart from '@/components/dashboard/PipelineChart';
import RevenueChart from '@/components/dashboard/RevenueChart';

export default function OverviewPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Overview</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="border rounded-lg p-6"><h3 className="font-semibold mb-4">Pipeline</h3><PipelineChart data={[]} /></div>
        <div className="border rounded-lg p-6"><h3 className="font-semibold mb-4">Revenue</h3><RevenueChart data={[]} /></div>
      </div>
    </div>
  );
}