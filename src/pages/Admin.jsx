import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NewspaperHeader from '../components/newspaper/NewspaperHeader';
import AdminArticleForm from '../components/admin/AdminArticleForm';
import AdminArticleList from '../components/admin/AdminArticleList';
import AdminCodeGenerator from '../components/admin/AdminCodeGenerator';
import AdminCodeList from '../components/admin/AdminCodeList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, KeyRound } from 'lucide-react';
import FontLoader from '../components/newspaper/FontLoader';

export default function Admin() {
  const [editingArticle, setEditingArticle] = useState(null);
  const [showForm, setShowForm] = useState(false);
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
              />
            )}
          </TabsContent>

          <TabsContent value="codes">
            <AdminCodeGenerator 
              onGenerated={() => queryClient.invalidateQueries({ queryKey: ['admin-codes'] })} 
            />
            <AdminCodeList codes={codes} isLoading={loadingCodes} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}