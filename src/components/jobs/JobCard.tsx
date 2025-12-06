'use client';
import { Briefcase, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function JobCard({ job, onView }: any) {
  return (
    <div className="border rounded-lg p-6">
      <h3 className="font-semibold mb-2">{job.title}</h3>
      <div className="flex items-center text-sm text-muted-foreground mb-2">
        <MapPin className="h-4 w-4 mr-2" />{job.location}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills_required?.slice(0, 5).map((s: string) => <Badge key={s} variant="outline">{s}</Badge>)}
      </div>
      <Button onClick={() => onView?.(job)} variant="outline" className="w-full">View Job</Button>
    </div>
  );
}