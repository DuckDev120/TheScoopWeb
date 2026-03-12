import React from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Circle, Copy, Trash2, PauseCircle, PlayCircle, User, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabaseClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function AdminCodeList({ codes, isLoading }) {
  const queryClient = useQueryClient();
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('הקוד הועתק!');
  };

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, currentStatus }) => {
      const { error } = await supabase
        .from('access_codes')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-codes'] });
      toast.success('סטטוס הקוד עודכן בהצלחה');
    },
    onError: () => toast.error('שגיאה בעדכון הסטטוס')
  });

  const deleteCodeMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('access_codes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-codes'] });
      toast.success('הקוד נמחק לצמיתות');
    },
    onError: () => toast.error('שגיאה במחיקת הקוד')
  });

  const reviveCodeMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('access_codes')
        .update({ is_used: false, used_date: null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-codes'] });
      toast.success('הקוד הוחזר לחיים ושמיש שוב!');
    },
    onError: () => toast.error('שגיאה בהחזרת הקוד לחיים')
  });

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
              
              {!code.is_active && (
                <Badge variant="destructive" className="text-xs">
                  מושהה
                </Badge>
              )}

              {code.reader_name && (
                <span className="flex items-center gap-1 text-xs opacity-70 ml-2" style={{ color: '#5a4d3f' }}>
                  <User className="w-3 h-3" />
                  {code.reader_name}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {code.is_used && !code.is_closed && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => reviveCodeMutation.mutate(code.id)} 
                  style={{ color: '#3b82f6' }} 
                  title="החזר קוד לחיים (אפשר שימוש מחדש)"
                  disabled={reviveCodeMutation.isPending}
                >
                  <RefreshCcw className="w-4 h-4" />
                </Button>
              )}
              {!code.is_used && (
                <Button variant="ghost" size="icon" onClick={() => copyCode(code.code_string)} style={{ color: '#8b7355' }} title="העתק קוד">
                  <Copy className="w-4 h-4" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => toggleStatusMutation.mutate({ id: code.id, currentStatus: code.is_active })}
                style={{ color: code.is_active ? '#b45309' : '#16a34a' }}
                title={code.is_active ? "השהה קוד" : "הפעל קוד"}
                disabled={toggleStatusMutation.isPending}
              >
                {code.is_active ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  if(window.confirm('האם אתה בטוח שברצונך למחוק קוד זה חלוטין? פעולה זו אינה הפיכה.')) {
                    deleteCodeMutation.mutate(code.id);
                  }
                }}
                style={{ color: '#ef4444' }}
                title="מחק קוד"
                disabled={deleteCodeMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}