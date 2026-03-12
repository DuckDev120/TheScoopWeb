import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Lock } from 'lucide-react';

export default function ArticleCard({ article, isLocked, variant = 'default' }) {
  const formattedDate = article.created_at 
    ? format(new Date(article.created_at), "d 'ב'MMMM, yyyy", { locale: he }) 
    : '';

  const isHero = variant === 'hero';

  return (
    <Link 
      to={isLocked ? '#' : `/Article?id=${article.id}`}
      className="block group no-underline text-right"
      onClick={(e) => isLocked && e.preventDefault()}
    >
      <article className={`relative ${isHero ? '' : 'pb-4 mb-4'}`} style={{ borderColor: '#c4b69c' }}>
        {/* Image */}
        {article.image_url && (
          <div className={`overflow-hidden mb-3 ${isLocked ? 'opacity-50' : ''}`}>
            <img
              src={article.image_url}
              alt={article.title}
              className={`w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105`}
              style={{ filter: 'sepia(40%) contrast(1.1) brightness(0.95)' }}
            />
          </div>
        )}

        {/* Category badge */}
        {article.category && (
          <span 
            className="text-xs tracking-widest uppercase font-bold"
            style={{ color: '#8b7355', fontFamily: "'Georgia', serif" }}
          >
            {article.category}
          </span>
        )}

        {/* Title */}
        <h2 
          className={`font-bold leading-tight mt-1 mb-2 group-hover:opacity-70 transition-opacity ${isHero ? 'text-3xl md:text-4xl' : 'text-lg md:text-xl'} ${isLocked ? 'blur-[2px]' : ''}`}
          style={{ 
            fontFamily: "'Playfair Display', 'Georgia', serif",
            color: '#2c241e'
          }}
        >
          {article.title}
        </h2>

        {/* Subtitle */}
        {article.subtitle && (
          <p 
            className={`text-sm mb-2 italic ${isLocked ? 'blur-[3px]' : ''}`}
            style={{ color: '#5a4d3f', fontFamily: "'Georgia', serif" }}
          >
            {article.subtitle}
          </p>
        )}

        {/* Preview text */}
        <p 
          className={`text-sm leading-relaxed ${isLocked ? 'blur-[4px]' : ''}`}
          style={{ color: '#5a4d3f', fontFamily: "'Georgia', serif" }}
        >
          {article.content?.substring(0, isHero ? 250 : 120)}...
        </p>

        {/* Meta */}
        <div className="flex items-center justify-start gap-3 mt-3 text-xs" style={{ color: '#8b7355' }}>
          {article.author && <span>מאת {article.author}</span>}
          {article.author && formattedDate && <span>·</span>}
          {formattedDate && <span>{formattedDate}</span>}
        </div>

        {/* Lock overlay */}
        {isLocked && (
          <div 
            className="absolute inset-0 flex items-center justify-center rounded"
            style={{ backgroundColor: 'rgba(244, 236, 216, 0.4)' }}
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-sm border" style={{ backgroundColor: '#f4ecd8', borderColor: '#8b7355', color: '#2c241e' }}>
              <Lock className="w-4 h-4" />
              <span className="text-sm font-bold tracking-wide" style={{ fontFamily: "'Georgia', serif" }}>
                למנויים בלבד
              </span>
            </div>
          </div>
        )}
      </article>
    </Link>
  );
}