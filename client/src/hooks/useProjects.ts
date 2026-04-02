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

      // Hitung status otomatis untuk setiap project agar tampilan akurat
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const projectsWithCalculatedStatus = records.map((project) => {
        let status = project.status;
        const openingDate = new Date(project.openingDate);
        const diffDays = Math.ceil((openingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (project.progress === 100) {
          status = 'completed';
        } else if (diffDays < 0) {
          status = 'overdue';
        } else if (diffDays < 7) {
          status = 'at_risk';
        } else {
          status = 'on_track';
        }

        return { ...project, status };
      });

      // Persist status ke DB jika ada yang berubah
      const staleProjects = projectsWithCalculatedStatus.filter(
        (p, i) => p.status !== records[i].status
      );
      if (staleProjects.length > 0) {
        await Promise.all(
          staleProjects.map((p) =>
            pb.collection('projects').update(p.id, { status: p.status })
          )
        );
      }

      setProjects(projectsWithCalculatedStatus);
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
