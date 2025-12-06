'use client';
import StatCard from '@/components/dashboard/StatCard';
import { Users, Briefcase, TrendingUp, DollarSign } from 'lucide-react';

export default function OwnerDashboard() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Owner Dashboard</h1>
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="€2.5M" icon={DollarSign} />
        <StatCard title="Active Clients" value="45" icon={Briefcase} />
        <StatCard title="Team Members" value="12" icon={Users} />
        <StatCard title="Growth" value="+23%" icon={TrendingUp} />
      </div>
    </div>
  );
}