import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export function useSubscription() {
  const [subData, setSubData] = useState(() => {
    const stored = localStorage.getItem('scoop_subscription');
    if (!stored) return { isSubscribed: false, readerName: null, code: null, expiresAt: null };
    
    try {
      const parsed = JSON.parse(stored);
      // Check if expired
      if (parsed.expiresAt && new Date() > new Date(parsed.expiresAt)) {
        localStorage.removeItem('scoop_subscription');
        return { isSubscribed: false, readerName: null, code: null, expiresAt: null, wasExpired: true };
      }
      return { 
        isSubscribed: true, 
        readerName: parsed.readerName || null, 
        code: parsed.code,
        expiresAt: parsed.expiresAt || null
      };
    } catch {
      return { isSubscribed: false, readerName: null, code: null, expiresAt: null };
    }
  });

  const unlock = useCallback((readerName = null, code = null, expiresAt = null) => {
    const data = { readerName, code, expiresAt };
    localStorage.setItem('scoop_subscription', JSON.stringify(data));
    setSubData({ isSubscribed: true, readerName, code, expiresAt });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('scoop_subscription');
    setSubData({ isSubscribed: false, readerName: null, code: null, expiresAt: null });
  }, []);

  // Effect to handle "wasExpired" notification on initial load
  useEffect(() => {
    if (subData.wasExpired) {
      toast.error('המנוי שלך פג. אנא התחבר מחדש עם קוד תקף.', {
        description: 'גישתך לתוכן המנויים נחסמה.',
        duration: 5000
      });
      setSubData(prev => ({ ...prev, wasExpired: false }));
    }
  }, [subData.wasExpired]);

  // Effect to monitor expiry in real-time
  useEffect(() => {
    if (subData.isSubscribed && subData.expiresAt) {
      const checkExpiry = () => {
        if (new Date() > new Date(subData.expiresAt)) {
          logout();
          toast.error('מנוייך הסתיים כרגע.', {
            description: 'אנא רכוש מנוי חדש כדי להמשיך לקרוא.',
            duration: 5000
          });
        }
      };

      const timer = setInterval(checkExpiry, 30000); // Check every 30 seconds
      return () => clearInterval(timer);
    }
  }, [subData.isSubscribed, subData.expiresAt, logout]);

  return { 
    isSubscribed: subData.isSubscribed, 
    readerName: subData.readerName,
    code: subData.code,
    expiresAt: subData.expiresAt,
    unlock, 
    logout 
  };
}