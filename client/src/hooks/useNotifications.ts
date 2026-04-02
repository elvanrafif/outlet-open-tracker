import { useState, useEffect } from 'react';
import { pb } from '@/lib/pb';
import { useAuth } from '@/hooks/useAuth';
import type { Task } from '@/types/index';

export interface Notification {
  id: string;
  taskId: string;
  projectId: string;
  projectName: string;
  taskName: string;
  type: 'deadline' | 'overdue';
  daysLeft?: number;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const scanTasks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // Filter task: (1) Belum selesai, (2) Punya deadline
      let filter = 'isCompleted = false && deadline != ""';
      
      // Jika bukan superadmin, hanya lihat task divisi sendiri
      if (user.role !== 'superadmin' && user.divisionId) {
        filter += ` && divisionId = "${user.divisionId}"`;
      }

      const tasks = await pb.collection('tasks').getFullList<Task>({
        filter,
        expand: 'projectId',
      });

      const now = new Date();
      const newNotifs: Notification[] = [];

      tasks.forEach((task: any) => {
        const deadline = new Date(task.deadline);
        const diffTime = deadline.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          // Overdue
          newNotifs.push({
            id: `overdue-${task.id}`,
            taskId: task.id,
            projectId: task.projectId,
            projectName: task.expand?.projectId?.name || 'Unknown Project',
            taskName: task.name,
            type: 'overdue',
          });
        } else if (diffDays <= 7) {
          // Deadline < 7 hari
          newNotifs.push({
            id: `deadline-${task.id}`,
            taskId: task.id,
            projectId: task.projectId,
            projectName: task.expand?.projectId?.name || 'Unknown Project',
            taskName: task.name,
            type: 'deadline',
            daysLeft: diffDays,
          });
        }
      });

      setNotifications(newNotifs);
    } catch (err) {
      console.error('Error scanning for notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scanTasks();
    
    // Refresh notif tiap 5 menit atau saat ada perubahan task
    const interval = setInterval(scanTasks, 5 * 60 * 1000);
    pb.collection('tasks').subscribe('*', scanTasks);

    return () => {
      clearInterval(interval);
      pb.collection('tasks').unsubscribe('*');
    };
  }, [user?.id]);

  return { notifications, loading, refresh: scanTasks };
};
