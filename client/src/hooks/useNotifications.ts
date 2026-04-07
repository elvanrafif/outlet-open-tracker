import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pb } from '@/lib/pb';
import { fetchNotifications } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/hooks/useAuth';

export type { NotificationRaw as Notification } from '@/lib/api';

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.notifications(user?.id ?? ''),
    queryFn: () => fetchNotifications(user!.id, user!.role, user?.divisionId),
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // re-scan every 5 minutes
  });

  // Real-time: re-scan when any task changes
  useEffect(() => {
    if (!user) return;
    pb.autoCancellation(false);
    pb.collection('tasks').subscribe('*', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user.id) });
    });
    return () => { pb.collection('tasks').unsubscribe('*'); };
  }, [user, queryClient]);

  return {
    notifications: query.data ?? [],
    loading:       query.isLoading,
    refresh:       () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user?.id ?? '') }),
  };
};
