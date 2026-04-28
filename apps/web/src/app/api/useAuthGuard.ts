import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { hasStoredSession } from './session';

export function useAuthGuard(): void {
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasStoredSession()) {
      navigate('/login');
    }
  }, [navigate]);
}
