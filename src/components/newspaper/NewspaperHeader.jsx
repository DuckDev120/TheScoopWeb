import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function NewspaperHeader() {
  const today = format(new Date(), "EEEE, d 'ב'MMMM, yyyy", { locale: he });

  return (
    <header className="text-center border-b-4 border-double pb-4 mb-6" style={{ borderColor: '#8b7355' }}>
      <div className="flex items-center justify-between px-4 text-xs tracking-widest uppercase mb-2" style={{ color: '#8b7355' }}>
        <span>כרך מ"ב · מס' 317</span>
        <span>{today}</span>
        <span>מחיר: 2 מטבעות זהב</span>
      </div>
      
      <Link to="/Home" className="no-underline">
        <h1 
          className="text-6xl md:text-8xl font-bold tracking-tight leading-none my-2"
          style={{ 
            fontFamily: "'Playfair Display', 'Georgia', serif",
            color: '#2c241e',
            textShadow: '2px 2px 0px rgba(139, 115, 85, 0.15)'
          }}
        >
          The Scoop
        </h1>
      </Link>
      
      <p 
        className="text-sm tracking-[0.1em] uppercase mt-1 font-bold"
        style={{ color: '#8b7355', fontFamily: "'Georgia', serif" }}
      >
        המקור המוביל לחדשות, רכילות וסיפורי ממלכת אלדוריה
      </p>
      
      <div className="flex items-center justify-center gap-4 mt-3 text-xs" style={{ color: '#8b7355' }}>
        <span className="hidden md:inline">━━━━━━━━━━━━</span>
        <span className="tracking-widest uppercase">נוסד בשנת הדרקון, העידן השלישי</span>
        <span className="hidden md:inline">━━━━━━━━━━━━</span>
      </div>
    </header>
  );
}