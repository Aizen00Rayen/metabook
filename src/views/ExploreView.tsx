import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookCard } from '../components/BookCard';
import { Search, SlidersHorizontal, Sparkles, Filter } from 'lucide-react';

export const ExploreView: React.FC = () => {
  const { books, stores, t, language } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'originals' | 'partner'>('all');

  // Multi-tier search
  const filteredBooks = books.filter((book) => {
    const store = stores.find(s => s.id === book.storeId);
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store && store.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = 
      selectedFilter === 'all' || 
      (selectedFilter === 'originals' && book.isOriginal) ||
      (selectedFilter === 'partner' && !book.isOriginal);

    return matchesSearch && matchesFilter;
  });

  return (
    <div id="metabook_explore_view" className="space-y-8 pb-24 page-transition">
      
      {/* Search Header Container */}
      <div className="space-y-4 max-w-2xl mx-auto text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {language === 'ar' ? 'المعرض والكتالوج الشامل' : 'The Exhibition Gallery'}
        </h1>
        <p className="text-slate-400 text-sm font-medium leading-relaxed">
          {language === 'ar' 
            ? 'تصفح المخطوطات والكتب الحصرية من كل المتاجر الأدبية الموثقة' 
            : 'Browse, investigate, and purchase digital masterpieces across all of Metabook\'s secure literary partner boutiques.'
          }
        </p>
      </div>

      {/* Floating Design Search Input */}
      <div className="max-w-2xl mx-auto">
        <div className="relative flex items-center bg-white border border-slate-100 rounded-2xl shadow-md p-1 group focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
          <div className="flex items-center ps-4 text-slate-400">
            <Search className="w-5 h-5 group-focus-within:text-rose-600 transition" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent py-3.5 px-4 text-slate-700 text-sm focus:outline-none focus:ring-0 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Filters pill bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all ${
            selectedFilter === 'all'
              ? 'bg-rose-600 border-transparent text-white shadow-md shadow-rose-600/10'
              : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
          }`}
        >
          {t.allCategories}
        </button>

        <button
          onClick={() => setSelectedFilter('originals')}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all ${
            selectedFilter === 'originals'
              ? 'bg-rose-600 border-transparent text-white shadow-md shadow-rose-600/10'
              : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.original}</span>
        </button>

        <button
          onClick={() => setSelectedFilter('partner')}
          className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all ${
            selectedFilter === 'partner'
              ? 'bg-rose-600 border-transparent text-white shadow-md shadow-rose-600/10'
              : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
          }`}
        >
          {t.nonOriginal}
        </button>
      </div>

      {/* Search Result Counter */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {language === 'ar' ? `تم العثور على ${filteredBooks.length} مؤلف` : `Curated Masterpieces (${filteredBooks.length})`}
        </span>
      </div>

      {/* Dynamic Inventory Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredBooks.map((book) => (
            <div key={book.id}>
              <BookCard book={book} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-50 rounded-3xl border border-dashed border-slate-200 max-w-lg mx-auto p-8 space-y-4">
          <p className="text-slate-400 font-medium text-sm leading-relaxed">{t.noBooksFound}</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedFilter('all'); }} 
            className="text-xs font-bold text-rose-600 underline hover:text-rose-700 transition"
          >
            {language === 'ar' ? 'إعادة ضبط مرشحات البحث' : 'Reset all exhibition search queries'}
          </button>
        </div>
      )}

    </div>
  );
};
