'use client';

import { formatRelativeTime } from '@/lib/utils/formatting';
import { CheckCircle, Clock, XCircle, Briefcase, MessageSquare } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'success' | 'pending' | 'rejected' | 'interview' | 'note';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface CandidateTimelineProps {
  events: TimelineEvent[];
}

export default function CandidateTimeline({ events }: CandidateTimelineProps) {
  const getIcon = (type: string) => {
    switch(type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'interview':
        return <Briefcase className="h-5 w-5 text-blue-600" />;
      case 'note':
        return <MessageSquare className="h-5 w-5 text-gray-600" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-primary" />;
    }
  };

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id || index} className="flex items-start space-x-4">
          <div className="mt-1">{getIcon(event.type)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{event.title}</p>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
            )}
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(event.timestamp)}
              </p>
              {event.user && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-muted-foreground">{event.user}</p>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
