import { useQuery } from '@tanstack/react-query';

export function useSubmissions() {
  return useQuery({ queryKey: ['submissions'], queryFn: async () => {
    const res = await fetch('/api/submissions');
    return res.json();
  }});
}
