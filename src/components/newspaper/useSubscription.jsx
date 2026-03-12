import { useState, useCallback } from 'react';

export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(() => {
    const stored = localStorage.getItem('scoop_subscription');
    if (!stored) return false;
    const { expiry } = JSON.parse(stored);
    if (Date.now() > expiry) {
      localStorage.removeItem('scoop_subscription');
      return false;
    }
    return true;
  });

  const unlock = useCallback(() => {
    setIsSubscribed(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('scoop_subscription');
    setIsSubscribed(false);
  }, []);

  return { isSubscribed, unlock, logout };
}