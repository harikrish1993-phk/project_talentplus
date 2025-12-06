'use client';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function CandidateMatchScore({ score, reasons }: any) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Match Score</span>
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
      </div>
      <Progress value={score} className="h-2" />
      {reasons && (
        <div className="space-y-1 text-sm">
          {reasons.map((reason: string, i: number) => (
            <p key={i} className="text-muted-foreground">• {reason}</p>
          ))}
        </div>
      )}
    </div>
  );
}
