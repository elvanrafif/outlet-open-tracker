import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '@/lib/pb';
import {
  fetchProject, fetchProjectTasks, fetchDivisions,
  updateTask, updateProjectRecord, calcTaskProgress,
} from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Task, Project } from '@/types/index';

export const useProjectDetail = (projectId: string | undefined) => {
  const queryClient = useQueryClient();

  const projectQuery = useQuery({
    queryKey: queryKeys.project(projectId ?? ''),
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
  });

  const tasksQuery = useQuery({
    queryKey: queryKeys.projectTasks(projectId ?? ''),
    queryFn: () => fetchProjectTasks(projectId!),
    enabled: !!projectId,
  });

  const divisionsQuery = useQuery({
    queryKey: queryKeys.divisions(),
    queryFn: fetchDivisions,
  });

  // Real-time: patch task in cache on subscribe event, then sync project progress
  // Store returned unsubscribe fns so cleanup only removes THIS hook's listeners,
  // not other hooks (e.g. useNotifications) that also subscribe to tasks '*'.
  useEffect(() => {
    if (!projectId) return;
    pb.autoCancellation(false);

    let unsubTasks:   (() => void) | undefined;
    let unsubProject: (() => void) | undefined;

    pb.collection('tasks')
      .subscribe(
        '*',
        (e) => {
          if (e.record.projectId !== projectId) return;
          queryClient.setQueryData(
            queryKeys.projectTasks(projectId),
            (prev: Task[] | undefined) =>
              prev
                ? prev.map((t) => (t.id === e.record.id ? (e.record as unknown as Task) : t))
                : prev
          );
        },
        { expand: 'lastEditedBy' }
      )
      .then((fn) => { unsubTasks = fn; });

    pb.collection('projects')
      .subscribe(projectId, (e) => {
        queryClient.setQueryData(
          queryKeys.project(projectId),
          e.record as unknown as Project
        );
      })
      .then((fn) => { unsubProject = fn; });

    return () => {
      unsubTasks?.();
      unsubProject?.();
    };
  }, [projectId, queryClient]);

  // ── Task toggle — optimistic update ──────────────────────────────────────────
  const updateTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      taskData,
      newProgress,
      newStatus,
    }: {
      taskId: string;
      taskData: Partial<Task>;
      newProgress: number;
      newStatus: Project['status'];
    }) => {
      await updateTask(taskId, taskData);
      await updateProjectRecord(projectId!, { progress: newProgress, status: newStatus });
    },

    onMutate: async ({ taskId, taskData, newProgress, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projectTasks(projectId!) });
      await queryClient.cancelQueries({ queryKey: queryKeys.project(projectId!) });

      const prevTasks   = queryClient.getQueryData<Task[]>(queryKeys.projectTasks(projectId!));
      const prevProject = queryClient.getQueryData<Project>(queryKeys.project(projectId!));

      const currentUser = pb.authStore.model;
      const isChecking  = taskData.isCompleted === true;

      queryClient.setQueryData<Task[]>(queryKeys.projectTasks(projectId!), (old) =>
        old?.map((t) =>
          t.id === taskId
            ? {
                ...t,
                ...taskData,
                expand: isChecking && currentUser
                  ? {
                      ...t.expand,
                      lastEditedBy: {
                        id: currentUser.id,
                        name: currentUser.name || currentUser.username,
                        email: currentUser.email,
                        role: currentUser.role,
                        divisionId: currentUser.divisionId,
                      },
                    }
                  : undefined,
              }
            : t
        )
      );

      queryClient.setQueryData<Project>(queryKeys.project(projectId!), (old) =>
        old ? { ...old, progress: newProgress, status: newStatus } : old
      );

      return { prevTasks, prevProject };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prevTasks)
        queryClient.setQueryData(queryKeys.projectTasks(projectId!), ctx.prevTasks);
      if (ctx?.prevProject)
        queryClient.setQueryData(queryKeys.project(projectId!), ctx.prevProject);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectTasks(projectId!) });
    },
  });

  // ── Project edit ──────────────────────────────────────────────────────────────
  const updateProjectMutation = useMutation({
    mutationFn: (data: Partial<Project>) => updateProjectRecord(projectId!, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.project(projectId!), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
    },
  });

  // ── Public interface ──────────────────────────────────────────────────────────
  const handleUpdateTask = (task: Task, taskData: Partial<Task>) => {
    const currentTasks = queryClient.getQueryData<Task[]>(queryKeys.projectTasks(projectId!)) ?? [];
    const optimisticTasks = currentTasks.map((t) =>
      t.id === task.id ? { ...t, ...taskData } : t
    );
    const { progress, status } = calcTaskProgress(
      optimisticTasks,
      projectQuery.data?.openingDate ?? ''
    );
    return updateTaskMutation.mutateAsync({
      taskId: task.id,
      taskData,
      newProgress: progress,
      newStatus: status,
    });
  };

  const handleUpdateProject = async (data: Partial<Project>) => {
    try {
      await updateProjectMutation.mutateAsync(data);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  return {
    project:       projectQuery.data ?? null,
    tasks:         tasksQuery.data ?? [],
    divisions:     divisionsQuery.data ?? [],
    loading:       projectQuery.isLoading || tasksQuery.isLoading,
    updateTask:    handleUpdateTask,
    updateProject: handleUpdateProject,
    refresh:       () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectTasks(projectId!) });
    },
  };
};
