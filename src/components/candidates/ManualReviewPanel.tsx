'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  Brain, 
  User,
  AlertCircle,
  CheckCircle,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ManualReviewPanelProps {
  submissionId: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  aiScore: number;
  aiReasoning?: string;
  existingManualScore?: number;
  existingReviewNotes?: string;
  existingReviewerId?: string;
  existingReviewedAt?: string;
  onReviewComplete: () => void;
}

export default function ManualReviewPanel({
  submissionId,
  candidateId,
  candidateName,
  jobTitle,
  aiScore,
  aiReasoning,
  existingManualScore,
  existingReviewNotes,
  existingReviewerId,
  existingReviewedAt,
  onReviewComplete,
}: ManualReviewPanelProps) {
  const [manualScore, setManualScore] = useState<number | null>(existingManualScore || null);
  const [reviewNotes, setReviewNotes] = useState(existingReviewNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);

  const isReviewed = !!existingReviewedAt;
  const scoreDifference = manualScore !== null ? manualScore - aiScore : null;

  const handleScoreClick = (score: number) => {
    setManualScore(score);
  };

  const handleQuickDecision = (approved: boolean) => {
    if (approved) {
      setManualScore(aiScore >= 80 ? aiScore : 80);
      setReviewNotes(prev => prev + (prev ? '\n\n' : '') + '✅ Approved - Candidate meets requirements');
    } else {
      setManualScore(Math.min(aiScore, 40));
      setReviewNotes(prev => prev + (prev ? '\n\n' : '') + '❌ Not suitable for this position');
    }
  };

  const handleSubmitReview = async () => {
    if (manualScore === null) {
      toast.error('Please provide a manual score');
      return;
    }

    if (!reviewNotes.trim()) {
      toast.error('Please add review notes explaining your decision');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/submissions/${submissionId}/manual-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          manual_score: manualScore,
          manual_review_notes: reviewNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      toast.success('Review submitted successfully!');
      onReviewComplete();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Manual Candidate Review</h3>
          <p className="text-sm text-gray-600 mt-1">
            Review {candidateName} for {jobTitle}
          </p>
        </div>
        {isReviewed && (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Reviewed
          </Badge>
        )}
      </div>

      {/* AI Score Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-600" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">AI Match Score</span>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${getScoreColor(aiScore)}`}>
                {aiScore}%
              </div>
              <Badge variant={aiScore >= 80 ? 'success' : aiScore >= 60 ? 'warning' : 'destructive'}>
                {aiScore >= 80 ? 'Excellent' : aiScore >= 60 ? 'Good' : 'Poor'} Match
              </Badge>
            </div>
          </div>
          
          {aiReasoning && (
            <div className="pt-2 border-t border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>AI Reasoning:</strong>
              </p>
              <p className="text-sm text-gray-600 mt-1">{aiReasoning}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Review Section */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600" />
            Your Review (Human Expert)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Decision Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-green-300 hover:bg-green-50"
              onClick={() => handleQuickDecision(true)}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-red-300 hover:bg-red-50"
              onClick={() => handleQuickDecision(false)}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>

          {/* Manual Score Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Your Score (0-100)</Label>
            
            {/* Star Rating for Quick Score */}
            <div className="flex gap-2 mb-3">
              {[20, 40, 60, 80, 100].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleScoreClick(score)}
                  onMouseEnter={() => setHoveredScore(score)}
                  onMouseLeave={() => setHoveredScore(null)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    manualScore === score
                      ? 'border-purple-600 bg-purple-100'
                      : hoveredScore === score
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      manualScore === score || hoveredScore === score
                        ? 'fill-purple-600 text-purple-600'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Numeric Display */}
            {manualScore !== null && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-purple-200">
                <span className="text-sm font-medium">Your Score:</span>
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-bold ${getScoreColor(manualScore)}`}>
                    {manualScore}%
                  </span>
                  <Badge variant={manualScore >= 80 ? 'success' : manualScore >= 60 ? 'warning' : 'destructive'}>
                    {manualScore >= 80 ? 'Excellent' : manualScore >= 60 ? 'Good' : 'Poor'}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Score Comparison */}
          {manualScore !== null && scoreDifference !== null && (
            <div className={`p-3 rounded-lg ${
              Math.abs(scoreDifference) <= 10 
                ? 'bg-green-50 border border-green-200' 
                : Math.abs(scoreDifference) <= 30
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-2">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                  Math.abs(scoreDifference) <= 10 ? 'text-green-600' :
                  Math.abs(scoreDifference) <= 30 ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {scoreDifference > 0 ? 'Higher' : 'Lower'} than AI by {Math.abs(scoreDifference)}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {Math.abs(scoreDifference) <= 10 
                      ? '✅ You and AI are in agreement'
                      : Math.abs(scoreDifference) <= 30
                      ? '⚠️ Moderate difference - your insights help improve AI'
                      : '🎯 Significant difference - your feedback will train the AI'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Review Notes */}
          <div className="space-y-2">
            <Label htmlFor="review-notes" className="text-sm font-medium">
              Review Notes *
            </Label>
            <Textarea
              id="review-notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Explain your decision...
              
Examples:
- Strong technical skills but lacks industry experience
- Excellent culture fit, communication skills above average
- Salary expectations too high for this role
- Perfect match - recommend for interview
- Not suitable - skills don't align with requirements"
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Your feedback helps train the AI to make better recommendations
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitReview}
            disabled={isSubmitting || manualScore === null || !reviewNotes.trim()}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isReviewed ? 'Update Review' : 'Submit Review'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-sm text-blue-900 mb-2">💡 Why Manual Review Matters</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• AI provides data-driven matching, but you bring human insight</li>
          <li>• Your reviews help improve AI accuracy over time</li>
          <li>• Consider soft skills, culture fit, and nuances AI might miss</li>
          <li>• Your expertise makes the difference in finding the perfect match</li>
        </ul>
      </div>
    </div>
  );
}

// Helper function to get score color
function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}