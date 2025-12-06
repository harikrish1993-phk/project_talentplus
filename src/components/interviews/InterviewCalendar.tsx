'use client';
import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

export default function InterviewCalendar({ interviews, onDateSelect }: any) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return (
    <div className="grid grid-cols-2 gap-6">
      <Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); onDateSelect?.(d); }} />
      <div><h3 className="font-semibold">Interviews</h3></div>
    </div>
  );
}