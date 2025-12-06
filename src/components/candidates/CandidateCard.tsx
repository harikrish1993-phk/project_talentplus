'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, MapPin, Briefcase } from 'lucide-react';

export default function CandidateCard({ candidate, onViewProfile, matchScore }: any) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 rounded-full p-2"><User className="h-5 w-5" /></div>
          <div>
            <h3 className="font-semibold">{candidate.first_name} {candidate.last_name}</h3>
            <p className="text-sm text-muted-foreground">{candidate.current_title}</p>
          </div>
        </div>
        {matchScore && <Badge variant="secondary">{matchScore}% Match</Badge>}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />{candidate.location}
        </div>
        <div className="flex items-center text-muted-foreground">
          <Briefcase className="h-4 w-4 mr-2" />{candidate.total_experience_years} years exp
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-3">
        {candidate.skills?.slice(0, 5).map((skill: string) => (
          <Badge key={skill} variant="outline">{skill}</Badge>
        ))}
      </div>
      <Button onClick={onViewProfile} variant="outline" className="w-full mt-4">View Profile</Button>
    </div>
  );
}
