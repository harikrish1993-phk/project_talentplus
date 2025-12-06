'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SubmissionForm({ onSubmit }: any) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div><Label>Candidate</Label><Select><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">John Doe</SelectItem></SelectContent></Select></div>
      <div><Label>Job</Label><Select><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Senior Developer</SelectItem></SelectContent></Select></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Bill Rate (EUR/hr)</Label><Input name="bill_rate" type="number" required /></div>
        <div><Label>Pay Rate (EUR/hr)</Label><Input name="pay_rate" type="number" required /></div>
      </div>
      <Button type="submit">Create Submission</Button>
    </form>
  );
}
