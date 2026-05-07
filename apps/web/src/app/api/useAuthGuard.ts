import { useEffect } from 'react';
import { useLangNavigate } from '../hooks/useLang';
import { hasStoredSession } from './session';

export function useAuthGuard(): void {
  const navigate = useLangNavigate();

  useEffect(() => {
    if (!hasStoredSession()) {
      navigate('/login');
    }
  }, [navigate]);
}
