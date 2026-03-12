import React from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Circle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminCodeList({ codes, isLoading }) {
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('הקוד הועתק!');
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full" style={{ backgroundColor: '#e6dcc6' }} />)}
      </div>
    );
  }

  return (
    <div className="text-right" style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm" style={{ color: '#8b7355', fontFamily: "'Georgia', serif" }}>
          {codes.length} קודים סה"כ · {codes.filter(c => !c.is_used).length} פנויים
        </span>
      </div>

      <div className="space-y-1">
        {codes.map(code => (
          <div
            key={code.id}
            className="flex items-center justify-between p-3 border rounded-sm"
            style={{ 
              borderColor: '#c4b69c', 
              backgroundColor: code.is_used ? 'rgba(139, 115, 85, 0.05)' : 'rgba(244, 236, 216, 0.5)',
              opacity: code.is_used ? 0.6 : 1
            }}
          >
            <div className="flex items-center gap-3">
              {code.is_used ? (
                <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#8b7355' }} />
              ) : (
                <Circle className="w-4 h-4 shrink-0" style={{ color: '#8b7355' }} />
              )}
              <span 
                className="font-mono tracking-wider font-bold text-sm"
                style={{ color: '#2c241e' }}
              >
                {code.code_string}
              </span>
              {code.is_used ? (
                <Badge variant="outline" className="text-xs" style={{ borderColor: '#c4b69c', color: '#a89a82' }}>
                  נפדה{code.used_date ? ` · ${format(new Date(code.used_date), 'd בMMM', { locale: he })}` : ''}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs" style={{ borderColor: '#8b7355', color: '#8b7355' }}>
                  פנוי
                </Badge>
              )}
            </div>
            {!code.is_used && (
              <Button variant="ghost" size="icon" onClick={() => copyCode(code.code_string)} style={{ color: '#8b7355' }}>
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}