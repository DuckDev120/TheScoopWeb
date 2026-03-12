import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, Copy, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SCOOP-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function AdminCodeGenerator({ onGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [lastCode, setLastCode] = useState(null);
  const [count, setCount] = useState(1);
  const [readerName, setReaderName] = useState('');

  const handleGenerate = async () => {
    if (!readerName.trim()) {
      toast.error('חובה להזין את שם הקורא המיועד.');
      return;
    }

    setGenerating(true);
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push({ 
        code_string: generateCode(), 
        is_used: false,
        reader_name: readerName.trim(),
        is_active: true
      });
    }
    
    const { error } = await supabase.from('access_codes').insert(codes);
    
    if (error) {
      toast.error('שגיאה ביצירת קודים.');
    } else {
      setLastCode(codes.length === 1 ? codes[0].code_string : `${codes.length} קודים נוצרו בהצלחה עבור ${readerName.trim()}`);
      toast.success(`נוצרו ${codes.length} קודי גישה חדשים!`);
      setReaderName(''); // Reset for next code
      onGenerated();
    }
    setGenerating(false);
  };

  const copyCode = () => {
    if (lastCode && !lastCode.includes('קודים נוצרו')) {
      navigator.clipboard.writeText(lastCode);
      toast.success('הקוד הועתק ללוח!');
    }
  };

  return (
    <div 
      className="border-2 rounded-sm p-6 mb-6 text-right"
      style={{ borderColor: '#c4b69c', backgroundColor: 'rgba(139, 115, 85, 0.06)', direction: 'rtl' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5" style={{ color: '#8b7355' }} />
        <h3 
          className="text-lg font-bold"
          style={{ fontFamily: "'Playfair Display', 'Georgia', serif", color: '#2c241e' }}
        >
          יצירת קודי גישה
        </h3>
      </div>

      <p className="text-sm mb-4" style={{ color: '#5a4d3f', fontFamily: "'Georgia', serif" }}>
        צרו קודי מנוי ייחודיים להפצה בדיסקורד. כל קוד ניתן לשימוש פעם אחת בלבד.
      </p>

      <div className="flex items-end gap-3 justify-start">
        <div>
          <label className="text-xs mb-1 block" style={{ color: '#8b7355', fontFamily: "'Georgia', serif" }}>
            כמות
          </label>
          <Input
            type="number"
            min="1"
            max="50"
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
            className="w-20 border-2"
            style={{ borderColor: '#c4b69c', backgroundColor: '#faf6ed' }}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs mb-1 block" style={{ color: '#8b7355', fontFamily: "'Georgia', serif" }}>
            שם הקורא (חובה)
          </label>
          <Input
            type="text"
            value={readerName}
            onChange={(e) => setReaderName(e.target.value)}
            placeholder="למשל: יוסף מזרחי..."
            className="w-full border-2"
            style={{ borderColor: '#c4b69c', backgroundColor: '#faf6ed' }}
          />
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating || !readerName.trim()}
          style={{ backgroundColor: '#2c241e', color: '#f4ecd8' }}
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <KeyRound className="w-4 h-4 ml-2" />}
          יצירת {count > 1 ? `${count} קודים` : 'קוד'}
        </Button>
      </div>

      {lastCode && (
        <div 
          className="mt-4 p-3 border rounded-sm flex items-center justify-between"
          style={{ borderColor: '#8b7355', backgroundColor: '#faf6ed' }}
        >
          <span 
            className="font-mono text-lg tracking-widest font-bold"
            style={{ color: '#2c241e' }}
          >
            {lastCode}
          </span>
          {!lastCode.includes('קודים נוצרו') && (
            <Button variant="ghost" size="icon" onClick={copyCode} style={{ color: '#8b7355' }}>
              <Copy className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}