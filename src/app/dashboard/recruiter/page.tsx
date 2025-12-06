'use client';
import StatCard from '@/components/dashboard/StatCard';
import { Users, Briefcase, ClipboardList, Calendar } from 'lucide-react';

export default function RecruiterDashboard() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Active Candidates" value="42" icon={Users} />
        <StatCard title="Open Jobs" value="15" icon={Briefcase} />
        <StatCard title="Submissions" value="28" icon={ClipboardList} />
        <StatCard title="Interviews" value="8" icon={Calendar} />
      </div>
    </div>
  );
}