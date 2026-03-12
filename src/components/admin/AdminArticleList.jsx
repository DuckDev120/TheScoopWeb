import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminArticleList({ articles, isLoading, onAdd, onEdit, onDelete }) {
  return (
    <div className="text-right" style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm" style={{ color: '#8b7355', fontFamily: "'Georgia', serif" }}>
          {articles.length} כתבות מופיעות במערכת
        </span>
        <Button onClick={onAdd} style={{ backgroundColor: '#2c241e', color: '#f4ecd8' }}>
          <Plus className="w-4 h-4 ml-2" /> כתבה חדשה
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" style={{ backgroundColor: '#e6dcc6' }} />)}
        </div>
      ) : (
        <div className="space-y-2">
          {articles.map(article => (
            <div
              key={article.id}
              className="flex items-center justify-between p-4 border rounded-sm"
              style={{ borderColor: '#c4b69c', backgroundColor: 'rgba(244, 236, 216, 0.5)' }}
            >
              <div className="flex-1 min-w-0 ml-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4 
                    className="font-bold truncate"
                    style={{ fontFamily: "'Playfair Display', 'Georgia', serif", color: '#2c241e' }}
                  >
                    {article.title}
                  </h4>
                  {article.is_free && (
                    <Badge variant="outline" className="text-xs shrink-0" style={{ borderColor: '#8b7355', color: '#8b7355' }}>
                      חינמי
                    </Badge>
                  )}
                  {!article.is_published && (
                    <Badge variant="outline" className="text-xs shrink-0" style={{ borderColor: '#c4b69c', color: '#a89a82' }}>
                      <EyeOff className="w-3 h-3 ml-1" /> טיוטה
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: '#8b7355' }}>
                  {article.category && <span>{article.category}</span>}
                  {article.author && <><span>·</span><span>{article.author}</span></>}
                  {article.created_at && <><span>·</span><span>{format(new Date(article.created_at), 'd בMMM, yyyy', { locale: he })}</span></>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => onEdit(article)} style={{ color: '#8b7355' }}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(article.id)} style={{ color: '#a85050' }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}