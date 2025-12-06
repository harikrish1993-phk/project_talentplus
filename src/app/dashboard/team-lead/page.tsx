'use client';
import StatCard from '@/components/dashboard/StatCard';
import { Users, Target, TrendingUp, Award } from 'lucide-react';

export default function TeamLeadDashboard() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Team Lead Dashboard</h1>
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Team Size" value="8" icon={Users} />
        <StatCard title="Team Target" value="85%" icon={Target} />
        <StatCard title="Performance" value="+15%" icon={TrendingUp} />
        <StatCard title="Top Performer" value="John" icon={Award} />
      </div>
    </div>
  );
}