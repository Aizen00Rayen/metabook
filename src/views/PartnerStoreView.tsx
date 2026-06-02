import React from 'react';
import { useApp } from '../context/AppContext';
import { BookCard } from '../components/BookCard';
import { ArrowLeft, MapPin, Globe, ShieldCheck, Mail } from 'lucide-react';

export const PartnerStoreView: React.FC = () => {
  const { selectedStore, setSelectedStore, books, setCurrentPage, language, t } = useApp();

  // Guard if selectedStore is missing
  if (!selectedStore) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-slate-500 font-medium">No literary boutique selected.</p>
        <button
          onClick={() => setCurrentPage('partners')}
          className="text-white bg-rose-600 hover:bg-rose-700 font-bold px-6 py-2.5 rounded-full"
        >
          Return to Boutiques
        </button>
      </div>
    );
  }

  // Filter books list for this boutique store
  const storeBooks = books.filter((b) => b.storeId === selectedStore.id);

  return (
    <div id="metabook_partner_boutique_view" className="space-y-12 pb-24 page-transition">
      
      {/* Back button */}
      <button
        onClick={() => {
          setSelectedStore(null);
          setCurrentPage('partners');
        }}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition active:scale-95 bg-white border border-slate-100 shadow-sm px-4 py-2 rounded-full"
      >
        <ArrowLeft className="w-4 h-4 text-rose-600" />
        <span>{language === 'ar' ? 'الرجوع للمتاجر' : 'Back to Literary Boutiques'}</span>
      </button>

      {/* Boutique Banner Spot */}
      <div className="relative rounded-3xl h-64 sm:h-96 md:h-[400px] overflow-hidden shadow-md">
        <img
          src={selectedStore.bannerImage}
          alt={selectedStore.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* Banner Details */}
        <div className="absolute bottom-6 left-6 right-6 sm:bottom-12 sm:left-12 sm:right-12 text-white space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
            <ShieldCheck className="w-4 h-4 text-white fill-rose-600" />
            <span>{language === 'ar' ? 'فئة النخبة المعتمدة' : 'Metabook Certified Partner'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none text-white drop-shadow-sm">
            {selectedStore.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-200/90 font-medium pt-2">
            <p className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>{language === 'ar' ? 'منصة افتراضية مشفرة' : 'Decentralized Digital Vault'}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-rose-500" />
              <span>{language === 'ar' ? 'عالمي' : 'Global Distribution'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sub layout: store description & catalogue books */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
        
        {/* Store description column */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 max-h-fit shadow-sm">
          <h2 className="font-serif text-xl font-bold text-slate-900 border-b border-rose-100/50 pb-3">
            {language === 'ar' ? 'نبذة عن دكان' : 'Boutique Prospectus'}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
            {selectedStore.description}
          </p>

          <div className="space-y-4 pt-4 text-slate-500 text-xs font-semibold">
            <div className="flex items-center gap-3">
              <Mail className="w-4.5 h-4.5 text-rose-500" />
              <span>{selectedStore.ownerUid?.substring(0, 15) || 'partner'}@metabook.org</span>
            </div>
            <div className="p-4 bg-white border border-rose-50 rounded-2xl text-[11px] text-slate-500 line-clamp-3">
              {language === 'ar' 
                ? 'ملاحظة: هذا المتجر مرتبط بقاعدة بيانات ميتابوك. جميع المشتريات والكتب المضافة تظهر بشكل مباشر.'
                : 'Security Assurance: This store is linked to the Metabook database. All records are synchronized in real time.'
              }
            </div>
          </div>
        </div>

        {/* Books Catalogue list */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <span>{language === 'ar' ? 'مخطوطات المتوفرة' : 'Boutique Catalog'}</span>
            <span className="text-xs font-sans px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full font-bold">
              {storeBooks.length}
            </span>
          </h2>

          {storeBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {storeBooks.map((book) => (
                <div key={book.id}>
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8">
              <p className="text-slate-400 font-medium text-sm">
                {language === 'ar' ? 'لا توجد كتب معروضة في هذا المتجر حاليًا.' : 'No books have been published in this partner boutique yet.'}
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
