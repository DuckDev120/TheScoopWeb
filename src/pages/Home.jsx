import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import NewspaperHeader from '../components/newspaper/NewspaperHeader';
import NewspaperFooter from '../components/newspaper/NewspaperFooter';
import ArticleCard from '../components/newspaper/ArticleCard';
import SubscriberGate from '../components/newspaper/SubscriberGate';
import CategoryNav from '../components/newspaper/CategoryNav';
import SidebarAds from '../components/newspaper/SidebarAds';
import { useSubscription } from '../components/newspaper/useSubscription';
import { useSiteSettings } from '../components/newspaper/useSiteSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Pin } from 'lucide-react';
import FontLoader from '../components/newspaper/FontLoader';

export default function Home() {
  const { isSubscribed, unlock } = useSubscription();
  const { weeklyPrice } = useSiteSettings();
  const [activeCategory, setActiveCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || null;
  });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
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

  // Filter by category if one is selected
  const filteredArticles = activeCategory
    ? articles.filter(a => a.category === activeCategory)
    : articles;

  // Only pin-feature the article when showing ALL (no active filter)
  const pinnedArticle = !activeCategory ? filteredArticles.find(a => a.is_pinned) : null;
  const latestArticle = pinnedArticle || filteredArticles[0];
  const olderArticles = filteredArticles.filter(a => a.id !== latestArticle?.id);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4ecd8' }}>
      <FontLoader />
      {/* Texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-[1600px] mx-auto flex justify-center gap-6 px-4 min-h-screen">
        {/* Left Sidebar Ads - Desktop only */}
        <aside className="hidden xl:flex flex-col w-64 shrink-0 min-h-full border-l border-r border-transparent" style={{ borderColor: 'rgba(139, 115, 85, 0.1)' }}>
          <SidebarAds position="left" />
        </aside>

        <main className="relative max-w-5xl w-full py-6">
          <NewspaperHeader />

        {/* Promotional Launch Banner — hidden for subscribers */}
        {!isSubscribed && (
          <div
            className="my-6 p-6 border-4 text-center relative overflow-hidden group"
            style={{ borderColor: '#8b7355', backgroundColor: '#f4ecd8' }}
          >
            {/* Decorative corner accents */}
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2" style={{ borderColor: '#8b7355' }} />
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: '#8b7355' }} />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: '#8b7355' }} />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2" style={{ borderColor: '#8b7355' }} />

            <h2
              className="text-3xl md:text-5xl font-bold mb-3 tracking-wide"
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif", color: '#2c241e' }}
            >
              מבצע מיוחד לרגל פתיחת העיתון!
            </h2>
            <p
              className="text-lg md:text-xl italic max-w-2xl mx-auto"
              style={{ color: '#5a4d3f', fontFamily: "'Georgia', serif" }}
            >
              הצטרפו עכשיו למהדורת המנויים של דה סקופ! רק{' '}
              <span className="font-bold underline text-2xl" style={{ color: '#8b7355' }}>
                {weeklyPrice} אלדריות לשבוע
              </span>{' '}
              ותקבלו גישה מלאה לכל הכתבות, הרכילויות והסודות הכמוסים ביותר של אלדוריה.
            </p>
            <div className="mt-4 text-sm font-bold uppercase tracking-widest" style={{ color: '#8b7355' }}>
              ◆ המבצע לזמן מוגבל ◆
            </div>
          </div>
        )}

        {/* Subscriber status bar */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: '#c4b69c' }}>
          <span className="text-xs tracking-widest uppercase" style={{ color: '#8b7355', fontFamily: "'Georgia', serif" }}>
            {isSubscribed ? '⬥ מנוי בגישה מלאה' : '⬥ מהדורה חינמית'}
          </span>
        </div>

        {/* Category navigation */}
        <CategoryNav
          articles={articles}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredArticles.length === 0 ? (
          <EmptyState category={activeCategory} />
        ) : (
          <>
            {/* Hero / Pinned or Latest article */}
            {latestArticle && (
              <section className="mb-8 pb-8 border-b-2" style={{ borderColor: '#c4b69c' }}>
                {latestArticle.is_pinned && (
                  <div className="flex items-center gap-1 mb-2 text-xs tracking-widest uppercase font-bold" style={{ color: '#8b7355' }}>
                    <Pin className="w-3 h-3" /> מוצמד לראש
                  </div>
                )}
                <ArticleCard
                  article={latestArticle}
                  isLocked={!isSubscribed && !latestArticle.is_free}
                  variant="hero"
                />
              </section>
            )}

            {/* Subscriber gate */}
            {!isSubscribed && olderArticles.length > 0 && (
              <SubscriberGate onUnlock={unlock} />
            )}

            {/* Older articles grid */}
            {olderArticles.length > 0 && (
              <section>
                <h3
                  className="text-xs tracking-widest uppercase mb-4 pb-2 border-b"
                  style={{ color: '#8b7355', borderColor: '#c4b69c', fontFamily: "'Georgia', serif" }}
                >
                  {activeCategory ? activeCategory : 'מהדורות קודמות'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                  {olderArticles.map((article) => {
                    const locked = !isSubscribed && !article.is_free;
                    return (
                      <div
                        key={article.id}
                        className="border-b md:border-b-0 md:border-l last:border-l-0 md:pl-6 pb-4 md:pb-0"
                        style={{ borderColor: '#c4b69c' }}
                      >
                        <ArticleCard article={article} isLocked={locked} />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
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

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-80 w-full" style={{ backgroundColor: '#e6dcc6' }} />
      <Skeleton className="h-8 w-2/3" style={{ backgroundColor: '#e6dcc6' }} />
      <Skeleton className="h-4 w-full" style={{ backgroundColor: '#e6dcc6' }} />
      <div className="grid grid-cols-3 gap-6 mt-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 w-full" style={{ backgroundColor: '#e6dcc6' }} />
            <Skeleton className="h-6 w-3/4" style={{ backgroundColor: '#e6dcc6' }} />
            <Skeleton className="h-3 w-full" style={{ backgroundColor: '#e6dcc6' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ category }) {
  return (
    <div className="text-center py-20" style={{ fontFamily: "'Georgia', serif" }}>
      <p className="text-2xl italic mb-2" style={{ color: '#8b7355', fontFamily: "'Playfair Display', 'Georgia', serif" }}>
        {category
          ? `אין כתבות בקטגוריה "${category}" כרגע.`
          : 'הצוות שלנו עובד קשה על כתבות בשבילכם...'}
      </p>
      <p className="text-sm" style={{ color: '#a89a82' }}>
        {category ? 'בחרו קטגוריה אחרת או לחצו "הכל".' : 'בקרוב יפורסמו כתבות. חזרו בקרוב לחדשות האחרונות מאלדוריה.'}
      </p>
    </div>
  );
}