import { useState, useEffect, useCallback } from 'react';
import { pb } from '@/lib/pb';
import type { Task, Division, Project } from '@/types/index';

export const useProjectDetail = (projectId: string | undefined) => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      pb.autoCancellation(false);

      const [projectData, tasksData, divisionsData] = await Promise.all([
        pb.collection('projects').getOne<Project>(projectId),
        pb.collection('tasks').getFullList<Task>({
          filter: `projectId = "${projectId}"`,
          sort: 'created',
        }),
        pb.collection('divisions').getFullList<Division>({
          sort: 'name',
        }),
      ]);

      setProject(projectData);
      setTasks(tasksData);
      setDivisions(divisionsData);
    } catch (err) {
      console.error('Error fetching project detail:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();

    pb.collection('tasks').subscribe('*', (e) => {
      if (e.record.projectId === projectId) {
        // Update only the affected task in local state (no full refetch needed)
        setTasks((prev) =>
          prev.map((t) => (t.id === e.record.id ? (e.record as unknown as Task) : t))
        );
      }
    });

    pb.collection('projects').subscribe(projectId ?? '', (e) => {
      setProject(e.record as unknown as Project);
    });

    return () => {
      pb.collection('tasks').unsubscribe('*');
      if (projectId) pb.collection('projects').unsubscribe(projectId);
    };
  }, [projectId, fetchData]);

  const updateTask = async (taskId: string, data: Partial<Task>) => {
    if (!projectId) return { success: false, message: 'No project ID' };

    // 1. Optimistic update — flip the task immediately in local state
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId ? { ...t, ...data } : t
      );

      // 2. Recalculate progress from the updated task list
      const total = updated.length;
      const completed = updated.filter((t) => t.isCompleted).length;
      const newProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

      // 3. Optimistic update on project progress in local state
      setProject((prev) => prev ? { ...prev, progress: newProgress } : prev);

      // 4. Persist task update + project progress to PocketBase in background
      pb.collection('tasks')
        .update(taskId, data)
        .then(() => {
          return pb.collection('projects').update(projectId, { progress: newProgress });
        })
        .catch((err) => {
          console.error('Error updating task or progress:', err);
          // Rollback: refetch fresh data on failure
          fetchData();
        });

      return updated;
    });

    return { success: true };
  };

  const updateProject = async (data: Partial<Project>) => {
    if (!projectId) return { success: false, message: 'No project ID' };
    try {
      const updated = await pb.collection('projects').update<Project>(projectId, data);
      setProject(updated);
      return { success: true };
    } catch (err: any) {
      console.error('Error updating project:', err);
      return { success: false, message: err.message };
    }
  };

  return { project, tasks, divisions, loading, updateTask, updateProject, refresh: fetchData };
};
