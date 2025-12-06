'use client';
import { formatRelativeTime } from '@/lib/utils/formatting';

export default function ActivityFeed({ activities }: any) {
  return (
    <div className="space-y-4">
      {activities?.map((activity: any) => (
        <div key={activity.id} className="flex items-start space-x-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
          <div>
            <p>{activity.description}</p>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
