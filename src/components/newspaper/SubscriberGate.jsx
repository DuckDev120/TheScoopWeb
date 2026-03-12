import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriberGate({ onUnlock }) {
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) return;
    setVerifying(true);

    const { data: codes, error: fetchError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code_string', code.trim().toUpperCase());
    
    if (fetchError || !codes || codes.length === 0) {
      toast.error('קוד לא תקף. המהדורה הזו אינה מיועדת לפשוטי העם.');
      setVerifying(false);
      return;
    }

    const accessCode = codes[0];
    if (accessCode.is_used) {
      toast.error('הקוד הזה כבר נפדה על ידי קורא אחר.');
      setVerifying(false);
      return;
    }

    // Mark code as used
    const { error: updateError } = await supabase
      .from('access_codes')
      .update({
        is_used: true,
        used_date: new Date().toISOString()
      })
      .eq('id', accessCode.id);

    if (updateError) {
      toast.error('שגיאה בפדיון הקוד. אנא נסו שוב.');
      setVerifying(false);
      return;
    }

    // Store subscription in localStorage (30 days)
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem('scoop_subscription', JSON.stringify({ code: code.trim().toUpperCase(), expiry }));

    toast.success('ברוכים הבאים, מנויים נכבדים! הארכיון פתוח בפניכם.');
    setVerifying(false);
    onUnlock();
  };

  return (
    <div 
      className="relative rounded-sm border-2 p-8 text-center max-w-md mx-auto my-8"
      style={{ 
        borderColor: '#8b7355',
        backgroundColor: 'rgba(139, 115, 85, 0.08)',
        fontFamily: "'Georgia', serif"
      }}
    >
      {/* Decorative corners */}
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: '#8b7355' }} />
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: '#8b7355' }} />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: '#8b7355' }} />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: '#8b7355' }} />

      <Lock className="w-8 h-8 mx-auto mb-3" style={{ color: '#8b7355' }} />
      
      <h3 className="text-xl font-bold mb-2" style={{ color: '#2c241e', fontFamily: "'Playfair Display', 'Georgia', serif" }}>
        ארכיון המנויים
      </h3>
      
      <p className="text-sm mb-5" style={{ color: '#5a4d3f' }}>
        תוכן זה שמור למנויים נכבדים של The Scoop במחיר השקה: <strong style={{ color: '#8b7355' }}>35 אלדריות בשבוע!</strong><br />
        הזינו את קוד הגישה הבלעדי שלכם למטה כדי לקרוא.
      </p>

      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="SCOOP-XXXXXX"
          className="text-center font-mono tracking-widest text-lg border-2"
          style={{ 
            borderColor: '#c4b69c',
            backgroundColor: 'rgba(244, 236, 216, 0.5)',
            color: '#2c241e'
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
        />
        <Button
          onClick={handleVerify}
          disabled={verifying || !code.trim()}
          className="shrink-0"
          style={{ backgroundColor: '#2c241e', color: '#f4ecd8' }}
        >
          {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
        </Button>
      </div>

      <p className="text-xs mt-4 italic" style={{ color: '#8b7355' }}>
        ניתן לקבל קודים מכרוז העיר המקומי או ממנהלי הדיסקורד.
      </p>
    </div>
  );
}