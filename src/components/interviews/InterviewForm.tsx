'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InterviewForm({ onSubmit }: any) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div><Label>Date & Time</Label><Input name="scheduled_at" type="datetime-local" required /></div>
      <div><Label>Duration (min)</Label><Input name="duration" type="number" defaultValue="60" /></div>
      <Button type="submit">Schedule Interview</Button>
    </form>
  );
}