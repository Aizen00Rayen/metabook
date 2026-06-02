import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, ShieldCheck, Bookmark, Store } from 'lucide-react';

export const PartnersView: React.FC = () => {
  const { stores, setSelectedStore, t, language } = useApp();

  return (
    <div id="metabook_partners_index" className="space-y-12 pb-24 page-transition">
      
      {/* Editorial Title */}
      <div className="space-y-4 max-w-2xl mx-auto text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.partnerBoutiques}
        </h1>
        <p className="text-slate-400 text-sm font-medium leading-relaxed">
          {language === 'ar' 
            ? 'اكتشف متاجرنا المستقلة الموصى بها، تتميز كل منها بفريق تقييم متميز وقائمة كتب مختارة بدقة' 
            : 'Explore, enter, and navigate individual boutiques hosted by accredited partner stores in the Metabook federation.'
          }
        </p>
      </div>

      {/* Classy Masonry Style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stores.map((store) => (
          <div
            key={store.id}
            onClick={() => setSelectedStore(store)}
            className="group cursor-pointer bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_-4px_rgba(244,63,94,0.08)] transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Banner Canvas */}
            <div className="h-48 relative overflow-hidden bg-slate-100">
              <img
                src={store.bannerImage}
                alt={store.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />
              
              {/* Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-wider text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>{language === 'ar' ? 'تاجر أصيل' : 'Authorized Vendor'}</span>
              </div>
            </div>

            {/* Details Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-bold text-slate-800 tracking-tight group-hover:text-rose-600 transition-colors">
                  {store.name}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3">
                  {store.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Store className="w-4 h-4 text-rose-500/80" />
                  <span>{language === 'ar' ? 'صالة العرض الرقمية فريدة' : 'Premium literary vault'}</span>
                </div>
                
                <span className="flex items-center gap-1 text-xs font-bold text-rose-600 group-hover:underline">
                  <span>{t.viewStore}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
