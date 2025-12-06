'use client';
import * as React from 'react';
import SkillInput from '@/components/shared/SkillInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CandidateForm({ initialData, onSubmit }: any) {
  const [skills, setSkills] = React.useState<string[]>(initialData?.skills || []);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await onSubmit({ ...Object.fromEntries(formData), skills });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>First Name</Label><Input name="first_name" required /></div>
        <div><Label>Last Name</Label><Input name="last_name" required /></div>
      </div>
      <div><Label>Email</Label><Input name="email" type="email" required /></div>
      <div><Label>Phone</Label><Input name="phone" required /></div>
      <div><Label>Location</Label><Input name="location" required /></div>
      <div><Label>Skills</Label><SkillInput skills={skills} onChange={setSkills} /></div>
      <Button type="submit">Save Candidate</Button>
    </form>
  );
}
