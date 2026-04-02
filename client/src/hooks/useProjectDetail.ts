import { useState, useEffect } from 'react';
import { pb } from '@/lib/pb';
import type { Task, Division, Project } from '@/types/index';

export const useProjectDetail = (projectId: string | undefined) => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      // Nonaktifkan auto-cancellation agar data tetap tampil meski React double-mount
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
  };

  useEffect(() => {
    fetchData();

    // Subscribe ke perubahan task secara real-time
    pb.collection('tasks').subscribe('*', function (e) {
      if (e.record.projectId === projectId) {
        fetchData();
      }
    });

    return () => {
      pb.collection('tasks').unsubscribe('*');
    };
  }, [projectId]);

  const updateTask = async (taskId: string, data: Partial<Task>) => {
    try {
      await pb.collection('tasks').update(taskId, data);
      // Data akan ter-update via subscribe real-time
      return { success: true };
    } catch (err: any) {
      console.error('Error updating task:', err);
      return { success: false, message: err.message };
    }
  };

  return { project, tasks, divisions, loading, updateTask, refresh: fetchData };
};
