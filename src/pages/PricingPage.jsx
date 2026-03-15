import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import NewspaperHeader from '../components/newspaper/NewspaperHeader';
import NewspaperFooter from '../components/newspaper/NewspaperFooter';
import SidebarAds from '../components/newspaper/SidebarAds';
import FontLoader from '../components/newspaper/FontLoader';
import { Check, ShieldCheck, Megaphone, Paintbrush, FileText, Loader2, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function PricingPage() {
  const [isOrderOpen, setIsOrderOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    service: '',
    notes: ''
  });

  const { data: prices = {} } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
      return data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    },
  });

  const cards = [
    {
      title: prices.weekly_price_title || 'מנוי שבועי לעיתון',
      price: prices.weekly_price || '35',
      description: 'גישה מלאה לכל הכתבות והתכנים למשך שבוע שלם.',
      icon: <ShieldCheck className="w-8 h-8" />,
      features: ['קריאת כל הכתבות באתר', 'גישה למדור הרכילות', 'עדכונים שוטפים בזמן אמת']
    },
    {
      title: prices.sponsored_article_price_title || 'פרסום כתבה ממומנת',
      price: prices.sponsored_article_price || '150',
      description: 'כתבה מקצועית ממותגת שמודגשת בדף הבית.',
      icon: <FileText className="w-8 h-8" />,
      features: ['כתיבה על ידי המערכת', 'תיוג כתוכן ממומן', 'חשיפה מקסימלית באתר']
    },
    {
      title: prices.ad_price_title || 'פרסום מודעה',
      price: prices.ad_price || '50',
      description: 'באנר פרסומי בסיידבר של האתר (תמונה או טקסט).',
      icon: <Megaphone className="w-8 h-8" />,
      features: ['בחירת מיקום (ימין/שמאל)', 'קישור ישיר לעסק שלכם', 'משיכת עין של קוראים']
    },
    {
      title: prices.ad_design_price_title || 'עיצוב ופרסום מודעה',
      price: prices.ad_design_price || '75',
      description: 'אנחנו מעצבים לכם את המודעה ומפרסמים אותה באתר.',
      icon: <Paintbrush className="w-8 h-8" />,
      features: ['עיצוב גרפי מקצועי', 'התאמה למיתוג האתר', 'הכל כלול בחבילה אחת']
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4ecd8' }}>
      <FontLoader />
      {/* Texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")` }}
      />

      <div className="relative max-w-[1600px] mx-auto flex justify-center gap-6 px-4 min-h-screen">
        {/* Left Sidebar Ads */}
        <aside className="hidden xl:flex flex-col w-64 shrink-0 min-h-full border-l border-r border-transparent" style={{ borderColor: 'rgba(139, 115, 85, 0.1)' }}>
          <SidebarAds position="left" />
        </aside>

        <main className="relative max-w-5xl w-full py-6">
          <NewspaperHeader />
          
          <div className="w-full mt-12 mb-16 text-center">
            <h1 
              className="text-5xl font-bold mb-4" 
              style={{ fontFamily: "'Playfair Display', serif", color: '#2c241e' }}
            >
              תמחור שירותי "הסקופ"
            </h1>
            <p className="text-xl italic opacity-70 max-w-2xl mx-auto" style={{ fontFamily: "'Georgia', serif" }}>
              בחרו את החבילה המתאימה לכם והצטרפו לקהילת הקוראים והמפרסמים הגדולה באלדוריה.
            </p>
            <div className="w-24 h-1 bg-[#8b7355] mx-auto mt-6 opacity-30" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-4 mb-20">
            {cards.map((card, i) => (
              <div 
                key={i}
                className="group relative bg-[#faf6ed] border-2 border-[#c4b69c] p-8 transition-all hover:-translate-y-1 hover:shadow-xl"
                style={{ direction: 'rtl' }}
              >
                {/* Vintage Corner Brackets */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#8b7355] opacity-20" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#8b7355] opacity-20" />
                
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-[#2c241e] text-[#f4ecd8]">
                    {card.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold" style={{ color: '#2c241e' }}>{card.price} <span className="text-lg opacity-50">אלדריות</span></div>
                    <div className="text-[10px] uppercase tracking-widest opacity-40">מחיר שירות</div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: '#2c241e' }}>
                  {card.title}
                </h3>
                
                <p className="text-sm opacity-70 mb-6 italic leading-relaxed">
                  {card.description}
                </p>

                <ul className="space-y-3">
                  {card.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#8b7355]/10 flex items-center justify-center text-[#8b7355]">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
                  <DialogTrigger asChild>
                    <button 
                      onClick={() => {
                        setSelectedPlan(card);
                        setFormData(prev => ({ ...prev, service: card.title }));
                      }}
                      className="w-full mt-8 py-4 border-2 border-[#2c241e] font-bold uppercase tracking-widest transition-colors hover:bg-[#2c241e] hover:text-[#f4ecd8]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      הזמן עכשיו
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden" style={{ backgroundColor: '#f4ecd8', fontFamily: "'Playfair Display', serif" }}>
                    <div className="p-8">
                      <DialogHeader className="mb-6">
                        <DialogTitle className="text-3xl font-bold text-center" style={{ color: '#2c241e' }}>
                          הזמנת {selectedPlan?.title}
                        </DialogTitle>
                        <div className="w-16 h-1 bg-[#8b7355] mx-auto mt-2 opacity-30" />
                      </DialogHeader>

                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        setIsSubmitting(true);
                        try {
                          const { error } = await supabase.from('orders').insert([{
                            customer_name: formData.name,
                            contact_info: 'N/A',
                            order_type: formData.service || selectedPlan?.title,
                            notes: formData.notes,
                            status: 'pending'
                          }]);
                          if (error) throw error;
                          toast.success('ההזמנה התקבלה בהצלחה! השליח בדרך נחזור אליך בהקדם.');
                          setIsOrderOpen(false);
                          setFormData({ name: '', service: '', notes: '' });
                        } catch (err) {
                          console.error(err);
                          toast.error('שגיאה בשליחת ההזמנה.');
                        } finally {
                          setIsSubmitting(false);
                        }
                      }} className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                        <div>
                          <Label className="text-[#8b7355] font-bold mb-1 block">שם מלא</Label>
                          <Input 
                            required
                            value={formData.name}
                            onChange={e => setFormData(d => ({...d, name: e.target.value}))}
                            placeholder="הכנס את שמך..." 
                            className="bg-[#faf6ed] border-[#c4b69c]"
                          />
                        </div>
                        <div>
                          <Label className="text-[#8b7355] font-bold mb-1 block">סוג השירות</Label>
                          <select 
                            required
                            value={formData.service}
                            onChange={e => setFormData(d => ({...d, service: e.target.value}))}
                            className="w-full p-2 bg-[#faf6ed] border-2 border-[#c4b69c] rounded-md text-sm font-bold"
                          >
                            <option value="">בחר שירות...</option>
                            {cards.map(c => <option key={c.title} value={c.title}>{c.title}</option>)}
                          </select>
                        </div>
                        <div>
                          <Label className="text-[#8b7355] font-bold mb-1 block">הערות / בקשות מיוחדות</Label>
                          <Textarea 
                            value={formData.notes}
                            onChange={e => setFormData(d => ({...d, notes: e.target.value}))}
                            placeholder="ספר לנו קצת יותר על ההזמנה שלך..." 
                            className="bg-[#faf6ed] border-[#c4b69c] h-32"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full py-6 mt-4 text-lg font-bold bg-[#2c241e] text-[#f4ecd8] hover:bg-[#3d332c]"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin ml-2" /> : <Send className="ml-2 w-5 h-5" />}
                          שלח הזמנה למערכת
                        </Button>
                      </form>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>

          <NewspaperFooter />
        </main>

        {/* Right Sidebar Ads */}
        <aside className="hidden xl:flex flex-col w-64 shrink-0 min-h-full border-l border-r border-transparent" style={{ borderColor: 'rgba(139, 115, 85, 0.1)' }}>
          <SidebarAds position="right" />
        </aside>
      </div>
    </div>
  );
}
