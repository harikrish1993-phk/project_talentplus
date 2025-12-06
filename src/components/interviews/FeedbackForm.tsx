'use client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function FeedbackForm({ onSubmit }: any) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div><Label>Feedback</Label><Textarea name="feedback" rows={6} required /></div>
      <Button type="submit">Submit Feedback</Button>
    </form>
  );
}