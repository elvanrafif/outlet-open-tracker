import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '@/lib/pb';
import { fetchProjects, createProject } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { CreateProjectInput } from '@/lib/api';

export const useProjects = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.projects(),
    queryFn: fetchProjects,
  });

  // Real-time: invalidate cache on any project change
  useEffect(() => {
    pb.autoCancellation(false);
    let unsub: (() => void) | undefined;
    pb.collection('projects')
      .subscribe('*', () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
      })
      .then((fn) => { unsub = fn; });
    return () => { unsub?.(); };
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectInput) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
    },
  });

  return {
    projects:       query.data ?? [],
    loading:        query.isLoading,
    error:          query.error ? String(query.error) : null,
    createProject:  createMutation.mutateAsync,
    isCreating:     createMutation.isPending,
  };
};
