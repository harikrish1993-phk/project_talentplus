import React from 'react';
import { Badge } from '@/components/ui/badge';

interface MatchScoreProps {
  score: number;
  tier?: string;
  className?: string;
}

export default function MatchScore({ score, tier, className = '' }: MatchScoreProps) {
  const getVariant = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Fair Match';
  };

  const getTier = (score: number) => {
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    return 'C';
  };

  const displayTier = tier || getTier(score);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="text-2xl font-bold text-gray-900">{score}%</div>
      <div className="flex flex-col gap-1">
        <Badge variant={getVariant(score)}>{getLabel(score)}</Badge>
        <span className="text-xs text-gray-500">Tier {displayTier}</span>
      </div>
    </div>
  );
}
