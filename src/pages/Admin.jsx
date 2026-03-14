import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NewspaperHeader from '../components/newspaper/NewspaperHeader';
import AdminArticleForm from '../components/admin/AdminArticleForm';
import AdminArticleList from '../components/admin/AdminArticleList';
import AdminCodeGenerator from '../components/admin/AdminCodeGenerator';
import AdminCodeList from '../components/admin/AdminCodeList';
import AdminAdManager from '../components/admin/AdminAdManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, KeyRound, Lock, Settings, Megaphone, Mail, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import FontLoader from '../components/newspaper/FontLoader';
import { useSiteSettings } from '../components/newspaper/useSiteSettings';
import { useState as useLocalState } from 'react';

export default function Admin() {
  const [editingArticle, setEditingArticle] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const { defaultExpiry, updateSetting, isUpdating: isUpdatingSettings } = useSiteSettings();
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading: loadingArticles } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: codes = [], isLoading: loadingCodes } = useQuery({
    queryKey: ['admin-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('articles').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setShowForm(false);
      toast.success('הכתבה פורסמה בהצלחה!');
    },
    onError: (error) => {
      console.error('Create article error:', error);
      toast.error('שגיאה בפרסום הכתבה: ' + (error.message || 'שגיאה לא ידועה'));
    }
  });

  const updateArticleMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase.from('articles').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setShowForm(false);
      setEditingArticle(null);
      toast.success('הכתבה עודכנה בהצלחה!');
    },
    onError: (error) => {
      console.error('Update article error:', error);
      toast.error('שגיאה בעדכון הכתבה: ' + (error.message || 'שגיאה לא ידועה'));
    }
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success('הכתבה נמחקה.');
    },
    onError: (error) => {
      console.error('Delete article error:', error);
      toast.error('שגיאה במחיקת הכתבה.');
    }
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, isPinned }) => {
      // If pinning, first unpin all others
      if (!isPinned) {
        await supabase.from('articles').update({ is_pinned: false }).eq('is_pinned', true);
      }
      const { error } = await supabase
        .from('articles')
        .update({ is_pinned: !isPinned })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success(vars.isPinned ? 'הכתבה בוטלה מהצמדה.' : 'הכתבה הוצמדה לראש הדף!');
    },
    onError: () => toast.error('שגיאה בעדכון ההצמדה.')
  });

  const handleSubmitArticle = (data) => {
    if (editingArticle) {
       updateArticleMutation.mutate({ id: editingArticle.id, data });
    } else {
       createArticleMutation.mutate(data);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#f4ecd8' }}>
        <FontLoader />
        <div 
          className="relative rounded-sm border-2 p-8 text-center max-w-md w-full shadow-lg"
          style={{ 
            borderColor: '#8b7355',
            backgroundColor: '#f4ecd8',
            fontFamily: "'Georgia', serif"
          }}
        >
          {/* Decorative corners */}
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: '#8b7355' }} />
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: '#8b7355' }} />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: '#8b7355' }} />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: '#8b7355' }} />

          <Lock className="w-8 h-8 mx-auto mb-3" style={{ color: '#8b7355' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', 'Georgia', serif", color: '#2c241e' }}>
            כניסת עורך רשאי בלבד
          </h2>
          <p className="text-sm mb-6" style={{ color: '#5a4d3f' }}>
            נא להזין את סיסמת העורך כדי לגשת לשולחן העבודה.
          </p>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (passwordInput === 'Lavi4528224') {
                setIsAuthenticated(true);
                toast.success('ברוך הבא למערכת הניהול!');
              } else {
                toast.error('למה אתה מנסה להתגנב למשרד שלי?! 👮‍♂️');
                setPasswordInput('');
              }
            }}
            className="flex gap-2"
          >
            <Input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="סיסמת עורך..."
              className="text-center font-mono tracking-widest border-2"
              style={{ borderColor: '#c4b69c', backgroundColor: 'rgba(244, 236, 216, 0.5)', color: '#2c241e' }}
            />
            <Button type="submit" className="shrink-0" style={{ backgroundColor: '#2c241e', color: '#f4ecd8' }}>
              <KeyRound className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4ecd8' }}>

      <FontLoader />
      <div className="relative max-w-5xl mx-auto px-4 py-6">
        <NewspaperHeader />

        <div className="mb-6 pb-3 border-b-2" style={{ borderColor: '#c4b69c' }}>
          <h2 
            className="text-2xl font-bold"
            style={{ fontFamily: "'Playfair Display', 'Georgia', serif", color: '#2c241e' }}
          >
            שולחן העורך
          </h2>
          <p className="text-sm italic mt-1" style={{ color: '#8b7355', fontFamily: "'Georgia', serif" }}>
            ניהול כתבות וקודי גישה למנויים
          </p>
        </div>

        <Tabs defaultValue="articles">
          <TabsList className="mb-6 border" style={{ backgroundColor: 'rgba(139, 115, 85, 0.1)', borderColor: '#c4b69c' }}>
            <TabsTrigger value="articles" className="flex items-center gap-2 data-[state=active]:bg-white">
              <Newspaper className="w-4 h-4" />
              כתבות
            </TabsTrigger>
            <TabsTrigger value="codes" className="flex items-center gap-2 data-[state=active]:bg-white">
              <KeyRound className="w-4 h-4" />
              קודי גישה
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-2 data-[state=active]:bg-white">
              <Megaphone className="w-4 h-4" />
              מודעות
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-white">
              <Settings className="w-4 h-4" />
              הגדרות
            </TabsTrigger>
            <TabsTrigger value="inbox" className="flex items-center gap-2 data-[state=active]:bg-white">
              <Mail className="w-4 h-4" />
              תיבת דואר
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles">
            {showForm ? (
              <AdminArticleForm
                article={editingArticle}
                onSubmit={handleSubmitArticle}
                onCancel={() => { setShowForm(false); setEditingArticle(null); }}
                isSubmitting={createArticleMutation.isPending || updateArticleMutation.isPending}
              />
            ) : (
              <AdminArticleList
                articles={articles}
                isLoading={loadingArticles}
                onAdd={() => { setEditingArticle(null); setShowForm(true); }}
                onEdit={handleEdit}
                onDelete={(id) => deleteArticleMutation.mutate(id)}
                onTogglePin={(id, isPinned) => togglePinMutation.mutate({ id, isPinned })}
              />
            )}
          </TabsContent>

          <TabsContent value="codes">
            <AdminCodeGenerator 
              onGenerated={() => queryClient.invalidateQueries({ queryKey: ['admin-codes'] })} 
            />
            <AdminCodeList codes={codes} isLoading={loadingCodes} />
          </TabsContent>

          <TabsContent value="ads">
            <AdminAdManager />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-6 items-start">
                <PriceEditor />
                <ExpiryEditor />
              </div>
              <CategoryEditor />
            </div>
          </TabsContent>
          <TabsContent value="inbox">
            <AdminInbox />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ExpiryEditor() {
  const { defaultExpiry, updateSetting, isUpdating } = useSiteSettings();
  const [draftDays, setDraftDays] = useLocalState(defaultExpiry);

  React.useEffect(() => {
    setDraftDays(defaultExpiry);
  }, [defaultExpiry]);

  const handleSave = () => {
    const num = parseInt(draftDays);
    if (isNaN(num) || num < 1) {
      toast.error('אנא הזן מספר ימים תקין.');
      return;
    }
    updateSetting({ key: 'default_expiry_days', value: String(draftDays) }, {
      onSuccess: () => toast.success('הגדרת התוקף עודכנה בהצלחה!'),
      onError: () => toast.error('שגיאה בעדכון ההגדרות.')
    });
  };

  return (
    <div
      className="border-2 rounded-sm p-6 max-w-md text-right"
      style={{ borderColor: '#c4b69c', backgroundColor: 'rgba(139, 115, 85, 0.06)', direction: 'rtl' }}
    >
      <h3
        className="text-lg font-bold mb-1"
        style={{ fontFamily: "'Playfair Display', 'Georgia', serif", color: '#2c241e' }}
      >
        תוקף ברירת מחדל למנוי
      </h3>
      <p className="text-sm mb-4" style={{ color: '#8b7355', fontFamily: "'Georgia', serif" }}>
        מספר הימים שקוד חדש יהיה שמיש מרגע היצירה (אלא אם הוגדר אחרת).
      </p>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="1"
          value={draftDays}
          onChange={(e) => setDraftDays(e.target.value)}
          className="w-32 border-2 text-center font-bold text-lg"
          style={{ borderColor: '#c4b69c', backgroundColor: '#faf6ed' }}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <span className="text-sm" style={{ color: '#8b7355' }}>ימים</span>
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          style={{ backgroundColor: '#2c241e', color: '#f4ecd8' }}
        >
          שמור
        </Button>
      </div>
    </div>
  );
}

function PriceEditor() {
  const { 
    weeklyPrice, 
    sponsoredArticlePrice, 
    adPrice, 
    adDesignPrice,
    updateSetting,
    isUpdating
  } = useSiteSettings();

  const [prices, setPrices] = useState({});

  // Sync draft when real values load
  React.useEffect(() => {
    // Fetch all title settings as well
    const fetchTitles = async () => {
      const { data } = await supabase.from('settings').select('*').in('key', [
        'weekly_price_title', 
        'sponsored_article_price_title', 
        'ad_price_title', 
        'ad_design_price_title'
      ]);
      
      const titles = (data || []).reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
      
      setPrices({
        weekly_price: weeklyPrice,
        weekly_price_title: titles.weekly_price_title || 'מנוי שבועי לעיתון',
        sponsored_article_price: sponsoredArticlePrice,
        sponsored_article_price_title: titles.sponsored_article_price_title || 'פרסום כתבה ממומנת',
        ad_price: adPrice,
        ad_price_title: titles.ad_price_title || 'פרסום מודעה',
        ad_design_price: adDesignPrice,
        ad_design_price_title: titles.ad_design_price_title || 'עיצוב ופרסום מודעה'
      });
    };
    
    fetchTitles();
  }, [weeklyPrice, sponsoredArticlePrice, adPrice, adDesignPrice]);

  const handleSave = async (key, val) => {
    updateSetting({ key, value: String(val) }, {
      onSuccess: () => toast.success('ההגדרה עודכנה בהצלחה!'),
      onError: () => toast.error('שגיאה בשמירת ההגדרה.')
    });
  };

  const fields = [
    { key: 'weekly_price', titleKey: 'weekly_price_title', label: 'שירות מנוי שבועי' },
    { key: 'sponsored_article_price', titleKey: 'sponsored_article_price_title', label: 'כתבה ממומנת' },
    { key: 'ad_price', titleKey: 'ad_price_title', label: 'מודעה (באנר)' },
    { key: 'ad_design_price', titleKey: 'ad_design_price_title', label: 'עיצוב ופרסום' }
  ];

  return (
    <div
      className="border-2 rounded-sm p-6 text-right"
      style={{ borderColor: '#c4b69c', backgroundColor: 'rgba(139, 115, 85, 0.06)', direction: 'rtl' }}
    >
      <h3
        className="text-xl font-bold mb-6 flex items-center gap-2"
        style={{ fontFamily: "'Playfair Display', 'Georgia', serif", color: '#2c241e' }}
      >
        <Megaphone className="w-5 h-5 text-[#8b7355]" />
        ניהול תמחור וכותרות שירותים
      </h3>
      
      <div className="space-y-6">
        {fields.map(f => (
          <div key={f.key} className="p-4 bg-white border-2 rounded shadow-sm" style={{ borderColor: '#c4b69c' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 text-right">
                <Label className="font-bold text-[#8b7355] block">כותרת השירות ({f.label})</Label>
                <div className="flex gap-2">
                  <Input
                    value={prices[f.titleKey] || ''}
                    onChange={(e) => setPrices(p => ({...p, [f.titleKey]: e.target.value}))}
                    className="bg-[#faf6ed] border-[#c4b69c] text-right"
                  />
                  <Button size="sm" onClick={() => handleSave(f.titleKey, prices[f.titleKey])} disabled={isUpdating} style={{ backgroundColor: '#2c241e', color: '#f4ecd8' }}>שמור כותרת</Button>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <Label className="font-bold text-[#8b7355] block">מחיר (אלדריות)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={prices[f.key] || ''}
                    onChange={(e) => setPrices(p => ({...p, [f.key]: e.target.value}))}
                    className="bg-[#faf6ed] border-[#c4b69c] text-center font-bold"
                  />
                  <Button size="sm" onClick={() => handleSave(f.key, prices[f.key])} disabled={isUpdating} style={{ backgroundColor: '#2c241e', color: '#f4ecd8' }}>שמור מחיר</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryEditor() {
  const { categories, saveCategories, isUpdating } = useSiteSettings();
  const [list, setList] = useLocalState([]);
  const [newName, setNewName] = useLocalState('');
  const [editingIdx, setEditingIdx] = useLocalState(null);
  const [editingVal, setEditingVal] = useLocalState('');

  // Sync when categories load from Supabase
  React.useEffect(() => {
    setList(categories);
  }, [JSON.stringify(categories)]);

  const save = (updated) => {
    setList(updated);
    saveCategories(updated);
    toast.success('הקטגוריות עודכנו בהצלחה!');
  };

  const addCategory = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (list.includes(trimmed)) { toast.error('קטגוריה זו כבר קיימת.'); return; }
    save([...list, trimmed]);
    setNewName('');
  };

  const deleteCategory = (idx) => {
    if (!window.confirm(`למחוק את הקטגוריה "${list[idx]}"?`)) return;
    save(list.filter((_, i) => i !== idx));
  };

  const startRename = (idx) => {
    setEditingIdx(idx);
    setEditingVal(list[idx]);
  };

  const confirmRename = () => {
    const trimmed = editingVal.trim();
    if (!trimmed) return;
    const updated = [...list];
    updated[editingIdx] = trimmed;
    save(updated);
    setEditingIdx(null);
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const updated = [...list];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    save(updated);
  };

  const moveDown = (idx) => {
    if (idx === list.length - 1) return;
    const updated = [...list];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    save(updated);
  };

  return (
    <div
      className="border-2 rounded-sm p-6 text-right"
      style={{ borderColor: '#c4b69c', backgroundColor: 'rgba(139, 115, 85, 0.06)', direction: 'rtl' }}
    >
      <h3
        className="text-lg font-bold mb-1"
        style={{ fontFamily: "'Playfair Display', 'Georgia', serif", color: '#2c241e' }}
      >
        ניהול קטגוריות
      </h3>
      <p className="text-sm mb-4" style={{ color: '#8b7355', fontFamily: "'Georgia', serif" }}>
        הקטגוריות יופיעו בניווט בעמוד הבית. רק קטגוריות עם כתבות יוצגו.
      </p>

      {/* Existing categories */}
      <div className="space-y-1 mb-4">
        {list.map((cat, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-2 px-3 py-2 border rounded-sm"
            style={{ borderColor: '#c4b69c', backgroundColor: '#faf6ed' }}
          >
            {editingIdx === idx ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  autoFocus
                  value={editingVal}
                  onChange={e => setEditingVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setEditingIdx(null); }}
                  className="h-7 text-sm border px-2 flex-1"
                  style={{ borderColor: '#c4b69c', backgroundColor: '#fff' }}
                />
                <Button size="sm" onClick={confirmRename} style={{ backgroundColor: '#2c241e', color: '#f4ecd8', height: '1.75rem' }}>
                  שמור
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingIdx(null)} style={{ height: '1.75rem', color: '#8b7355' }}>
                  ביטול
                </Button>
              </div>
            ) : (
              <>
                <span className="font-bold text-sm flex-1" style={{ color: '#2c241e', fontFamily: "'Georgia', serif" }}>{cat}</span>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveUp(idx)} title="הזז למעלה" disabled={idx === 0} style={{ color: '#8b7355' }}>
                    ↑
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveDown(idx)} title="הזז למטה" disabled={idx === list.length - 1} style={{ color: '#8b7355' }}>
                    ↓
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startRename(idx)} title="שנה שם" style={{ color: '#8b7355' }}>
                    ✏️
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteCategory(idx)} title="מחק" style={{ color: '#ef4444' }}>
                    🗑
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="flex items-center gap-2">
        <Input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCategory()}
          placeholder="שם קטגוריה חדשה..."
          className="border-2 text-sm"
          style={{ borderColor: '#c4b69c', backgroundColor: '#faf6ed' }}
        />
        <Button
          onClick={addCategory}
          disabled={!newName.trim() || isUpdating}
          style={{ backgroundColor: '#2c241e', color: '#f4ecd8', whiteSpace: 'nowrap' }}
        >
          + הוסף
        </Button>
      </div>
    </div>
  );
}

function AdminInbox() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) toast.error('שגיאה בעדכון הסטטוס');
    else {
      toast.success('סטטוס עודכן');
      queryClient.invalidateQueries(['orders']);
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק הזמנה זו?')) return;
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) toast.error('שגיאה במחיקת ההזמנה');
    else {
      toast.success('הזמנה נמחקה');
      queryClient.invalidateQueries(['orders']);
    }
  };

  if (isLoading) return <div className="p-12 text-center opacity-50 text-[#8b7355]">טוען הודעות...</div>;

  return (
    <div className="space-y-4" style={{ direction: 'rtl' }}>
      <h3 className="text-xl font-bold mb-6 text-right" style={{ fontFamily: "'Playfair Display', serif", color: '#2c241e' }}>
        תיבת דואר - הזמנות חדשות
      </h3>
      {orders.length === 0 ? (
        <div className="p-12 text-center bg-white/50 border-2 border-dashed border-[#c4b69c] rounded-lg opacity-60 italic text-[#8b7355]">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
          אף אחד עוד לא יצר קשר.
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map(order => (
            <div key={order.id} className={`p-6 bg-white border-2 rounded transition-all ${
              order.status === 'completed' ? 'border-green-200 bg-green-50/10' : 
              order.status === 'cancelled' ? 'border-red-200 bg-red-50/10' : 
              'border-[#c4b69c] shadow-sm'
            }`}>
              <div className="flex justify-between items-start">
                <div className="text-right flex-1">
                  <div className="flex items-center gap-3 mb-1 justify-start flex-row-reverse">
                    <span className="font-bold text-lg" style={{ color: '#2c241e' }}>{order.customer_name}</span>
                    <span className="text-[10px] py-0.5 px-2 bg-[#8b7355]/10 text-[#8b7355] rounded-full uppercase font-bold tracking-tighter border border-[#8b7355]/20">
                      {order.order_type}
                    </span>
                  </div>
                  <div className="text-sm opacity-60 mb-2">{order.contact_info === 'N/A' ? 'אין פרטי קשר (שם בלבד)' : order.contact_info}</div>
                  {order.notes && (
                    <div className="p-4 bg-[#f4ecd8]/50 border-r-4 border-[#8b7355] text-sm italic mb-3 text-[#5a4d3f]">
                      "{order.notes}"
                    </div>
                  )}
                  <div className="text-[10px] opacity-40 uppercase tracking-widest leading-loose">
                    {new Date(order.created_at).toLocaleString('he-IL')}
                  </div>
                </div>
                <div className="flex gap-1 items-center mr-4">
                  <button 
                    onClick={() => updateStatus(order.id, 'pending')} 
                    title="ממתין"
                    className={`p-2 rounded-full transition-colors ${order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100 opacity-20'}`}
                  >
                    <Clock className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => updateStatus(order.id, 'completed')} 
                    title="בוצע"
                    className={`p-2 rounded-full transition-colors ${order.status === 'completed' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 opacity-20'}`}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => updateStatus(order.id, 'cancelled')} 
                    title="בוטל"
                    className={`p-2 rounded-full transition-colors ${order.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 opacity-20'}`}
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-gray-200 mx-1" />
                  <button 
                    onClick={() => deleteOrder(order.id)} 
                    title="מחק"
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}