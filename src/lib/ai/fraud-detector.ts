export interface FraudDetectionResult {
  score: number; // 0-100, higher = more authentic
  flags: string[];
  confidence: 'high' | 'medium' | 'low';
  recommendation: 'approve' | 'review' | 'reject';
}

export async function detectFraud(
  resumeText: string,
  candidateData: any
): Promise<FraudDetectionResult> {
  const flags: string[] = [];
  let score = 100;

  // Check for generic template phrases
  const genericPhrases = [
    'hard-working',
    'team player',
    'detail-oriented',
    'self-motivated'
  ];
  const genericCount = genericPhrases.filter(phrase => 
    resumeText.toLowerCase().includes(phrase)
  ).length;
  
  if (genericCount > 3) {
    flags.push('High use of generic phrases');
    score -= 10;
  }

  // Check for inconsistencies
  if (candidateData.years_of_experience > 30) {
    flags.push('Unusually long experience');
    score -= 5;
  }

  // Check for spam patterns
  const spamPatterns = [/\$\$\$/, /click here/i, /www\./];
  if (spamPatterns.some(pattern => pattern.test(resumeText))) {
    flags.push('Contains spam patterns');
    score -= 20;
  }

  // Determine confidence and recommendation
  let confidence: FraudDetectionResult['confidence'] = 'high';
  let recommendation: FraudDetectionResult['recommendation'] = 'approve';

  if (score < 50) {
    confidence = 'low';
    recommendation = 'reject';
  } else if (score < 75) {
    confidence = 'medium';
    recommendation = 'review';
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    flags,
    confidence,
    recommendation
  };
}
