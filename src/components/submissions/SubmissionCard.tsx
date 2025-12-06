'use client';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils/formatting';

export default function SubmissionCard({ submission }: any) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  return (
    <div className="bg-white rounded-lg border p-3 mb-2 hover:shadow-sm transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{getInitials(submission.candidate_name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{submission.candidate_name}</p>
            <p className="text-xs text-muted-foreground">{submission.job_title}</p>
          </div>
        </div>
        <Badge variant="outline">{submission.status.replace('_', ' ')}</Badge>
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Client: {submission.client_name}</p>
        <p>Rate: {formatCurrency(submission.bill_rate)}/hr</p>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {submission.skills?.slice(0, 3).map((skill: string) => (
          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
        ))}
      </div>
    </div>
  );
}
