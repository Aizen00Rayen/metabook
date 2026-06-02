import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookCard } from '../components/BookCard';
import { 
  User, Mail, ShieldAlert, Sparkles, LogOut, CheckCircle2, Ticket, Award, 
  Bookmark, ArrowRight, Library, Lock, ShieldCheck, Heart, ShoppingBag, Eye, Calendar
} from 'lucide-react';
import { UserRole, formatPrice } from '../types';
import { Logo } from '../components/Logo';

export const ProfileView: React.FC = () => {
  const { 
    currentUser,
    userProfile,
    loginWithEmail,
    registerWithEmail, 
    logoutUser, 
    updateUserRole,
    authError,
    books,
    orders,
    favorites,
    toggleFavorite,
    purchasedBookIds,
    language,
    setCurrentPage,
    setSelectedBook,
    t
  } = useApp();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('reader');
  
  // Tabs for signed user dashboard
  const [activeTab, setActiveTab] = useState<'books' | 'favorites' | 'orders'>('books');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (email.trim().toLowerCase() === 'admin@metabook-dz.com') {
      alert(
        language === 'ar' 
          ? 'عذراً، يجب على المسؤول الرئيسي تسجيل الدخول من خلال البوابة الإدارية المخصصة والآمنة فقط على الرابط /admin/login.' 
          : 'La connexion administrateur doit s’effectuer exclusivement par le portail administratif sécurisé à l’adresse /admin/login.'
      );
      return;
    }

    if (isRegistering) {
      await registerWithEmail(email, password, selectedRole);
    } else {
      await loginWithEmail(email, password);
    }
  };

  // -------------------------------------------------------------
  // UNSIGNED: SHOW LUXURY AUTHENTICATION FLOW
  // -------------------------------------------------------------
  if (!currentUser) {
    const isAr = language === 'ar';

    return (
      <div id="metabook_unsigned_profile" className="max-w-xl mx-auto py-6 px-4 page-transition sm:px-0 select-none" dir={isAr ? 'rtl' : 'ltr'}>
        
        {/* Brand Display Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <Logo className="w-16 h-16" showText={true} textSize="text-3xl" />
          <p className="text-xs font-serif text-slate-400 italic max-w-sm">
            {t.tagline}
          </p>
        </div>

        <div className="bg-white rounded-none border-2 border-slate-200 p-6 sm:p-10 shadow-lg space-y-8 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600" />
          
          {/* EXQUISITE TAB SELECTOR: Client vs Partner Pages */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedRole('reader')}
              className={`py-3 px-4 text-xs font-semibold tracking-wide transition duration-200 ${
                selectedRole === 'reader'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="font-bold text-xs uppercase sm:text-sm">
                  {isAr ? 'حساب قارئ نخبة' : 'Espace Client'}
                </span>
                <span className="text-[9px] opacity-80 font-medium">
                  {isAr ? 'للقراء والكتب الفاخرة' : 'Accès Lecteurs'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('partner')}
              className={`py-3 px-4 text-xs font-semibold tracking-wide transition duration-200 ${
                selectedRole === 'partner'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="font-bold text-xs uppercase sm:text-sm">
                  {isAr ? 'بوابة دور النشر' : 'Espace Partenaire'}
                </span>
                <span className="text-[9px] opacity-80 font-medium">
                  {isAr ? 'للمكتبات المستقلة' : 'Boutiques Littéraires'}
                </span>
              </div>
            </button>
          </div>

          {/* Subheading depending on active profile tab */}
          <div className="text-center space-y-2 border-b border-slate-100 pb-5">
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              {isRegistering 
                ? (isAr ? `تسجيل ${selectedRole === 'reader' ? 'قارئ جديد' : 'بوتيك شريك'}` : `Inscription - ${selectedRole === 'reader' ? 'Client d\'Élite' : 'Maison d\'Édition'}`)
                : (isAr ? `دخول ${selectedRole === 'reader' ? 'القارئ' : 'الناشر الشريك'}` : `Connexion - ${selectedRole === 'reader' ? 'Client d\'Élite' : 'Maison d\'Édition'}`)
              }
            </h2>
            <p className="text-xs text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
              {selectedRole === 'reader'
                ? (isRegistering 
                    ? (isAr ? 'أنشئ حسابك كقارئ نخبة لتصفح واقتناء أثمن الروايات بالدينار الجزائري.' : 'Devenez membre pour acquérir d\'exquises créations littéraires en DZD.')
                    : (isAr ? 'سجل دخولك الآن للوصول إلى رفوفك الرقمية وقراءة مشترياتك الراقية.' : 'Connectez-vous pour ouvrir votre coffre-fort littéraire numérique.'))
                : (isRegistering
                    ? (isAr ? 'افتح دور نشر متكاملة لنشر وبيع مخطوطاتك بنظام ميتابوك المبتكر.' : 'Enregistrez votre maison d\'édition pour distribuer vos manuscrits en direct.')
                    : (isAr ? 'أدخل إلى لوحة التحكم لمتابعة مبيعات الكتب وتنقيح الأسعار بالدينار الجزائري.' : 'Accédez à votre studio de gestion pour piloter vos titres et réajuster vos prix.'))
              }
            </p>
          </div>

          {/* Active Auth Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-5">
            {authError && (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-none text-xs font-semibold leading-relaxed">
                {authError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t.email}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'reader' ? "lecteur@metabook.dz" : "editions@boutique.dz"}
                className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-600 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t.password}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-600 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-widest rounded-none shadow-md hover:shadow-lg transition-all duration-200 mt-2"
            >
              {isRegistering ? t.register : t.login}
            </button>
          </form>

          {/* Demo Quick Credentials display (Pure and Clean) */}
          <div className="space-y-5 pt-5 border-t border-slate-100">
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-none text-center space-y-2">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block pb-1 border-b border-dashed border-slate-200">
                {isAr ? 'منطقة القراء والناشرين الشركاء' : 'Espace Lectures & Éditions'}
              </span>
              <p className="text-[10px] sm:text-[11px] leading-relaxed text-slate-500">
                {isAr 
                  ? 'هذه البوابة مخصصة حصرياً للعملاء ودور النشر. لوحة التحكم الإدارية تتطلب بوابة آمنة مشفرة.' 
                  : 'Ce portail de connexion est réservé aux clients et éditeurs indépendants d\'extrême orient.'
                }
              </p>
              <button
                type="button"
                onClick={() => setCurrentPage('admin-login')}
                className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1 mt-1"
              >
                <span>{isAr ? 'الولوج لبوابة المشرف الإدارية للمنصة' : 'Accéder au Portail Administratif Sécurisé'}</span>
              </button>
            </div>

            {/* Switch Mode Trigger (Sign in <-> Register) */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs text-rose-600 font-bold hover:underline"
              >
                {isRegistering 
                  ? (isAr ? 'لديك حساب بالفعل؟ قم بتسجيل الدخول' : 'Déjà inscrit ? Connectez-vous ici') 
                  : (isAr ? 'ليس لديك حساب؟ أنشئ واحداً الآن' : 'Nouveau sur Metabook ? Créez un compte d\'exception')
                }
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Find books that the user bought
  const myPurchases = books.filter(b => purchasedBookIds.includes(b.id));

  // Find user's favorite books
  const myFavoritesList = favorites.filter(f => f.userId === currentUser.uid);
  const myFavoritesBooks = books.filter(b => myFavoritesList.some(f => f.bookId === b.id));

  // Find user orders history
  const myOrdersHistory = orders.filter(o => o.userId === currentUser.uid);

  return (
    <div id="metabook_signed_profile" className="space-y-12 pb-24 page-transition" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 1. Header Profile Badge Card */}
      <section className="bg-white rounded-3xl border border-rose-50 p-6 sm:p-10 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -z-1" />
        
        {/* Left Side Info */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center text-white font-serif text-3xl font-extrabold shadow-md transform hover:rotate-3 duration-200">
            {currentUser.email?.substring(0, 1).toUpperCase() || 'M'}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </h2>

              {/* Security Tier Tag */}
              <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border shadow-sm ${
                userProfile?.role === 'admin' 
                  ? 'bg-violet-50 border-violet-200 text-violet-700' 
                  : userProfile?.role === 'partner' 
                    ? 'bg-rose-50 border-rose-200 text-rose-700' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                {userProfile?.role === 'admin' ? t.adminDashboard : userProfile?.role === 'partner' ? 'Boutique Partner' : 'Standard Reader'}
              </span>
            </div>

            <p className="flex items-center gap-1 text-slate-400 text-xs sm:text-sm font-medium">
              <Mail className="w-4 h-4 text-rose-500" />
              <span>{currentUser.email}</span>
            </p>
          </div>
        </div>

        {/* Right Side Options */}
        <div className="flex flex-wrap gap-3">
          {userProfile && userProfile.role !== 'admin' && (
            <button
              onClick={() => updateUserRole(userProfile.role === 'reader' ? 'partner' : 'reader')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full border shadow-sm transition active:scale-95 ${
                userProfile.role === 'reader'
                  ? 'bg-rose-600 border-transparent text-white hover:bg-rose-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>
                {userProfile.role === 'reader' ? (language === 'ar' ? 'طلب ترشيح كشريك بائع' : 'Devenir Partenaire Vendeur') : 'Retour au Profil Lecteur'}
              </span>
            </button>
          )}

          <button
            onClick={logoutUser}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-full shadow-sm transition active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
        </div>
      </section>

      {/* 2. TAB CONTROLS */}
      <div className="flex border-b border-rose-100 gap-4">
        <button
          onClick={() => setActiveTab('books')}
          className={`pb-4 px-3 text-xs font-bold uppercase tracking-wider transition-all duration-150 border-b-2 flex items-center gap-1.5 ${
            activeTab === 'books' 
              ? 'border-rose-600 text-rose-700 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Library className="w-4 h-4" />
          <span>{language === 'ar' ? 'مكتبتي الخاصة' : 'Ma Bibliothèque'}</span>
          {myPurchases.length > 0 && <span className="text-[10px] font-sans px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-full font-bold">{myPurchases.length}</span>}
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-4 px-3 text-xs font-bold uppercase tracking-wider transition-all duration-150 border-b-2 flex items-center gap-1.5 ${
            activeTab === 'favorites' 
              ? 'border-rose-600 text-rose-700 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>{language === 'ar' ? 'المخطوطات المفضلة' : 'Mes Favoris'}</span>
          {myFavoritesBooks.length > 0 && <span className="text-[10px] font-sans px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-full font-bold">{myFavoritesBooks.length}</span>}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 px-3 text-xs font-bold uppercase tracking-wider transition-all duration-150 border-b-2 flex items-center gap-1.5 ${
            activeTab === 'orders' 
              ? 'border-rose-600 text-rose-700 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{language === 'ar' ? 'أرشيف المشتريات' : 'Frais de Commande'}</span>
          {myOrdersHistory.length > 0 && <span className="text-[10px] font-sans px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-full font-bold">{myOrdersHistory.length}</span>}
        </button>
      </div>

      {/* 3. CONDITIONAL TABS CONTENT */}
      <div>
        
        {/* TAB 1: LIBRARY OF PURCHASED BOOKS */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            {myPurchases.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {myPurchases.map((book) => (
                  <div key={book.id} className="relative group">
                    <BookCard book={book} />
                    <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition duration-200">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 rounded-full text-[9px] text-white font-bold uppercase shadow-lg pointer-events-none">
                        <CheckCircle2 className="w-3 h-3 text-white fill-emerald-500" />
                        <span>{language === 'ar' ? 'رخصة نشطة' : 'Licence Active'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8 max-w-lg mx-auto space-y-4">
                <p className="text-slate-400 font-medium text-xs leading-relaxed">
                  {language === 'ar' ? 'لم تقم باقتناء أي مخطوطة رقمية بعد. تفضل بزيارة الكتالوج لشراء كتابك الأول.' : 'Aucun chef-d’œuvre acquis dans votre bibliothèque numérique pour le moment.'}
                </p>
                <button
                  onClick={() => setCurrentPage('explore')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 underline hover:text-rose-700 transition"
                >
                  <span>{language === 'ar' ? 'تصفح تشكيلة الكتب المتاحة' : 'Feuilleter la galerie d’exposition'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FAVORITE BOOKS */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            {myFavoritesBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {myFavoritesBooks.map((book) => (
                  <div key={book.id} className="relative group">
                    <BookCard book={book} />
                    <button
                      onClick={() => toggleFavorite(book.id)}
                      className="absolute top-4 right-4 p-2 bg-white hover:bg-rose-50 rounded-full shadow-md text-rose-600 transition"
                      title="Retirer des favoris"
                    >
                      <Heart className="w-4 h-4 fill-rose-600" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8 max-w-lg mx-auto space-y-2">
                <Heart className="w-8 h-8 text-slate-350 mx-auto" />
                <p className="text-slate-400 font-medium text-xs leading-relaxed">
                  {language === 'ar' ? 'قائمتك المفضلة فارغة حالياً.' : 'Votre liste de lectures préférées est vide.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BILLING & ORDER HISTORY */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-slate-150 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-50 pb-4">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                {language === 'ar' ? 'سجل الفواتير والوصولات المستلمة' : 'Historique Détaillé de vos Achats'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'استعراض جميع رخص القراءة الرقمية والفواتير الصادرة للمدفوعات بالدينار الجزائري.' : 'Consultez vos reçus d’acquisitions certifiés par le label Metabook.'}
              </p>
            </div>

            <div className="space-y-4">
              {myOrdersHistory.map((order) => (
                <div key={order.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-slate-50 border border-slate-100 rounded-xl gap-4 hover:bg-slate-50/80 transition">
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={order.coverImage}
                      alt={order.bookTitle}
                      className="w-10 h-14 object-cover rounded-lg shadow-xs bg-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 className="font-serif text-sm font-bold text-slate-800 tracking-tight truncate">{order.bookTitle}</h4>
                      <p className="text-xs text-slate-400">{order.bookAuthor}</p>
                      
                      <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-emerald-600 font-bold uppercase tracking-wider">
                        <Award className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'رخصة قراءة سارية المفعول' : 'Accès à Vie Approuvé'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end justify-center min-w-max">
                    <span className="font-mono text-emerald-800 font-bold text-sm">
                      {formatPrice(order.bookPrice, language)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}
                    </span>
                  </div>
                </div>
              ))}

              {myOrdersHistory.length === 0 && (
                <div className="text-center py-16 text-slate-400 italic text-xs">
                  {language === 'ar' ? 'لم تسجل أي طلبات شراء حية بعد.' : 'Vous n’avez pas encore effectué de commande numérique.'}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
