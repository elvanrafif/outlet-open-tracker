import { useState, useEffect } from 'react';
import { pb } from '@/lib/pb';
import type { User, Division } from '@/types/index';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch users dan expand relasi divisi
      const records = await pb.collection('users').getFullList({
        expand: 'divisionId',
        sort: '-created',
      });
      
      const mappedUsers: User[] = records.map(record => ({
        id: record.id,
        email: record.email,
        name: record.name || record.username,
        role: record.role,
        divisionId: record.divisionId,
        division: record.expand?.divisionId ? {
          id: record.expand.divisionId.id,
          name: record.expand.divisionId.name,
        } : undefined,
      }));

      setUsers(mappedUsers);
      
      const divRecords = await pb.collection('divisions').getFullList<Division>({
        sort: 'name',
      });
      setDivisions(divRecords);
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (data: any) => {
    try {
      await pb.collection('users').create({
        ...data,
        emailVisibility: true,
        passwordConfirm: data.password,
      });
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const updateUser = async (id: string, data: any) => {
    try {
      await pb.collection('users').update(id, data);
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await pb.collection('users').delete(id);
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  return { users, divisions, loading, error, createUser, updateUser, deleteUser, refresh: fetchUsers };
};
