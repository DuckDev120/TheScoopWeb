import React from 'react';
import { Link } from 'react-router-dom';

export default function NewspaperFooter() {
  return (
    <footer 
      className="mt-12 pt-6 border-t-4 border-double text-center pb-8"
      style={{ borderColor: '#8b7355', fontFamily: "'Georgia', serif" }}
    >
      <div className="text-xs tracking-widest uppercase mb-3" style={{ color: '#8b7355' }}>
        ━━━ The Scoop ━━━
      </div>
      <p className="text-xs mb-2" style={{ color: '#8b7355' }}>
        פורסם שבועית ממכונת הדפוס של כיכר העיר אלדוריה
      </p>
      <p className="text-xs italic mb-4" style={{ color: '#a89a82' }}>
        "כל החדשות שראויות לרכילות."
      </p>
      <div className="flex justify-center gap-6 text-xs" style={{ color: '#8b7355' }}>
        <Link to="/Home" className="hover:opacity-70 transition-opacity" style={{ color: '#8b7355' }}>עמוד ראשי</Link>
        <Link to="/Admin" className="hover:opacity-70 transition-opacity" style={{ color: '#8b7355' }}>שולחן העורך</Link>
      </div>
    </footer>
  );
}