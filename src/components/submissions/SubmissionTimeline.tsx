'use client';

import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils/formatting';
import { Clock } from 'lucide-react';

interface StatusChange {
  id: string;
  status: string;
  changed_at: string;
  changed_by_name: string;
  notes?: string;
}

interface SubmissionTimelineProps {
  history: StatusChange[];
}

export default function SubmissionTimeline({ history }: SubmissionTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No status changes yet</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'new': 'default',
      'pre_screening': 'secondary',
      'internal_review': 'secondary',
      'submitted_to_client': 'default',
      'client_review': 'default',
      'interview_scheduled': 'default',
      'interviewed': 'default',
      'offer_extended': 'default',
      'offer_accepted': 'default',
      'hired': 'default',
      'rejected': 'destructive'
    };
    return statusColors[status] || 'secondary';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      {history.map((item, index) => (
        <div key={item.id || index} className="flex items-start space-x-4">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            {index < history.length - 1 && (
              <div className="absolute top-4 left-1 w-0.5 h-full bg-gray-200" />
            )}
          </div>
          
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant={getStatusColor(item.status) as any}>
                {formatStatus(item.status)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(item.changed_at)}
              </span>
            </div>
            
            {item.notes && (
              <p className="text-sm text-muted-foreground mt-1 mb-1">
                {item.notes}
              </p>
            )}
            
            <p className="text-xs text-muted-foreground">
              Changed by {item.changed_by_name}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
