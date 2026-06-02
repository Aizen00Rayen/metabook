import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Store, Book, UserRole, formatPrice, Order } from '../types';
import { 
  Plus, Edit2, Trash2, ShieldAlert, Sparkles, Store as StoreIcon, Package, 
  AlertCircle, Save, X, Eye, FileUp, Upload, ShieldCheck, ShoppingCart, Award
} from 'lucide-react';

export const StoreDashboard: React.FC = () => {
  const { 
    currentUser, 
    userProfile, 
    stores, 
    books, 
    orders,
    registerOrUpdateStore, 
    addNewBook, 
    updateBook, 
    deleteBookById,
    t, 
    language 
  } = useApp();

  const [activeSegment, setActiveSegment] = useState<'collection' | 'orders'>('collection');

  // Find partner's store
  const myStore = stores.find(s => s.ownerUid === currentUser?.uid);
  const storeBooks = myStore ? books.filter(b => b.storeId === myStore.id) : [];
  const storeOrders = myStore ? orders.filter(o => o.storeId === myStore.id) : [];

  // Store profile creation form state
  const [storeName, setStoreName] = useState('');
  const [storeDesc, setStoreDesc] = useState('');
  const [storeBanner, setStoreBanner] = useState('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200');

  // New/Edit Book Form State
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookPrice, setBookPrice] = useState(1500);
  const [bookCover, setBookCover] = useState('https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600');
  const [isOriginal, setIsOriginal] = useState(false);
  
  // Custom cover base64 state for premium mockup upload
  const [uploadProgress, setUploadProgress] = useState(false);

  // Onboarding Store Banner file upload handler
  const handleOnboardingBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setStoreBanner(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Guard: Not a partner
  if (userProfile?.role !== 'partner' && userProfile?.role !== 'admin') {
    return (
      <div id="metabook_dashboard_unauthorized" className="max-w-md mx-auto py-20 text-center space-y-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-slate-900">
          {language === 'ar' ? 'مخصص للشركاء فقط' : 'Accès Réservé aux Partenaires'}
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          {language === 'ar' 
            ? 'مستوى عضويتك الحالي هو قارئ. لتسجيل ونشر الكتب الثمينة وعرض الأرباح، يرجى الانتقال إلى صفحتك وتحديث دورك إلى شريك ناشر.'
            : 'Votre profil actuel est configuré comme lecteur. Pour enregistrer des livres numériques prestigieux et configurer des ventes, veuillez vous rendre sur votre profil pour demander une homologation de vendeur.'
          }
        </p>
      </div>
    );
  }

  // 1. BOUTIQUE REGISTRATION ONBOARDING FOR FIRST-TIME PARTNERS
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !storeDesc) return;
    try {
      const storeId = `store_${currentUser?.uid || Date.now()}`;
      await registerOrUpdateStore({
        id: storeId,
        name: storeName,
        description: storeDesc,
        bannerImage: storeBanner || 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200'
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!myStore) {
    return (
      <div id="metabook_dashboard_onboarding" className="max-w-2xl mx-auto py-8 px-4 page-transition sm:px-0" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-3xl border border-rose-50 p-8 shadow-xl space-y-6">
          
          <div className="flex items-center gap-3 border-b border-rose-100/50 pb-4">
            <StoreIcon className="w-8 h-8 text-rose-600" />
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {language === 'ar' ? 'تأسيس مكتبتك الشريكة' : 'Établir Votre Boutique'}
              </h1>
              <p className="text-xs text-slate-500">
                {language === 'ar' ? 'يرجى تهيئة هوية واجهة العرض الخاصة بك قبل نشر أي مخطوطة.' : "Configurez votre identite avant de referencer des oeuvres."}
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateStore} className="space-y-4 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{language === 'ar' ? 'اسم دار النشر / المكتبة الفاخرة' : "Nom de l'Etablissement"}</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder={language === 'ar' ? 'مثال: دار القلم والنور للأدب الكلاسيكي' : "Ex: Les Éditions du Grand Siècle"}
                className="w-full bg-slate-50 border border-slate-100/80 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{language === 'ar' ? 'رسالة الدار والتعريف الأدبي' : 'Lignée Éditoriale & Histoire'}</label>
              <textarea
                required
                value={storeDesc}
                onChange={(e) => setStoreDesc(e.target.value)}
                rows={4}
                placeholder={language === 'ar' ? 'تحدث عن نهجك الأدبي وفئات الكتب التي تتميز بنشرها...' : "Décrivez la vision éditoriale, les thèmes de prédilection, ou l'histoire de la maison..."}
                className="w-full bg-slate-50 border border-slate-100/80 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{language === 'ar' ? 'واجهة المتجر / الشعار المتميز' : 'Photo Vedette de Vitrine (Logo/Bannière)'}</label>
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 border border-slate-100/80 p-4 rounded-xl">
                <label className="group flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-rose-400 bg-white p-4 rounded-xl cursor-pointer transition select-none w-full sm:w-auto flex-shrink-0">
                  <div className="flex flex-col items-center justify-center space-y-1 text-center px-4">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-rose-600 transition" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{language === 'ar' ? 'رفع الشعار المعتمد' : 'Téléverser'}</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleOnboardingBannerUpload}
                    className="hidden"
                  />
                </label>
                {storeBanner ? (
                  <div className="flex items-center gap-3 w-full self-start sm:self-center overflow-hidden">
                    <img src={storeBanner} alt="Store banner preview" className="w-16 h-10 object-cover rounded shadow-md border border-slate-200" referrerPolicy="no-referrer" />
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[9px] text-emerald-600 font-black uppercase tracking-wider block">{language === 'ar' ? 'تم الرفع' : 'Chargé avec succès'}</span>
                      <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{language === 'ar' ? 'مظهر الواجهة محدث' : 'Illustration prête'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">{language === 'ar' ? 'لم يتم تحميل أي واجهة بعد.' : 'Aucune illustration.'}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-rose-600/10 active:scale-95 transition-all mt-4"
            >
              {language === 'ar' ? 'فتح لوحة تحكم الشركاء ←' : "Activer l'Espace Boutique →"}
            </button>
          </form>

        </div>
      </div>
    );
  }

  // 2. BOUTIQUE CONFIGURED: SHOW FULL VENDOR OPERATIONS DASHBOARD
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle || !bookAuthor || !bookPrice) return;

    // Check Approval Status
    if (userProfile?.role === 'partner' && userProfile?.approved !== true) {
      alert(language === 'ar' ? 'لا يمكن نشر كتب للبيع قبل مراجعة واعتماد حسابك من مصلحة الإدارة.' : "Compte non agree. Votre compte doit etre approuve par l'administration.");
      return;
    }

    try {
      if (editingBookId) {
        await updateBook({
          id: editingBookId,
          title: bookTitle,
          author: bookAuthor,
          price: Number(bookPrice),
          coverImage: bookCover,
          storeId: myStore.id,
          isOriginal
        });
      } else {
        await addNewBook({
          title: bookTitle,
          author: bookAuthor,
          price: Number(bookPrice),
          coverImage: bookCover,
          storeId: myStore.id,
          isOriginal
        });
      }

      // Reset
      setEditingBookId(null);
      setBookTitle('');
      setBookAuthor('');
      setBookPrice(1500);
      setBookCover('https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600');
      setIsOriginal(false);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleEditBookInit = (book: Book) => {
    if (userProfile?.role === 'partner' && userProfile?.approved !== true) {
      alert(language === 'ar' ? 'لا يمكنك التعديل نظراً لمعطيات الحساب المعلق.' : 'Compte non homologué.');
      return;
    }
    setEditingBookId(book.id);
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookPrice(book.price);
    setBookCover(book.coverImage);
    setIsOriginal(book.isOriginal);
  };

  const handleCancelEdit = () => {
    setEditingBookId(null);
    setBookTitle('');
    setBookAuthor('');
    setBookPrice(1500);
    setBookCover('https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600');
    setIsOriginal(false);
  };

  const handleDeleteBook = async (id: string) => {
    try {
      await deleteBookById(id);
    } catch (err: any) {
      console.warn("Error removing book: " + err.message);
    }
  };

  const handleFileUploadSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setBookCover(reader.result as string);
      setUploadProgress(false);
    };
    reader.readAsDataURL(file);
  };

  const isPartnerApproved = userProfile?.role === 'admin' || userProfile?.approved === true;

  return (
    <div id="metabook_studio_dashboard" className="space-y-12 pb-24 page-transition" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 1. Brand Showcase Header Card */}
      <section className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-50 rounded-full blur-3xl -z-1" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-200/50 flex items-center justify-center text-rose-600">
            <StoreIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-black text-slate-900">{myStore.name}</h1>
            <p className="text-xs text-slate-400 mt-1 sm:max-w-md line-clamp-1">{myStore.description}</p>
          </div>
        </div>

        {/* Stats and Approvals state indicator */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-s border-rose-100/60 pt-4 md:pt-0 md:ps-6">
          <div className="text-center md:text-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{language === 'ar' ? 'المنشورات المعروضة' : 'Publications'}</span>
            <span className="text-2xl font-black text-slate-900">{storeBooks.length}</span>
          </div>
          <div className="text-center md:text-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{language === 'ar' ? 'الطلبات الرقمية' : 'Commandes'}</span>
            <span className="text-2xl font-black text-rose-600">{storeOrders.length}</span>
          </div>
        </div>
      </section>

      {/* Account Verification banner if NOT approved */}
      {!isPartnerApproved && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider">
              {language === 'ar' ? 'حساب الشريك معلق - بانتظار الاعتماد المكتبي' : "Compte Partenaire en Attente d'Homologation"}
            </h3>
            <p className="text-xs text-amber-700 leading-relaxed md:max-w-3xl">
              {language === 'ar' 
                ? 'لقد تم إنشاء واجهة متجرك الإلكتروني، وهي غير نشطة حالياً. يجب مراجعة واعتماد ملفك من مصلحة الإدارة المركزية لحساب admin@metabook-dz.com قبل تمكين عمليات نشر الكتب واستعراض الطلبات.'
                : "Votre boutique est en attente d'homologation. L'ajout de livres sera actif une fois que l'administrateur admin@metabook-dz.com aura approuve votre demande."
              }
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-100 gap-2">
        <button
          onClick={() => setActiveSegment('collection')}
          className={`pb-4 px-4 text-xs font-bold uppercase tracking-wider transition-all duration-150 border-b-2 ${
            activeSegment === 'collection' 
              ? 'border-slate-900 text-slate-900 font-black' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {language === 'ar' ? 'إدارة كتالوج الكتب' : 'Gestion du Stock Littéraire'}
        </button>
        <button
          onClick={() => setActiveSegment('orders')}
          className={`pb-4 px-4 text-xs font-bold uppercase tracking-wider transition-all duration-150 border-b-2 ${
            activeSegment === 'orders' 
              ? 'border-slate-900 text-slate-900 font-black' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {language === 'ar' ? 'سجل طلبات الشراء الواردة' : 'Journal des Ventes'}
          {storeOrders.length > 0 && (
            <span className="ms-2 px-1.5 py-0.5 bg-rose-600 text-white font-bold text-[8px] rounded-full">
              {storeOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. Segment Switching Layout */}
      <div>
        {activeSegment === 'collection' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Form Column */}
            <div className="lg:col-span-5 bg-white border border-rose-50/70 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
              
              <div className="border-b border-rose-100/40 pb-4">
                <h2 className="font-serif text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-5 h-5 text-rose-600" />
                  <span>{editingBookId ? (language === 'ar' ? 'تنقيح بيانات الكتاب' : 'Modifier les Données') : t.addBook}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{language === 'ar' ? 'تعديل أو نشر كتب رقمية حقيقية في قاعدة البيانات.' : 'Inscrivez votre ouvrage et gerez votre catalogue litteraire.'}</p>
              </div>

              <form onSubmit={handleBookSubmit} className={`space-y-4 ${!isPartnerApproved ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t.titleLabel}</label>
                  <input
                    type="text"
                    required
                    disabled={!isPartnerApproved}
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder={language === 'ar' ? 'عنوان الرواية أو المخطوطة' : "Ex: L'art de vivre"}
                    className="w-full bg-slate-50 border border-slate-100/80 rounded-xl py-2.5 px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t.authorLabel}</label>
                  <input
                    type="text"
                    required
                    disabled={!isPartnerApproved}
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    placeholder="E.g. Gabriel Garcia Marquez"
                    className="w-full bg-slate-50 border border-slate-100/80 rounded-xl py-2.5 px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t.priceLabel}</label>
                  <input
                    type="number"
                    required
                    disabled={!isPartnerApproved}
                    value={bookPrice}
                    onChange={(e) => setBookPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-100/80 rounded-xl py-2.5 px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:bg-white transition"
                  />
                </div>

                {/* Cover Uploader */}
                <div className="p-4 border border-rose-100/40 rounded-2xl bg-slate-50/50 space-y-3">
                  <label className="group flex flex-col items-center justify-center border border-dashed border-slate-200 hover:border-rose-400 bg-white p-4 rounded-xl cursor-pointer transition select-none">
                    <div className="flex flex-col items-center justify-center space-y-1.5 text-center">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-rose-600 transition" />
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{uploadProgress ? 'Transmission...' : (language === 'ar' ? 'رفع غلاف مخصص' : 'Deposer une illustration')}</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUploadSimulated}
                      className="hidden"
                    />
                  </label>

                  {bookCover && (
                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                      <img src={bookCover} alt="Cover preview" className="w-10 h-14 object-cover rounded shadow-sm" referrerPolicy="no-referrer" />
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider block">{language === 'ar' ? 'تم رفع الغلاف بنجاح' : 'ILLUSTRATION COUVERTURE'}</span>
                        <p className="text-[10px] text-slate-450 truncate mt-0.5">{language === 'ar' ? 'جاهز للعرض والطلب' : 'Fichier chargé prêt au catalogue'}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-1.5 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full shadow-md text-xs tracking-wider transition active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingBookId ? t.save : t.addBook}</span>
                  </button>
                  {editingBookId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-5 py-3.5 border border-slate-200 text-slate-500 font-bold rounded-full text-xs shadow-sm hover:bg-slate-50 active:scale-95 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </form>
            </div>

            {/* Catalog List Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between border-b border-rose-100/40 pb-4">
                <h2 className="font-serif text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-rose-500" />
                  <span>{language === 'ar' ? 'الكتالوج المعروض المعولم' : 'Votre Vitrine Active'}</span>
                  <span className="text-xs font-sans px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full font-bold">
                    {storeBooks.length}
                  </span>
                </h2>
              </div>

              {storeBooks.length > 0 ? (
                <div className="space-y-4">
                  {storeBooks.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between bg-white border border-rose-55 rounded-2xl p-4 shadow-sm hover:shadow-md transition duration-200 gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded-lg shadow-sm bg-slate-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider">{book.author}</span>
                            {book.isOriginal && (
                              <span className="text-[8px] bg-rose-100 text-rose-700 font-black px-1.5 py-0.5 rounded uppercase">original</span>
                            )}
                          </div>
                          <h4 className="font-serif text-sm sm:text-base font-bold text-slate-800 tracking-tight truncate mt-0.5">{book.title}</h4>
                          <p className="font-sans text-xs font-bold text-slate-900 mt-1">{formatPrice(book.price, language)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditBookInit(book)}
                          className="p-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-xl transition duration-200"
                          title={t.edit}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-xl transition duration-200"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8 space-y-4 max-w-sm mx-auto">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-slate-500 text-xs font-semibold">
                    {language === 'ar' ? 'كتالوج متجرك فارغ حالياً. تفضل بتسجيل أولى روائعك.' : "Votre vitrine n'a encore aucun volume reference."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: BILLING & ORDERS */}
        {activeSegment === 'orders' && (
          <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
            <div className="border-b border-rose-50 pb-4">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                {language === 'ar' ? 'فواتير ومبيعات ومقتنيات العملاء' : 'Mouvements Transactionnels Littéraires'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'قائمة الفواتير الرقمية الصادرة خصيصاً لكتبكم من قِبل عملاء ميتابوك.' : "Consultez les acces alloues aux lecteurs authentifies."}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase text-[9px] tracking-wider border-b border-slate-100">
                    <th className="py-4 px-4">{language === 'ar' ? 'رمز المعاملة' : 'Code ID'}</th>
                    <th className="py-4 px-4">{language === 'ar' ? 'العميل المقتني' : 'Client bénéficiaire'}</th>
                    <th className="py-4 px-4">{language === 'ar' ? 'الكتاب المحمل' : 'Volume'}</th>
                    <th className="py-4 px-4">{language === 'ar' ? 'السعر' : 'Sceau financier'}</th>
                    <th className="py-4 px-4 font-mono text-center">{language === 'ar' ? 'تاريخ المعاملة' : 'Date de transaction'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {storeOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-4 font-mono text-[10px] font-medium text-slate-400">{order.id}</td>
                      <td className="py-4 px-4 font-mono text-[10px] text-slate-600">{order.userEmail}</td>
                      <td className="py-4 px-4">
                        <div className="font-serif font-bold text-slate-800">{order.bookTitle}</div>
                        <div className="text-[10px] text-slate-400">{order.bookAuthor}</div>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-emerald-700">
                        {formatPrice(order.bookPrice, language)}
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-[10px] text-slate-500">
                        {new Date(order.createdAt).toLocaleString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}
                      </td>
                    </tr>
                  ))}
                  {storeOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                        {language === 'ar' ? 'لا توجد معاملات شراء واردة بعد.' : "Aucune commande emise pour votre boutique."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
