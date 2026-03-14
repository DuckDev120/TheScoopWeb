import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import NewspaperHeader from '../components/newspaper/NewspaperHeader';
import NewspaperFooter from '../components/newspaper/NewspaperFooter';
import SubscriberGate from '../components/newspaper/SubscriberGate';
import SidebarAds from '../components/newspaper/SidebarAds';
import { useSubscription } from '../components/newspaper/useSubscription';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, LogOut } from 'lucide-react';
import FontLoader from '../components/newspaper/FontLoader';

export default function Article() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');
  const { isSubscribed, unlock, logout } = useSubscription();

  const { data: articles = [] } = useQuery({
    queryKey: ['articles-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, subtitle, author, category, image_url, is_free, is_sponsored, created_at, summary')
        .eq('id', articleId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!articleId,
  });

  // Only subscribers or free articles can be read
  const canRead = isSubscribed || article?.is_free;

  // Secondary fetch for content only if authorized
  const { data: fullContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ['article-content', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('content')
        .eq('id', articleId)
        .single();
      if (error) throw error;
      return data.content;
    },
    enabled: !!articleId && canRead,
  });

  return (
    <div className="min-h-screen text-right" style={{ backgroundColor: '#f4ecd8', direction: 'rtl' }}>
      <FontLoader />
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-[1500px] mx-auto flex justify-center gap-8 px-4 min-h-screen">
        {/* Left Sidebar Ads - Desktop only */}
        <aside className="hidden xl:flex flex-col w-64 shrink-0 min-h-full border-l border-r border-transparent" style={{ borderColor: 'rgba(139, 115, 85, 0.1)' }}>
          <SidebarAds position="left" />
        </aside>

        <main className="relative max-w-3xl w-full py-6">
          <NewspaperHeader />

        {/* Nav bar */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b" style={{ borderColor: '#c4b69c' }}>
          <Link 
            to="/Home" 
            className="flex items-center gap-1 text-xs hover:opacity-70 transition-opacity"
            style={{ color: '#8b7355', fontFamily: "'Georgia', serif" }}
          >
            <ArrowRight className="w-3 h-3" />
            חזרה לעמוד הראשי
          </Link>
        </div>

        {isLoading ? (
          <ArticleSkeleton />
        ) : !article ? (
          <div className="text-center py-20" style={{ fontFamily: "'Georgia', serif", color: '#8b7355' }}>
            <p className="text-xl italic">הכתבה לא נמצאה בארכיון.</p>
          </div>
        ) : !canRead ? (
          <LockedArticle article={article} onUnlock={unlock} />
        ) : isLoadingContent ? (
          <div className="space-y-4">
             <Skeleton className="h-4 w-full" style={{ backgroundColor: '#e6dcc6' }} />
             <Skeleton className="h-4 w-full" style={{ backgroundColor: '#e6dcc6' }} />
             <Skeleton className="h-4 w-3/4" style={{ backgroundColor: '#e6dcc6' }} />
          </div>
        ) : (
          <ArticleContent article={{...article, content: fullContent}} />
        )}

        <NewspaperFooter />
        </main>

        {/* Right Sidebar Ads - Desktop only */}
        <aside className="hidden xl:flex flex-col w-64 shrink-0 min-h-full border-l border-r border-transparent" style={{ borderColor: 'rgba(139, 115, 85, 0.1)' }}>
          <SidebarAds position="right" />
        </aside>
      </div>
    </div>
  );
}

function ArticleContent({ article }) {
  const formattedDate = article.created_at 
    ? format(new Date(article.created_at), "EEEE, d 'ב'MMMM, yyyy", { locale: he }) 
    : '';

  return (
    <article>
      {/* Category */}
      <div className="flex items-center gap-2 mb-2">
        {article.category && (
          <span 
            className="text-xs tracking-widest uppercase font-bold hover:underline cursor-pointer"
            style={{ color: '#8b7355', fontFamily: "'Georgia', serif" }}
            onClick={() => window.location.href = `/Home?category=${encodeURIComponent(article.category)}`}
          >
            {article.category}
          </span>
        )}

        {article.is_sponsored && (
          <span className="text-[10px] tracking-widest uppercase font-bold px-1 rounded-sm border" style={{ color: '#d97706', borderColor: '#d97706', backgroundColor: 'rgba(217, 119, 6, 0.05)', fontFamily: "'Georgia', serif" }}>
            תוכן ממומן
          </span>
        )}
      </div>

      {/* Headline */}
      <h1 
        className="text-4xl md:text-5xl font-bold leading-tight mt-2 mb-3"
        style={{ fontFamily: "'Playfair Display', 'Georgia', serif", color: '#2c241e' }}
      >
        {article.title}
      </h1>

      {/* Subtitle */}
      {article.subtitle && (
        <p 
          className="text-lg italic mb-4"
          style={{ color: '#5a4d3f', fontFamily: "'Georgia', serif" }}
        >
          {article.subtitle}
        </p>
      )}

      {/* Byline */}
      <div 
        className="flex items-center gap-3 mb-6 pb-4 border-b"
        style={{ borderColor: '#c4b69c', color: '#8b7355', fontFamily: "'Georgia', serif" }}
      >
        {article.author && <span className="text-sm font-bold">מאת {article.author}</span>}
        {formattedDate && <span className="text-sm">· {formattedDate}</span>}
      </div>

      {/* Image */}
      {article.image_url && (
        <figure className="mb-6">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full aspect-video object-cover rounded-sm"
            style={{ filter: 'sepia(35%) contrast(1.05) brightness(0.95)' }}
          />
          <figcaption 
            className="text-xs italic mt-2 text-center"
            style={{ color: '#8b7355' }}
          >
            איור באדיבות ארכיון The Scoop
          </figcaption>
        </figure>
      )}

      {/* Body */}
      <div 
        className="text-base leading-relaxed space-y-6 text-justify"
        style={{ 
          fontFamily: "'Georgia', serif",
          color: '#2c241e',
        }}
      >
        {article.content?.split('\n').filter(Boolean).map((paragraph, i) => (
          <p key={i}>
            {paragraph}
          </p>
        ))}
      </div>

      {/* End mark */}
      <div className="text-center mt-8 text-2xl" style={{ color: '#8b7355' }}>
        ◆
      </div>
    </article>
  );
}

function LockedArticle({ article, onUnlock }) {
  const previewText = article.summary || article.content?.substring(0, 300) || "...";

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {article.category && (
          <span 
            className="text-xs tracking-widest uppercase font-bold hover:underline cursor-pointer"
            style={{ color: '#8b7355', fontFamily: "'Georgia', serif" }}
            onClick={() => window.location.href = `/Home?category=${encodeURIComponent(article.category)}`}
          >
            {article.category}
          </span>
        )}

        {article.is_sponsored && (
          <span className="text-[10px] tracking-widest uppercase font-bold px-1 rounded-sm border" style={{ color: '#d97706', borderColor: '#d97706', backgroundColor: 'rgba(217, 119, 6, 0.05)', fontFamily: "'Georgia', serif" }}>
            תוכן ממומן
          </span>
        )}
      </div>

      <h1 
        className="text-4xl md:text-5xl font-bold leading-tight mt-2 mb-3"
        style={{ fontFamily: "'Playfair Display', 'Georgia', serif", color: '#2c241e' }}
      >
        {article.title}
      </h1>

      {article.subtitle && (
        <p className="text-lg italic mb-4" style={{ color: '#5a4d3f', fontFamily: "'Georgia', serif" }}>
          {article.subtitle}
        </p>
      )}

      {/* Blurred preview */}
      <div className="relative overflow-hidden" style={{ maxHeight: '200px' }}>
        <p 
          className="text-base leading-relaxed blur-[6px]"
          style={{ fontFamily: "'Georgia', serif", color: '#2c241e' }}
        >
          {previewText} {previewText.length > 200 ? '...' : ''}
        </p>
        <div 
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: 'linear-gradient(transparent, #f4ecd8)' }}
        />
      </div>

      <SubscriberGate onUnlock={onUnlock} />
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-24" style={{ backgroundColor: '#e6dcc6' }} />
      <Skeleton className="h-12 w-full" style={{ backgroundColor: '#e6dcc6' }} />
      <Skeleton className="h-6 w-2/3" style={{ backgroundColor: '#e6dcc6' }} />
      <Skeleton className="h-80 w-full mt-4" style={{ backgroundColor: '#e6dcc6' }} />
      <Skeleton className="h-4 w-full" style={{ backgroundColor: '#e6dcc6' }} />
      <Skeleton className="h-4 w-full" style={{ backgroundColor: '#e6dcc6' }} />
      <Skeleton className="h-4 w-3/4" style={{ backgroundColor: '#e6dcc6' }} />
    </div>
  );
}