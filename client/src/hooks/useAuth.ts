import { pb } from '@/lib/pb';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types/index';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { setUser, setIsValid, user, isValid } = useAuthStore();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      
      console.log('Auth data from PB:', authData.record);

      // Map PocketBase record ke interface User kita
      const userData: User = {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name || authData.record.username || 'User',
        role: authData.record.role as any,
        divisionId: authData.record.divisionId,
      };

      setUser(userData);
      setIsValid(true);
      navigate('/');
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
    setIsValid(false);
    navigate('/login');
  };

  const refreshAuth = () => {
    const isAuth = pb.authStore.isValid;
    setIsValid(isAuth);
    if (isAuth && pb.authStore.model) {
      const model = pb.authStore.model;
      console.log('Session model from PB:', model);
      
      setUser({
        id: model.id,
        email: model.email,
        name: model.name || model.username || 'User',
        role: model.role,
        divisionId: model.divisionId,
      });
    } else {
      setUser(null);
    }
  };

  return {
    login,
    logout,
    refreshAuth,
    user,
    isAuthenticated: isValid,
  };
};
