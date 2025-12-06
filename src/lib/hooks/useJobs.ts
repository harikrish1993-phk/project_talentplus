import { useQuery } from '@tanstack/react-query';

export function useJobs() {
  return useQuery({ queryKey: ['jobs'], queryFn: async () => {
    const res = await fetch('/api/jobs');
    return res.json();
  }});
}
