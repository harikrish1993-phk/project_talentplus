'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SkillInput from '@/components/shared/SkillInput';
import ClientSelector from './ClientSelector';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface JobFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
}

export default function JobForm({ initialData, onSubmit, onCancel }: JobFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    client_id: initialData?.client_id || '',
    location: initialData?.location || '',
    location_type: initialData?.location_type || 'hybrid',
    contract_type: initialData?.contract_type || 'contract',
    duration: initialData?.duration || 6,
    experience_min: initialData?.experience_min || 3,
    experience_max: initialData?.experience_max || 8,
    rate_min: initialData?.rate_min || '',
    rate_max: initialData?.rate_max || '',
    currency: initialData?.currency || 'EUR',
    skills_required: initialData?.skills_required || [],
    skills_preferred: initialData?.skills_preferred || [],
    status: initialData?.status || 'open',
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyzeWithAI = async () => {
    if (!formData.description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please enter a job description first',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: formData.description })
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      
      // Update form with AI extracted data
      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        skills_required: data.skills_required || prev.skills_required,
        skills_preferred: data.skills_preferred || prev.skills_preferred,
        experience_min: data.experience_min || prev.experience_min,
        experience_max: data.experience_max || prev.experience_max,
        location: data.location || prev.location,
      }));

      toast({
        title: 'Analysis complete!',
        description: 'Job details have been extracted from the description'
      });
    } catch (error) {
      toast({
        title: 'Analysis failed',
        description: 'Could not analyze job description',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.client_id) {
      toast({
        title: 'Client required',
        description: 'Please select a client',
        variant: 'destructive'
      });
      return;
    }

    if (formData.skills_required.length === 0) {
      toast({
        title: 'Skills required',
        description: 'Please add at least one required skill',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast({
        title: 'Success',
        description: 'Job has been saved'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save job',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Selection */}
      <div>
        <Label>Client *</Label>
        <ClientSelector
          value={formData.client_id}
          onChange={(clientId) => handleChange('client_id', clientId)}
        />
      </div>

      {/* Job Description with AI */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Job Description *</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAnalyzeWithAI}
            disabled={isAnalyzing || !formData.description.trim()}
          >
            {isAnalyzing ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Analyze with AI</>
            )}
          </Button>
        </div>
        <Textarea
          rows={8}
          placeholder="Paste job description here... AI will extract key details"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Tip: Paste a job description and click "Analyze with AI" to auto-fill fields
        </p>
      </div>

      {/* Job Title */}
      <div>
        <Label>Job Title *</Label>
        <Input
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g., Senior React Developer"
          required
        />
      </div>

      {/* Location & Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Location *</Label>
          <Input
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g., Amsterdam, Netherlands"
            required
          />
        </div>
        <div>
          <Label>Location Type *</Label>
          <Select value={formData.location_type} onValueChange={(v) => handleChange('location_type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="onsite">Onsite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contract Type & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Contract Type *</Label>
          <Select value={formData.contract_type} onValueChange={(v) => handleChange('contract_type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="permanent">Permanent</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Duration (months)</Label>
          <Input
            type="number"
            min="1"
            max="60"
            value={formData.duration}
            onChange={(e) => handleChange('duration', parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Experience Range */}
      <div>
        <Label>Experience Range (years) *</Label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            min="0"
            max="30"
            placeholder="Min"
            value={formData.experience_min}
            onChange={(e) => handleChange('experience_min', parseInt(e.target.value))}
            required
          />
          <Input
            type="number"
            min="0"
            max="30"
            placeholder="Max"
            value={formData.experience_max}
            onChange={(e) => handleChange('experience_max', parseInt(e.target.value))}
            required
          />
        </div>
      </div>

      {/* Rate Range */}
      <div>
        <Label>Daily Rate Range</Label>
        <div className="grid grid-cols-3 gap-4">
          <Input
            type="number"
            min="0"
            placeholder="Min rate"
            value={formData.rate_min}
            onChange={(e) => handleChange('rate_min', e.target.value)}
          />
          <Input
            type="number"
            min="0"
            placeholder="Max rate"
            value={formData.rate_max}
            onChange={(e) => handleChange('rate_max', e.target.value)}
          />
          <Select value={formData.currency} onValueChange={(v) => handleChange('currency', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR €</SelectItem>
              <SelectItem value="USD">USD $</SelectItem>
              <SelectItem value="GBP">GBP £</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Skills */}
      <div>
        <Label>Required Skills *</Label>
        <SkillInput
          skills={formData.skills_required}
          onChange={(skills) => handleChange('skills_required', skills)}
          placeholder="Add required skills..."
        />
      </div>

      <div>
        <Label>Preferred Skills</Label>
        <SkillInput
          skills={formData.skills_preferred}
          onChange={(skills) => handleChange('skills_preferred', skills)}
          placeholder="Add nice-to-have skills..."
        />
      </div>

      {/* Status */}
      <div>
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || isAnalyzing}>
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            'Save Job'
          )}
        </Button>
      </div>
    </form>
  );
}
