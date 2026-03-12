import { useState, useCallback } from 'react';

export function useSubscription() {
  const [subData, setSubData] = useState(() => {
    const stored = localStorage.getItem('scoop_subscription');
    if (!stored) return { isSubscribed: false, readerName: null, code: null };
    
    try {
      const parsed = JSON.parse(stored);
      if (Date.now() > parsed.expiry) {
        localStorage.removeItem('scoop_subscription');
        return { isSubscribed: false, readerName: null, code: null };
      }
      return { isSubscribed: true, readerName: parsed.readerName || null, code: parsed.code };
    } catch {
      return { isSubscribed: false, readerName: null, code: null };
    }
  });

  const unlock = useCallback((readerName = null, code = null) => {
    setSubData({ isSubscribed: true, readerName, code });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('scoop_subscription');
    setSubData({ isSubscribed: false, readerName: null, code: null });
  }, []);

  return { 
    isSubscribed: subData.isSubscribed, 
    readerName: subData.readerName,
    code: subData.code,
    unlock, 
    logout 
  };
}