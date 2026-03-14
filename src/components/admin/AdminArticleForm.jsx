import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

import { useSiteSettings } from '../newspaper/useSiteSettings';


export default function AdminArticleForm({ article, onSubmit, onCancel, isSubmitting }) {
  const { categories: managedCategories } = useSiteSettings();
  
  const [form, setForm] = useState({
    title: article?.title || '',
    subtitle: article?.subtitle || '',
    content: article?.content || '',
    image_url: article?.image_url || '',
    author: article?.author || '',
    category: article?.category || (managedCategories.length > 0 ? managedCategories[0] : ''),
    is_free: article?.is_free || false,
    is_published: article?.is_published ?? true,
    is_sponsored: article?.is_sponsored || false,
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalImageUrl = form.image_url;

    if (imageFile) {
      setIsUploadingImage(true);
      try {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('article-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('article-images')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      } catch (error) {
        console.error('Upload Error:', error);
        toast.error('שגיאה בהעלאת התמונה');
        setIsUploadingImage(false);
        return; // don't submit if upload fails
      }
      setIsUploadingImage(false);
    }

    // Automatically generate summary if not present (safeguard)
    const summary = form.content.substring(0, 300) + (form.content.length > 300 ? '...' : '');

    onSubmit({ ...form, image_url: finalImageUrl, summary });
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div 
      className="border-2 rounded-sm p-6 text-right"
      style={{ borderColor: '#c4b69c', backgroundColor: 'rgba(244, 236, 216, 0.5)', direction: 'rtl' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 
          className="text-xl font-bold"
          style={{ fontFamily: "'Playfair Display', 'Georgia', serif", color: '#2c241e' }}
        >
          {article ? 'עריכת כתבה' : 'כתיבת כתבה חדשה'}
        </h3>
        <Button variant="ghost" onClick={onCancel} className="text-sm" style={{ color: '#8b7355' }}>
          <ArrowLeft className="w-4 h-4 ml-1" /> חזרה
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label style={{ color: '#2c241e', fontFamily: "'Georgia', serif" }}>כותרת ראשית *</Label>
          <Input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="אורות מסתוריים נצפו מעל אלדוריה..."
            required
            className="mt-1 text-lg font-bold border-2"
            style={{ borderColor: '#c4b69c', backgroundColor: '#faf6ed', fontFamily: "'Playfair Display', 'Georgia', serif" }}
          />
        </div>

        <div>
          <Label style={{ color: '#2c241e', fontFamily: "'Georgia', serif" }}>כותרת משנה</Label>
          <Input
            value={form.subtitle}
            onChange={(e) => update('subtitle', e.target.value)}
            placeholder="עדי ראייה טוענים כי ראו תופעות קסומות..."
            className="mt-1 border-2"
            style={{ borderColor: '#c4b69c', backgroundColor: '#faf6ed', fontFamily: "'Georgia', serif" }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label style={{ color: '#2c241e', fontFamily: "'Georgia', serif" }}>מחבר</Label>
            <Input
              value={form.author}
              onChange={(e) => update('author', e.target.value)}
              placeholder="קולמוס דיו-סקוויל"
              className="mt-1 border-2"
              style={{ borderColor: '#c4b69c', backgroundColor: '#faf6ed' }}
            />
          </div>
          <div>
            <Label style={{ color: '#2c241e', fontFamily: "'Georgia', serif" }}>קטגוריה</Label>
            <Select value={form.category} onValueChange={(v) => update('category', v)}>
              <SelectTrigger className="mt-1 border-2" style={{ borderColor: '#c4b69c', backgroundColor: '#faf6ed' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {managedCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label style={{ color: '#2c241e', fontFamily: "'Georgia', serif" }}>תמונה</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="mt-1 border-2"
              style={{ borderColor: '#c4b69c', backgroundColor: '#faf6ed' }}
            />
            {form.image_url && !imageFile && (
              <p className="text-xs mt-1" style={{ color: '#8b7355' }}>* כבר יש תמונה בכתבה, אפשר להעלות חדשה כדי להחליף.</p>
            )}
            {imageFile && (
              <p className="text-xs mt-1" style={{ color: '#8b7355' }}>נבחרה תמונה: {imageFile.name}</p>
            )}
          </div>
        </div>

        <div>
          <Label style={{ color: '#2c241e', fontFamily: "'Georgia', serif" }}>גוף הכתבה *</Label>
          <Textarea
            value={form.content}
            onChange={(e) => update('content', e.target.value)}
            placeholder="כתבו את הכתבה המלאה כאן. השתמשו בירידות שורה כדי להפריד בין פסקאות..."
            required
            className="mt-1 min-h-[200px] border-2"
            style={{ borderColor: '#c4b69c', backgroundColor: '#faf6ed', fontFamily: "'Georgia', serif" }}
          />
        </div>

        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <Switch checked={form.is_free} onCheckedChange={(v) => update('is_free', v)} />
            <Label className="text-sm" style={{ color: '#2c241e', fontFamily: "'Georgia', serif" }}>כתבה חינמית</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_published} onCheckedChange={(v) => update('is_published', v)} />
            <Label className="text-sm" style={{ color: '#2c241e', fontFamily: "'Georgia', serif" }}>פורסם</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_sponsored} onCheckedChange={(v) => update('is_sponsored', v)} />
            <Label className="text-sm" style={{ color: '#2c241e', fontFamily: "'Georgia', serif" }}>תוכן ממומן</Label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploadingImage}
            style={{ backgroundColor: '#2c241e', color: '#f4ecd8' }}
          >
            {(isSubmitting || isUploadingImage) ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
            {isUploadingImage ? 'מעלה תמונה...' : (article ? 'עדכון כתבה' : 'פרסום כתבה')}
          </Button>
        </div>
      </form>
    </div>
  );
}