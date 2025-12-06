import { useQuery } from '@tanstack/react-query';

export function useCandidates() {
  return useQuery({ queryKey: ['candidates'], queryFn: async () => {
    const res = await fetch('/api/candidates');
    return res.json();
  }});
}
