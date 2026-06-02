import React from 'react';
import { Book, formatPrice } from '../types';
import { useApp } from '../context/AppContext';
import { Sparkles, Trophy } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { setSelectedBook, t, dir, language } = useApp();

  return (
    <div
      onClick={() => setSelectedBook(book)}
      className="group cursor-pointer bg-white rounded-none border border-slate-200 p-5 transition-all duration-300 hover:shadow-md hover:border-rose-600 flex flex-col justify-between h-full relative"
    >
      <div>
        {/* Cover Canvas */}
        <div className="relative aspect-[3/4] w-full rounded-none bg-slate-100 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
          <img
            src={book.coverImage}
            alt={book.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            onError={(e) => {
              // Graceful placeholder if image URL fails
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600";
            }}
          />
          {/* Edge shadow simulating a heavy physical book spine */}
          <div className={`absolute top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/20 to-transparent ${
            dir === 'rtl' ? 'right-0' : 'left-0'
          }`} />
          <div className={`absolute top-0 bottom-0 w-1 bg-white/15 ${
            dir === 'rtl' ? 'right-2.5' : 'left-2.5'
          }`} />

          {/* Premium Tag Badge */}
          {book.isOriginal && (
            <div className={`absolute top-2.5 flex items-center gap-1 px-2.5 py-1 bg-rose-600 text-white text-[9px] font-bold uppercase rounded-none shadow-sm tracking-wider ${
              dir === 'rtl' ? 'left-2.5' : 'right-2.5'
            }`}>
              <Sparkles className="w-2.5 h-2.5" />
              <span>{t.original}</span>
            </div>
          )}
        </div>

        {/* Curation details */}
        <div className="mt-4">
          <p className="font-sans text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] truncate">
            {book.author}
          </p>
          <h3 className="font-serif text-base font-bold text-slate-900 leading-tight mt-1 group-hover:text-rose-600 transition-colors h-11 line-clamp-2">
            {book.title}
          </h3>
        </div>
      </div>

      {/* Pricing and Action tier */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="font-sans text-sm font-semibold text-slate-800">
          {formatPrice(book.price, language)}
        </span>
        <span className="font-sans text-[10px] font-bold text-rose-600 group-hover:text-rose-700 tracking-wider">
          {t.buyNow.toUpperCase()} &rarr;
        </span>
      </div>
    </div>
  );
};
