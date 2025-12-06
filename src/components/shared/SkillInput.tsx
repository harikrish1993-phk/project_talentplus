// ============================================================================
// SkillInput Component - Skill tags input with autocomplete
// Path: components/shared/SkillInput.tsx
// Used by: JobForm, CandidateForm, filters everywhere
// ============================================================================

'use client';

import * as React from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SkillInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  maxSkills?: number;
  className?: string;
}

export default function SkillInput({
  skills = [],
  onChange,
  suggestions = [],
  placeholder = 'Add skills...',
  maxSkills = 50,
  className = '',
}: SkillInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Common tech skills as default suggestions
  const defaultSuggestions = [
    'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java',
    'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis',
    'Next.js', 'Vue.js', 'Angular', 'Express', 'Django', 'Flask',
    'Git', 'CI/CD', 'Agile', 'Scrum', 'REST API', 'GraphQL',
    'HTML', 'CSS', 'Tailwind', 'Material-UI', 'Bootstrap',
    'MySQL', 'Oracle', 'SQL Server', 'Firebase', 'Supabase',
  ];

  const allSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (
      trimmedSkill &&
      !skills.includes(trimmedSkill) &&
      skills.length < maxSkills
    ) {
      onChange([...skills, trimmedSkill]);
      setInputValue('');
      setOpen(false);
      inputRef.current?.focus();
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  const filteredSuggestions = allSuggestions.filter(
    (suggestion) =>
      !skills.includes(suggestion) &&
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Skill Tags */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="pl-2 pr-1 py-1 text-sm"
            >
              {skill}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeSkill(skill)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input with Autocomplete */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder={
                skills.length >= maxSkills
                  ? `Maximum ${maxSkills} skills reached`
                  : placeholder
              }
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setOpen(true);
              }}
              onKeyDown={handleKeyDown}
              disabled={skills.length >= maxSkills}
              className="pr-10"
            />
            {inputValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => addSkill(inputValue)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        
        {filteredSuggestions.length > 0 && (
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search skills..." />
              <CommandEmpty>No skills found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {filteredSuggestions.slice(0, 10).map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    onSelect={() => addSkill(suggestion)}
                    className="cursor-pointer"
                  >
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        )}
      </Popover>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        {skills.length}/{maxSkills} skills • Press Enter to add • Click X to remove
      </p>
    </div>
  );
}
