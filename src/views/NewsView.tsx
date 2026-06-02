import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NewsArticle } from '../types';
import { Newspaper, Calendar, Store, BookOpen, Trash2, Plus, X, Globe, User } from 'lucide-react';

export const NewsView: React.FC = () => {
  const { 
    newsArticles, 
    userProfile, 
    addNewsArticle, 
    deleteNewsArticle, 
    language,
    dir,
    t 
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'event' | 'book' | 'partnership' | 'general'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = userProfile?.role === 'admin';

  const categoryConfig = {
    event: { 
      label: language === 'ar' ? 'فعالية ثقافية' : 'Événement', 
      bgColor: 'bg-amber-50 text-amber-800 border-amber-200', 
      icon: Calendar 
    },
    book: { 
      label: language === 'ar' ? 'إعلان عمل جديد' : 'Livre / Publication', 
      bgColor: 'bg-rose-50 text-rose-800 border-rose-200', 
      icon: BookOpen 
    },
    partnership: { 
      label: language === 'ar' ? 'شراكة جديدة' : 'Partenariat', 
      bgColor: 'bg-indigo-50 text-indigo-800 border-indigo-200', 
      icon: Store 
    },
    general: { 
      label: language === 'ar' ? 'إعلان عام' : 'Annonce Générale', 
      bgColor: 'bg-slate-50 text-slate-800 border-slate-200', 
      icon: Newspaper 
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
      await addNewsArticle({
        title: newTitle,
        content: newContent,
        category: newCategory
      });
      setNewTitle('');
      setNewContent('');
      setNewCategory('general');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الخبر الإداري؟' : 'Voulez-vous vraiment supprimer cet article d\'actualité ?')) {
      await deleteNewsArticle(id);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir={dir}>
      
      {/* Editorial Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6 gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-rose-600 shrink-0" />
            <span>{t.news}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-xl font-medium">
            {language === 'ar' 
              ? 'تابع تطلعات وتحديثات مجلس الكتب، الفعاليات المبرمجة وشراكتنا الاستثنائية القادمة.' 
              : 'Découvrez les dernières annonces littéraires, l\'agenda des événements et les nouvelles alliances de notre écosystème.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white hover:bg-rose-700 text-sm font-semibold tracking-wide transition self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'نشر خبر جديد' : 'Publier une actualité'}</span>
          </button>
        )}
      </div>

      {/* Admin Quick Add Modal Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 p-6 md:p-8 w-full max-w-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-serif text-xl font-bold text-slate-900">
                {language === 'ar' ? 'صياغة خبر إداري جديد' : 'Rédiger une nouvelle actualité'}
              </h3>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  {language === 'ar' ? 'عنوان الخبر' : 'Titre de l\'actualité'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل عنواناً جذاباً...' : 'Ex: Prochain salon littéraire à Alger...'}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm focus:border-rose-400 focus:bg-white outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    {language === 'ar' ? 'تصنيف المادة' : 'Catégorie'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm focus:border-rose-400 focus:bg-white outline-none transition"
                  >
                    <option value="general">{language === 'ar' ? 'إعلان عام' : 'Annonce Générale'}</option>
                    <option value="book">{language === 'ar' ? 'إعلان عن كتاب جديد' : 'Annonce de Livre'}</option>
                    <option value="event">{language === 'ar' ? 'فعاليات ومواعيد' : 'Événements & Agenda'}</option>
                    <option value="partnership">{language === 'ar' ? 'شراكات واتفاقيات' : 'Partenariats & Éditions'}</option>
                  </select>
                </div>
                
                <div className="flex items-end justify-end p-2 border border-dashed border-slate-200 bg-slate-50/50">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-rose-500" />
                    <span>
                      {language === 'ar' 
                        ? 'سيتم النشر باسم الإدارة الرسمية لميتابوك' 
                        : 'Sera publié sous le label officiel Metabook'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  {language === 'ar' ? 'محتوى الخبر التفصيلي' : 'Contenu de l\'article'}
                </label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={language === 'ar' ? 'اكتب تفاصيل الخبر كاملة هنا بالتفصيل...' : 'Décrivez en détail l\'annonce ou l\'événement...'}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm focus:border-rose-400 focus:bg-white outline-none transition resize-none font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold tracking-wider uppercase transition"
                >
                  {language === 'ar' ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold tracking-wider uppercase transition disabled:opacity-50"
                >
                  {isSubmitting 
                    ? (language === 'ar' ? 'جاري النشر...' : 'Publication...') 
                    : (language === 'ar' ? 'نشر الآن' : 'Publier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Articles Stream */}
      {newsArticles.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-200 max-w-lg mx-auto p-8">
          <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-slate-800">
            {language === 'ar' ? 'أرشيف الأخبار خالي حالياً' : 'Aucun article d\'actualité'}
          </h3>
          <p className="text-slate-400 text-xs mt-2">
            {language === 'ar' 
              ? 'لم يتم نشر أي إعلانات مؤخراً من قبل الإدارة.' 
              : 'Les administrateurs n\'ont pas encore publié d\'actualités.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {newsArticles.map((article) => {
            const config = categoryConfig[article.category as keyof typeof categoryConfig] || categoryConfig.general;
            const CatIcon = config.icon;

            return (
              <article 
                key={article.id}
                className="group relative bg-white border border-slate-100 hover:border-rose-100 shadow-sm hover:shadow-md transition-all p-6 md:p-8 flex flex-col justify-between"
              >
                <div>
                  {/* Metadata Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border rounded-none ${config.bgColor}`}>
                      <CatIcon className="w-3.5 h-3.5" />
                      <span>{config.label}</span>
                    </span>

                    <span className="text-xs text-slate-400 font-medium font-sans">
                      {formatDate(article.createdAt)}
                    </span>
                  </div>

                  {/* News Title */}
                  <h2 className="font-serif text-xl font-bold text-slate-900 group-hover:text-rose-600 transition duration-150 leading-snug">
                    {article.title}
                  </h2>

                  {/* News Content with fine readability */}
                  <p className="text-slate-600 text-sm mt-4 font-normal leading-relaxed whitespace-pre-line">
                    {article.content}
                  </p>
                </div>

                {/* Article Footer Panel */}
                <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-6">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-300" />
                    <span>
                      {language === 'ar' ? `بواسطة: ${article.authorName}` : `Par : ${article.authorName}`}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                      title={language === 'ar' ? 'حذف الخبر' : 'Supprimer l\'actualité'}
                      aria-label="Delete article"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
};
