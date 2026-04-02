import { useState, useEffect } from 'react';
import { pb } from '@/lib/pb';
import type { Project } from '@/types/index';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Nonaktifkan auto-cancellation agar tidak error saat React double-mount
      pb.autoCancellation(false);
      
      const records = await pb.collection('projects').getFullList<Project>({
        sort: '-created',
      });
      setProjects(records);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Subscribe ke perubahan data secara real-time!
    pb.collection('projects').subscribe('*', function (e) {
      console.log('Real-time project update:', e.action, e.record);
      fetchProjects(); // Refresh data saat ada perubahan
    });

    return () => {
      pb.collection('projects').unsubscribe('*');
    };
  }, []);

  return { projects, loading, error, refresh: fetchProjects };
};
