import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BookCard } from '../components/BookCard';
import { ArrowRight, Sparkles, ShieldCheck, Printer, Upload, X, CheckCircle2, ChevronDown, MapPin, Phone, User, Building, FileText } from 'lucide-react';
import { formatPrice } from '../types';
import { WILAYAS, getShippingFee } from '../data/wilayas';

// ── Print-on-Demand Form ──────────────────────────────────────────────────────
const PrintRequestForm: React.FC<{ onClose: () => void; language: string }> = ({ onClose, language }) => {
  const { currentUser, submitPrintRequest, setCurrentPage } = useApp();
  const isAr = language === 'ar';
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: '', phone: '', wilayaId: 16, commune: '', fullAddress: '',
    copies: 1, pageCount: '' as string | number, coverType: 'soft' as 'hard' | 'soft',
    paperSize: 'A4' as 'A4' | 'A5' | 'B5', colorMode: 'bw' as 'bw' | 'color',
    bindingType: 'glue' as 'glue' | 'spiral' | 'staple', notes: '',
  });
  const [file, setFile] = useState<{ data: string; name: string } | null>(null);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedWilaya = WILAYAS.find(w => w.id === form.wilayaId) || WILAYAS[15];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { setError(isAr ? 'الملف يجب أن يكون PDF.' : 'Le fichier doit être un PDF.'); return; }
    if (f.size > 30 * 1024 * 1024) { setError(isAr ? 'الحجم الأقصى 30 ميغابايت.' : 'Taille max 30 Mo.'); return; }
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => setFile({ data: reader.result as string, name: f.name });
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { setCurrentPage('profile'); return; }
    if (!file) { setError(isAr ? 'يرجى رفع ملف PDF.' : 'Veuillez joindre un fichier PDF.'); return; }
    if (!form.fullName.trim()) { setError(isAr ? 'الاسم مطلوب.' : 'Le nom est requis.'); return; }
    if (!form.phone.trim() || form.phone.trim().length < 9) { setError(isAr ? 'رقم هاتف غير صالح.' : 'Numéro de téléphone invalide.'); return; }
    if (!form.commune.trim()) { setError(isAr ? 'البلدية مطلوبة.' : 'La commune est requise.'); return; }
    setLoading(true);
    try {
      await submitPrintRequest({
        fullName: form.fullName, phone: form.phone,
        wilayaId: form.wilayaId, wilayaName: isAr ? selectedWilaya.nameAr : selectedWilaya.nameFr,
        commune: form.commune, fullAddress: form.fullAddress,
        fileData: file.data, fileName: file.name,
        pageCount: form.pageCount ? Number(form.pageCount) : undefined,
        copies: form.copies, coverType: form.coverType,
        paperSize: form.paperSize, colorMode: form.colorMode,
        bindingType: form.bindingType, notes: form.notes,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Erreur.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 text-center space-y-5" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-8 h-8 text-emerald-600" /></div>
        <h3 className="font-serif text-2xl font-bold text-slate-900">{isAr ? 'تم استلام طلبك!' : 'Demande reçue !'}</h3>
        <p className="text-slate-500 text-sm">{isAr ? 'سيراجع فريقنا ملفك ويتواصل معك في أقرب وقت.' : 'Notre équipe examinera votre fichier et vous contactera très prochainement.'}</p>
        <button onClick={onClose} className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full text-sm">{isAr ? 'إغلاق' : 'Fermer'}</button>
      </div>
    </div>
  );

  // Close on Escape key
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      {/* stopPropagation so clicking inside the card doesn't close the modal */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center"><Printer className="w-5 h-5 text-violet-600" /></div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">{isAr ? 'طلب طباعة كتاب' : 'Demande d\'Impression'}</h3>
              <p className="text-xs text-slate-400">{isAr ? 'ارفع ملف PDF وحدد تفاصيل الطباعة.' : 'Déposez votre PDF et précisez les options d\'impression.'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

          {/* PDF upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{isAr ? 'ملف PDF *' : 'Fichier PDF *'}</label>
            {!file ? (
              <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 hover:border-violet-400 bg-slate-50 hover:bg-violet-50/30 rounded-2xl p-8 cursor-pointer transition">
                <Upload className="w-8 h-8 text-slate-400" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">{isAr ? 'انقر لرفع ملف PDF' : 'Cliquez pour déposer un PDF'}</p>
                  <p className="text-xs text-slate-400 mt-1">{isAr ? 'الحجم الأقصى 30 ميغابايت' : 'Max 30 Mo'}</p>
                </div>
                <input ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
              </label>
            ) : (
              <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-2xl p-4">
                <FileText className="w-6 h-6 text-violet-600 flex-shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-violet-800 truncate">{file.name}</p><p className="text-xs text-violet-500">{isAr ? 'جاهز للإرسال' : 'Prêt à l\'envoi'}</p></div>
                <button type="button" onClick={() => setFile(null)} className="p-1.5 text-violet-400 hover:text-violet-700 hover:bg-violet-100 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            )}
          </div>

          {/* Print options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{isAr ? 'عدد النسخ' : 'Copies'}</label>
              <input type="number" min={1} max={1000} value={form.copies} onChange={e => setForm({...form, copies: Number(e.target.value)})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{isAr ? 'عدد الصفحات' : 'Nb pages'}</label>
              <input type="number" min={1} value={form.pageCount} onChange={e => setForm({...form, pageCount: e.target.value})} placeholder="—" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{isAr ? 'حجم الورق' : 'Format'}</label>
              <select value={form.paperSize} onChange={e => setForm({...form, paperSize: e.target.value as any})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400">
                <option value="A4">A4</option><option value="A5">A5</option><option value="B5">B5</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{isAr ? 'الطباعة' : 'Impression'}</label>
              <select value={form.colorMode} onChange={e => setForm({...form, colorMode: e.target.value as any})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400">
                <option value="bw">{isAr ? 'أسود/أبيض' : 'N&B'}</option>
                <option value="color">{isAr ? 'ألوان' : 'Couleur'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cover type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{isAr ? 'نوع الغلاف' : 'Type de couverture'}</label>
              <div className="grid grid-cols-2 gap-2">
                {(['soft', 'hard'] as const).map(ct => (
                  <button key={ct} type="button" onClick={() => setForm({...form, coverType: ct})} className={`py-3 text-xs font-bold border rounded-xl transition ${form.coverType === ct ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-200 text-slate-600 hover:border-violet-300'}`}>
                    {ct === 'soft' ? (isAr ? 'غلاف عادي' : 'Souple') : (isAr ? 'غلاف صلب' : 'Rigide')}
                  </button>
                ))}
              </div>
            </div>
            {/* Binding */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{isAr ? 'نوع التجليد' : 'Type de reliure'}</label>
              <div className="grid grid-cols-3 gap-2">
                {([['glue', isAr ? 'لصق' : 'Collé'], ['spiral', isAr ? 'حلزوني' : 'Spirale'], ['staple', isAr ? 'تدبيس' : 'Agrafé']] as const).map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setForm({...form, bindingType: val as any})} className={`py-2.5 text-[10px] font-bold border rounded-xl transition ${form.bindingType === val ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-200 text-slate-600 hover:border-violet-300'}`}>{label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{isAr ? 'معلومات التوصيل' : 'Informations de livraison'}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><User className="w-3 h-3" /> {isAr ? 'الاسم الكامل *' : 'Nom complet *'}</label>
                <input required type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {isAr ? 'الهاتف *' : 'Téléphone *'}</label>
                <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="05XXXXXXXX" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400 font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {isAr ? 'الولاية *' : 'Wilaya *'}</label>
                <select value={form.wilayaId} onChange={e => setForm({...form, wilayaId: Number(e.target.value)})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400">
                  {WILAYAS.map(w => <option key={w.id} value={w.id}>{String(w.id).padStart(2,'0')} — {isAr ? w.nameAr : w.nameFr}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><Building className="w-3 h-3" /> {isAr ? 'البلدية *' : 'Commune *'}</label>
                <input required type="text" value={form.commune} onChange={e => setForm({...form, commune: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{isAr ? 'العنوان التفصيلي' : 'Adresse complète'}</label>
                <input type="text" value={form.fullAddress} onChange={e => setForm({...form, fullAddress: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{isAr ? 'ملاحظات إضافية' : 'Instructions spéciales'}</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder={isAr ? 'أي تعليمات خاصة...' : 'Toute instruction particulière...'} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:border-violet-400" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-bold text-sm rounded-full shadow-lg transition-all flex items-center justify-center gap-2">
            {loading ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg><span>{isAr ? 'جاري الإرسال...' : 'Envoi...'}</span></> : <><Printer className="w-4 h-4" /><span>{isAr ? 'إرسال طلب الطباعة' : 'Envoyer la demande'}</span></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export const HomeView: React.FC = () => {
  const { books, stores, setSelectedStore, setSelectedBook, t, dir, language } = useApp();
  const [showPrintForm, setShowPrintForm] = useState(false);

  // Hero "Hot Deals" are driven entirely by books the admin flags as featured.
  const featuredBooks = books.filter(b => b.featured);
  const heroBook = featuredBooks[0] || null;

  // Filter Originals for carousel
  const originalBooks = books.filter(b => b.isOriginal);

  return (
    <div id="metabook_home_view" className="space-y-16 pb-24 page-transition">
      
      {/* 1. EDITORIAL HERO: Admin-curated Hot Deals (only shown when a book is featured) */}
      {heroBook && (
      <section className="relative overflow-hidden rounded-none bg-white border border-slate-200 p-8 sm:p-12 md:p-16">

        <div className="absolute top-6 left-8 sm:top-8 sm:left-12 text-[10px] uppercase tracking-[0.2em] font-bold text-rose-600">
          {language === 'ar' ? 'عروض حصرية • صفقات مميزة' : 'HOT DEALS • FEATURED SELECTION'}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center pt-8">

          {/* Hero Left: Editorial metadata */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal text-slate-900 leading-[1.05] tracking-tight">
              {heroBook.title}
            </h1>

            <p className="font-serif italic text-lg sm:text-l text-slate-500">
              {language === 'ar' ? 'بقلم الكاتب القدير ' : 'Written and curated by '}
              <span className="font-sans font-bold not-italic text-xs text-slate-800 uppercase tracking-[0.15em] block sm:inline">
                {heroBook.author}
              </span>
            </p>

            <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
              {language === 'ar'
                ? 'كتاب مطبوع بجودة عالية، منسّق بعناية ومتاح للشحن لجميع ولايات الجزائر مع الدفع عند الاستلام.'
                : 'Un livre imprimé de haute qualité, soigneusement sélectionné et livré partout en Algérie — paiement à la livraison.'
              }
            </p>

            {/* Pricing and Action tier */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{language === 'ar' ? 'سعر الإصدار الخاص' : 'Deluxe Edition'}</span>
                <span className="text-2xl font-bold text-slate-900">{formatPrice(heroBook.price, language)}</span>
              </div>

              <button
                onClick={() => setSelectedBook(heroBook)}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-medium tracking-wider rounded-none shadow-md hover:shadow-lg transition-all text-xs"
              >
                <span>{t.buyNow.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hero Right: Heavy shadowed physical book mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              onClick={() => setSelectedBook(heroBook)}
              className="relative w-56 sm:w-72 aspect-[3/4] group cursor-pointer"
            >
              <div className="absolute inset-0 bg-slate-200 rounded-none shadow-xl border border-slate-300 overflow-hidden transition-all duration-300 transform group-hover:scale-[1.01]">
                <img
                  src={heroBook.coverImage}
                  alt={heroBook.title}
                  className="w-full h-full object-cover"
                />

                {/* Physical book elements */}
                <div className={`absolute top-0 bottom-0 w-3.5 bg-gradient-to-r from-black/25 to-transparent ${
                  dir === 'rtl' ? 'right-0' : 'left-0'
                }`} />
                <div className={`absolute top-0 bottom-0 w-1 bg-white/20 ${
                  dir === 'rtl' ? 'right-3.5' : 'left-3.5'
                }`} />
              </div>
            </div>
          </div>

        </div>
      </section>
      )}

      {/* 2. METABOOK ORIGINALS: Horizontal Swipeable Carousel */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500 fill-rose-100" />
              <span>{t.metabookOriginals}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              {language === 'ar' ? 'إصدارات حصرية لا تتوفر في أي مكان آخر' : 'Unique typographic designs authored exclusively for Metabook readers'}
            </p>
          </div>
        </div>

        {/* Carousel Slider */}
        <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex gap-6 overflow-x-auto snap-x scrollbar-none pb-4 focus:outline-none">
            {originalBooks.length > 0 ? (
              originalBooks.map((book) => (
                <div 
                  key={book.id} 
                  className="w-[240px] sm:w-[280px] shrink-0 snap-start"
                >
                  <BookCard book={book} />
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic py-4">{t.noBooksFound}</p>
            )}
          </div>
        </div>
      </section>

      {/* 3. PARTNER BOUTIQUES: Classy Masonry Profile Cards */}
      <section className="space-y-8">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-4xl font-normal text-slate-900">
            {t.partnerBoutiques}
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide leading-relaxed">
            {language === 'ar' 
              ? 'مجموعة مختارة بعناية من الشركاء ودور النشر المحلية المستقلة، يقدم كل منهم هوية وإصدارات فريدة ذات طابع أدبي مميز.' 
              : 'Explore curated boutiques hosted by trusted independent publishers. Each boutique offers a unique literary vision, tailored cover designs, and specialized catalogs.'
            }
          </p>
        </div>

        {/* Masonry Design Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {stores.map((store) => (
            <div
              key={store.id}
              onClick={() => setSelectedStore(store)}
              className="group cursor-pointer bg-white rounded-none border border-slate-200 shadow-sm hover:border-rose-600 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Banner with Overlay */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={store.bannerImage}
                  alt={store.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                
                {/* Store title inside banner */}
                <div className="absolute top-4 left-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/40 backdrop-blur-sm rounded-none text-[8px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3 text-rose-500" />
                    <span>{language === 'ar' ? 'تاجر موثق' : 'Certified Partner'}</span>
                  </div>
                </div>
              </div>

              {/* Store description padding */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 tracking-tight group-hover:text-rose-600 transition-colors">
                    {store.name}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mt-2 line-clamp-3">
                    {store.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-rose-600 transition-colors tracking-wider uppercase">
                    {language === 'ar' ? 'عرض الكتب المتوفرة' : 'Browse Inventory'}
                  </span>
                  <span className="w-8 h-8 rounded-none border border-slate-200 hover:border-rose-600 flex items-center justify-center text-slate-400 group-hover:text-rose-600 transition duration-200">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PRINT ON DEMAND */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 p-8 sm:p-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#7c3aed33,_transparent_60%)]" />
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-500/30 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-300">
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'خدمة جديدة' : 'Nouveau service'}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              {language === 'ar' ? 'اطبع كتابك معنا' : 'Imprimez votre livre avec nous'}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              {language === 'ar'
                ? 'هل لديك ملف PDF وتريد طباعته بجودة احترافية؟ ارفع ملفك، حدد المواصفات، وسنتولى الطباعة والتوصيل لباب منزلك في جميع ولايات الجزائر.'
                : 'Vous avez un fichier PDF et souhaitez le faire imprimer ? Déposez votre fichier, choisissez vos options (format, couverture, reliure) et nous nous chargeons de l\'impression et de la livraison partout en Algérie.'}
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              {[
                [language === 'ar' ? 'غلاف صلب أو عادي' : 'Couv. rigide ou souple'],
                [language === 'ar' ? 'أبيض وأسود أو ألوان' : 'N&B ou couleur'],
                [language === 'ar' ? 'A4 / A5 / B5' : 'A4 / A5 / B5'],
                [language === 'ar' ? 'توصيل لجميع الولايات' : 'Livraison nationwide'],
              ].map(([label], i) => (
                <span key={i} className="flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full font-medium">
                  <CheckCircle2 className="w-3 h-3 text-violet-400" />
                  {label}
                </span>
              ))}
            </div>
            <button
              onClick={() => setShowPrintForm(true)}
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-full shadow-lg hover:shadow-violet-500/30 transition-all text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'ar' ? 'ابدأ طلب الطباعة' : 'Démarrer une demande'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Visual side */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-64">
              <div className="absolute -inset-4 bg-violet-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="w-10 h-10 bg-violet-500/30 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5 text-violet-300" /></div>
                  <div><p className="text-sm font-bold">mon_livre.pdf</p><p className="text-[10px] text-slate-400">12.4 Mo · 248 pages</p></div>
                </div>
                {[
                  [language === 'ar' ? 'النسخ' : 'Copies', '50'],
                  [language === 'ar' ? 'الغلاف' : 'Couverture', language === 'ar' ? 'صلب' : 'Rigide'],
                  [language === 'ar' ? 'الطباعة' : 'Impression', language === 'ar' ? 'ألوان' : 'Couleur'],
                  [language === 'ar' ? 'الولاية' : 'Wilaya', language === 'ar' ? 'الجزائر' : 'Alger'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs"><span className="text-slate-400">{k}</span><span className="font-bold">{v}</span></div>
                ))}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'ar' ? 'جاهز للطباعة' : 'Prêt pour impression'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Print-on-Demand modal */}
      {showPrintForm && <PrintRequestForm onClose={() => setShowPrintForm(false)} language={language} />}

    </div>
  );
};
