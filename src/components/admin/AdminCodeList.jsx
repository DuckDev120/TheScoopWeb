import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Circle, Copy, Trash2, PauseCircle, PlayCircle, User, RefreshCcw, Pencil, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabaseClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function AdminCodeList({ codes, isLoading }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingExpiryId, setEditingExpiryId] = useState(null);
  const [editingExpiryValue, setEditingExpiryValue] = useState('');

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

  const renameReaderMutation = useMutation({
    mutationFn: async ({ id, name }) => {
      const { error } = await supabase
        .from('access_codes')
        .update({ reader_name: name.trim() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-codes'] });
      toast.success('שם הקורא עודכן!');
      setEditingId(null);
    },
    onError: () => toast.error('שגיאה בעדכון שם הקורא')
  });

  const updateExpiryMutation = useMutation({
    mutationFn: async ({ id, expiresAt }) => {
      const { error } = await supabase
        .from('access_codes')
        .update({ expires_at: expiresAt ? new Date(expiresAt).toISOString() : null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-codes'] });
      toast.success('תוקף הקוד עודכן!');
      setEditingExpiryId(null);
    },
    onError: () => toast.error('שגיאה בעדכון התוקף')
  });

  const startEdit = (code) => {
    setEditingId(code.id);
    setEditingName(code.reader_name || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = (id) => {
    if (!editingName.trim()) return;
    renameReaderMutation.mutate({ id, name: editingName });
  };

  const startExpiryEdit = (code) => {
    setEditingExpiryId(code.id);
    const dateStr = code.expires_at ? format(new Date(code.expires_at), 'yyyy-MM-dd') : '';
    setEditingExpiryValue(dateStr);
  };

  const saveExpiryEdit = (id) => {
    updateExpiryMutation.mutate({ id, expiresAt: editingExpiryValue });
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
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {code.is_used ? (
                <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#8b7355' }} />
              ) : (
                <Circle className="w-4 h-4 shrink-0" style={{ color: '#8b7355' }} />
              )}
              <span 
                className="font-mono tracking-wider font-bold text-sm shrink-0"
                style={{ color: '#2c241e' }}
              >
                {code.code_string}
              </span>
              {code.is_used ? (
                <Badge variant="outline" className="text-xs shrink-0" style={{ borderColor: '#c4b69c', color: '#a89a82' }}>
                  נפדה{code.used_date ? ` · ${format(new Date(code.used_date), 'd בMMM', { locale: he })}` : ''}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs shrink-0" style={{ borderColor: '#8b7355', color: '#8b7355' }}>
                  פנוי
                </Badge>
              )}
              
              {!code.is_active && (
                <Badge variant="destructive" className="text-xs shrink-0">
                  מושהה
                </Badge>
              )}

                <div className="flex items-center gap-1">
                  {editingExpiryId === code.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="date"
                        value={editingExpiryValue}
                        onChange={(e) => setEditingExpiryValue(e.target.value)}
                        className="h-6 text-xs px-1 w-28 border"
                        style={{ borderColor: '#c4b69c', backgroundColor: '#faf6ed' }}
                      />
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        onClick={() => saveExpiryEdit(code.id)}
                        disabled={updateExpiryMutation.isPending}
                        style={{ color: '#16a34a' }}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        onClick={() => setEditingExpiryId(null)}
                        style={{ color: '#ef4444' }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <Badge 
                      variant="outline" 
                      className={`text-xs shrink-0 flex items-center gap-1 cursor-pointer hover:bg-white transition-colors ${code.expires_at && new Date(code.expires_at) < new Date() ? 'bg-red-100 text-red-700 border-red-200' : ''}`}
                      style={!code.expires_at || new Date(code.expires_at) >= new Date() ? { borderColor: '#c4b69c', color: '#8b7355' } : {}}
                      onClick={() => startExpiryEdit(code)}
                      title={code.expires_at ? "לחץ לעריכת תוקף" : "לחץ לקביעת תוקף"}
                    >
                      <Clock className="w-3 h-3" />
                      {code.expires_at ? (
                        <>
                          תוקף: {format(new Date(code.expires_at), 'd/MM/yy')}
                          {new Date(code.expires_at) < new Date() && ' (פג תוקף)'}
                        </>
                      ) : (
                        "ללא תוקף (קבע כעת)"
                      )}
                      <Pencil className="w-2 h-2 ml-1 opacity-40" />
                    </Badge>
                  )}
                </div>

              {/* Reader name — inline editable */}
              <div className="flex items-center gap-1 mr-1">
                {editingId === code.id ? (
                  <>
                    <Input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(code.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="h-6 text-xs px-2 w-32 border"
                      style={{ borderColor: '#c4b69c', backgroundColor: '#faf6ed' }}
                    />
                    <Button
                      variant="ghost" size="icon"
                      className="h-6 w-6"
                      onClick={() => saveEdit(code.id)}
                      disabled={renameReaderMutation.isPending || !editingName.trim()}
                      style={{ color: '#16a34a' }}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-6 w-6"
                      onClick={cancelEdit}
                      style={{ color: '#ef4444' }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                ) : (
                  <span
                    className="flex items-center gap-1 text-xs opacity-70 cursor-pointer hover:opacity-100 group"
                    style={{ color: '#5a4d3f' }}
                    onClick={() => startEdit(code)}
                    title="לחץ לשינוי שם"
                  >
                    <User className="w-3 h-3" />
                    {code.reader_name || <em>ללא שם</em>}
                    <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
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