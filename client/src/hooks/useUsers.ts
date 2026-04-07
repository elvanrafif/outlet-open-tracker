import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, fetchDivisions, createUser, updateUser } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { CreateUserInput } from '@/lib/api';

export const useUsers = () => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: queryKeys.users(),
    queryFn: fetchUsers,
  });

  const divisionsQuery = useQuery({
    queryKey: queryKeys.divisions(),
    queryFn: fetchDivisions,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.users() });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => createUser(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateUser(id, data),
    onSuccess: invalidate,
  });

  const handleCreate = async (data: CreateUserInput) => {
    try {
      await createMutation.mutateAsync(data);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const handleUpdate = async (id: string, data: Record<string, unknown>) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  return {
    users:       usersQuery.data ?? [],
    divisions:   divisionsQuery.data ?? [],
    loading:     usersQuery.isLoading,
    error:       usersQuery.error ? String(usersQuery.error) : null,
    createUser:  handleCreate,
    updateUser:  handleUpdate,
    isCreating:  createMutation.isPending,
    isUpdating:  updateMutation.isPending,
  };
};
