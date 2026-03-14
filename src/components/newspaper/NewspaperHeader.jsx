import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import SubscriberGate from './SubscriberGate';
import { useSubscription } from './useSubscription';
import { useSiteSettings } from './useSiteSettings';
import { LogOut, Megaphone, KeyRound } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'בוקר טוב';
  if (hour >= 12 && hour < 17) return 'צהריים טובים';
  if (hour >= 17 && hour < 21) return 'ערב טוב';
  return 'לילה טוב';
};

export default function NewspaperHeader() {
  const [now, setNow] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const { isSubscribed, readerName, code, unlock, logout } = useSubscription();
  const { weeklyPrice } = useSiteSettings();

  const handleUnlock = () => {
    unlock();
    setIsOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 1500); // Give the toast a moment to display before refreshing
  };

  const handleEndSubscription = async () => {
    const isConfirmed = window.confirm('האם אתה בטוח שברצונך לסיים ולמחוק את המנוי?\nלא ניתן יהיה לשחזר אותו או להיכנס איתו שוב לאחר מכן!');
    
    if (isConfirmed && code) {
      const { error } = await supabase
        .from('access_codes')
        .update({ is_closed: true })
        .eq('code_string', code);
      
      if (error) {
        toast.error('שגיאה בסיום המנוי. אנא נסה שוב מאוחר יותר.');
        return;
      }

      toast.success('המנוי העיתונאי בוטל.');
      logout();
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = format(now, "EEEE, d 'ב'MMMM, yyyy | HH:mm", { locale: he });

  return (
    <header className="text-center border-b-4 border-double pb-4 mb-6" style={{ borderColor: '#8b7355' }}>
      <div className="flex items-start justify-between px-4 text-xs tracking-widest uppercase mb-2" style={{ color: '#8b7355' }}>
        <div className="flex flex-col items-start gap-1">
          <span>{today}</span>
          <Link 
            to="/Pricing"
            className="flex items-center justify-center gap-1.5 py-1 px-3 border border-[#8b7355]/30 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-[#8b7355]/5 hover:border-[#8b7355]/50 group bg-[#faf6ed]/50"
            style={{ color: '#8b7355' }}
          >
            <Megaphone className="w-3 h-3" />
            תמחור ופרסום
          </Link>
        </div>
        <span>{/* Empty to balance the flex layout */}</span>
        <div className="flex flex-col items-end gap-2">
          {isSubscribed ? (
            <div className="flex flex-col items-end gap-1">
              <span className="font-bold text-sm" style={{ fontFamily: "'Playfair Display', 'Georgia', serif", color: '#2c241e' }}>
                {getGreeting()}{readerName ? `, ${readerName}` : ''}
              </span>
              <button 
                onClick={handleEndSubscription}
                className="flex items-center gap-1 text-[10px] hover:underline opacity-80"
                style={{ color: '#ef4444' }}
              >
                סיום מנוי <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <span>מחיר: {weeklyPrice} אלדריות</span>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <button 
                    className="px-3 py-1 rounded-sm shadow-sm transition-opacity hover:opacity-90 font-bold"
                    style={{ backgroundColor: '#2c241e', color: '#f4ecd8', fontFamily: "'Georgia', serif" }}
                  >
                    התחברות למנוי
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden" style={{ border: 'none', backgroundColor: '#f4ecd8' }}>
                  <SubscriberGate onUnlock={handleUnlock} />
                </DialogContent>
              </Dialog>
              
            </>
          )}
        </div>
      </div>
      
      <Link to="/Home" className="no-underline">
        <h1 
          className="text-6xl md:text-8xl font-bold tracking-tight leading-none my-2"
          style={{ 
            fontFamily: "'Playfair Display', 'Georgia', serif",
            color: '#2c241e',
            textShadow: '2px 2px 0px rgba(139, 115, 85, 0.15)'
          }}
        >
          The Scoop
        </h1>
      </Link>
      
      <p 
        className="text-sm tracking-[0.1em] uppercase mt-1 font-bold"
        style={{ color: '#8b7355', fontFamily: "'Georgia', serif" }}
      >
        המקור המוביל לחדשות, רכילות וסיפורי עיירת אלדוריה
      </p>
      
      <div className="flex items-center justify-center gap-4 mt-3 text-xs" style={{ color: '#8b7355' }}>
        <span className="hidden md:inline">━━━━━━━━━━━━</span>
        <span className="tracking-widest uppercase">העיתון הרשמי</span>
        <span className="hidden md:inline">━━━━━━━━━━━━</span>
      </div>
    </header>
  );
}