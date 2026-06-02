import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  ShoppingCart,
  CheckCircle,
  Download,
  MapPin,
  Truck,
  Phone,
  User,
  Building,
  AlertCircle,
  Package
} from 'lucide-react';
import { formatPrice } from '../types';
import { WILAYAS, getShippingFee } from '../data/wilayas';

export const BookDetailView: React.FC = () => {
  const { 
    selectedBook, 
    setSelectedBook, 
    stores, 
    purchasedBookIds, 
    purchaseBook, 
    setCurrentPage,
    t, 
    language,
    dir
  } = useApp();

  const [purchasing, setPurchasing] = useState(false);
  const [isCheckoutActive, setIsCheckoutActive] = useState(false);
  
  // Checkout Shipping Form State for Algerian Logistics
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    phone: '',
    wilayaId: 16, // Default: Alger
    commune: '',
    deliveryType: 'house' as 'house' | 'office',
    fullAddress: ''
  });

  const [formError, setFormError] = useState('');

  // Return if selectedBook is missing
  if (!selectedBook) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-slate-500 font-medium">
          {language === 'ar' ? 'الرجاء اختيار كتاب من المعرض.' : 'Veuillez sélectionner un ouvrage depuis la galerie.'}
        </p>
        <button
          onClick={() => setCurrentPage('explore')}
          className="text-white bg-rose-600 hover:bg-rose-700 font-bold px-6 py-2.5 rounded-full"
        >
          {language === 'ar' ? 'العودة للمعرض' : 'Retour à la Galerie'}
        </button>
      </div>
    );
  }

  const store = stores.find(s => s.id === selectedBook.storeId);
  const isPurchased = purchasedBookIds.includes(selectedBook.id);

  const selectedWilayaObj = WILAYAS.find(w => w.id === shippingForm.wilayaId) || WILAYAS[15]; // default Alger
  const currentShippingFee = getShippingFee(shippingForm.wilayaId, shippingForm.deliveryType);
  const totalDZDValue = selectedBook.price + currentShippingFee;

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const { fullName, phone, commune, deliveryType, fullAddress } = shippingForm;

    if (!fullName.trim()) {
      setFormError(language === 'ar' ? 'الرجاء إدخال الاسم الكامل.' : 'Veuillez saisir votre nom complet.');
      return;
    }
    if (!phone.trim()) {
      setFormError(language === 'ar' ? 'الرجاء إدخال رقم الهاتف.' : 'Veuillez saisir votre numéro de téléphone.');
      return;
    }
    // Simple Algerian Phone Regex (starts with 05, 06, 07, 02, etc. and reaches 9 or 10 numbers)
    if (phone.trim().length < 9) {
      setFormError(language === 'ar' ? 'رقم الهاتف غير صالح.' : 'Numéro de téléphone invalide.');
      return;
    }
    if (!commune.trim()) {
      setFormError(language === 'ar' ? 'الرجاء إدخال البلدية.' : 'Veuillez saisir votre commune.');
      return;
    }
    if (deliveryType === 'house' && !fullAddress.trim()) {
      setFormError(language === 'ar' ? 'الرجاء إدخال العنوان المفصل لتسليم المنزل.' : 'Veuillez saisir l\'adresse exacte pour la livraison à domicile.');
      return;
    }

    setPurchasing(true);
    try {
      await purchaseBook(selectedBook.id, {
        fullName,
        phone,
        wilayaId: shippingForm.wilayaId,
        wilayaName: language === 'ar' ? selectedWilayaObj.nameAr : selectedWilayaObj.nameFr,
        commune,
        deliveryType,
        fullAddress: deliveryType === 'house' ? fullAddress : `Bureau de transport (${selectedWilayaObj.nameFr})`,
        shippingFee: currentShippingFee
      });
      setIsCheckoutActive(false);
    } catch (err) {
      console.error(err);
    } finally {
      setPurchasing(false);
    }
  };

  // If checkout screen is activated:
  if (isCheckoutActive) {
    return (
      <div id="metabook_checkout_view" className="space-y-6 pb-32 page-transition select-none">
        
        {/* Back to Details trigger */}
        <button
          onClick={() => setIsCheckoutActive(false)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition active:scale-95 bg-white border border-slate-100 shadow-sm px-4 py-2 rounded-full"
        >
          <ArrowLeft className="w-4 h-4 text-rose-600" />
          <span>{language === 'ar' ? 'الرجوع للمواصفات' : 'Retour aux détails du livre'}</span>
        </button>

        <div className="text-center md:text-start space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
            {language === 'ar' ? 'إتمام اقتناء الكتاب والشحن' : 'Finaliser la Commande & Expédition'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            {language === 'ar' 
              ? 'يرجى إدخال معلومات التوصيل لجميع الولايات بأسعار شحن ممتازة.' 
              : 'Veuillez renseigner vos coordonnées pour une expédition sécurisée à travers toutes les Wilayas d\'Algérie.'
            }
          </p>
        </div>

        {/* Checkout Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Order Invoice Book Preview Card (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-100/80 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="font-serif font-bold text-slate-800 border-b border-rose-100/40 pb-3">
              {language === 'ar' ? 'ملخص مقتنياتك الفاخرة' : 'Votre Sélection Prestigieuse'}
            </h3>

            <div className="flex gap-4 items-center">
              <div className="w-16 h-22 rounded-lg overflow-hidden shadow-md flex-shrink-0 bg-white">
                <img src={selectedBook.coverImage} className="w-full h-full object-cover" alt={selectedBook.title} />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-black text-slate-900 text-sm leading-tight line-clamp-2">{selectedBook.title}</h4>
                <p className="text-xs text-slate-500 italic font-serif">by {selectedBook.author}</p>
                {store && (
                  <span className="text-[9px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {store.name}
                  </span>
                )}
              </div>
            </div>

            {/* Price Calculations breakdown */}
            <div className="space-y-3 pt-4 border-t border-rose-100/40">
              <div className="flex justify-between text-xs text-slate-600">
                <span>{language === 'ar' ? 'ثمن المخطوطة' : 'Prix de l\'ouvrage'}</span>
                <span className="font-mono font-medium">{formatPrice(selectedBook.price, language)}</span>
              </div>
              
              <div className="flex justify-between text-xs text-slate-600">
                <span>
                  {language === 'ar' ? 'تكلفة التوصيل' : 'Frais de livraison'} ({language === 'ar' ? selectedWilayaObj.nameAr : selectedWilayaObj.nameFr})
                </span>
                <span className="font-mono font-medium">+{formatPrice(currentShippingFee, language)}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>{language === 'ar' ? 'طريقة الاستلام' : 'Mode choisi'}</span>
                <span className="font-bold text-rose-600 text-[11px]">
                  {shippingForm.deliveryType === 'house' 
                    ? (language === 'ar' ? 'توصيل للمنزل' : 'À Domicile') 
                    : (language === 'ar' ? 'مكتب التوصيل' : 'Bureau de transport')
                  }
                </span>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center text-slate-900 pt-3 border-t border-slate-200">
                <span className="font-bold text-sm">{language === 'ar' ? 'المجموع المستحق' : 'Montant Total'}</span>
                <span className="font-mono text-xl font-extrabold text-rose-600">{formatPrice(totalDZDValue, language)}</span>
              </div>
            </div>

            {/* Algerian Cash on delivery pill */}
            <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 flex gap-3 text-xs text-amber-900 line-height-relaxed items-start">
              <Truck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{language === 'ar' ? 'الدفع الحصري للمستلم عند الاستلام' : 'Paiement à la Livraison Directe'}</p>
                <p className="text-[11px] text-amber-800/80 mt-1">
                  {language === 'ar' 
                    ? 'ستدفع المبلغ الكلي نقداً للتوصيل فور تسلّم كتابك الفاخر بيديك الكريمتين.' 
                    : 'Le règlement s\'effectue en espèces (DZD) de la main à la main dès réception de votre colis.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: High quality Shipping Address Form (lg:col-span-7) */}
          <form onSubmit={handlePurchaseSubmit} className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="font-serif text-lg font-extrabold text-slate-900 pb-2 border-b border-rose-100/20">
              {language === 'ar' ? 'معلومات شحن الطرد الفاخر' : 'Coordonnées de l\'Expédition'}
            </h3>

            {formError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-500" />
                  <span>{language === 'ar' ? 'الاسم واللقب بالكامل' : 'Nom & Prénom Complet'} *</span>
                </label>
                <input
                  type="text"
                  required
                  value={shippingForm.fullName}
                  onChange={e => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                  placeholder={language === 'ar' ? 'مثال: محمد الأمين' : 'Ex: Mohamed El Amine'}
                  className="w-full text-xs sm:text-sm px-4.5 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-rose-500" />
                  <span>{language === 'ar' ? 'رقم الهاتف (للاتصال فور الوصول)' : 'Numéro de Téléphone'} *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={shippingForm.phone}
                  onChange={e => setShippingForm({ ...shippingForm, phone: e.target.value })}
                  placeholder="Ex: 0555123456"
                  className="w-full text-xs sm:text-sm px-4.5 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono font-semibold"
                />
              </div>

              {/* Select Wilaya (Dropdown lists all 58 Wilayas) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{language === 'ar' ? 'الولاية الرسمية لشحن الطرد' : 'Wilaya de Destination'} *</span>
                </label>
                <select
                  value={shippingForm.wilayaId}
                  onChange={e => setShippingForm({ ...shippingForm, wilayaId: Number(e.target.value) })}
                  className="w-full text-xs sm:text-sm px-4.5 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
                >
                  {WILAYAS.map(w => (
                    <option key={w.id} value={w.id}>
                      {String(w.id).padStart(2, '0')} - {language === 'ar' ? w.nameAr : w.nameFr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Commune */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-rose-500" />
                  <span>{language === 'ar' ? 'البلدية' : 'Commune / Ville'} *</span>
                </label>
                <input
                  type="text"
                  required
                  value={shippingForm.commune}
                  onChange={e => setShippingForm({ ...shippingForm, commune: e.target.value })}
                  placeholder={language === 'ar' ? 'مثال: باب الزوار' : 'Ex: Bab Ezzouar'}
                  className="w-full text-xs sm:text-sm px-4.5 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                />
              </div>

            </div>

            {/* Delivery Option Selection Toggles */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 block">
                {language === 'ar' ? 'نوع تسليم الطرد' : 'Type de Livraison'} *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* House Delivery Toggle */}
                <button
                  type="button"
                  onClick={() => setShippingForm({ ...shippingForm, deliveryType: 'house' })}
                  className={`p-4 rounded-2xl border text-start flex flex-col justify-between transition h-28 ${
                    shippingForm.deliveryType === 'house'
                      ? 'border-rose-500 bg-rose-50/40 shadow-sm ring-1 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {language === 'ar' ? 'التسليم للمنزل' : 'À Domicile (Home)'}
                    </span>
                    <input
                      type="radio"
                      checked={shippingForm.deliveryType === 'house'}
                      readOnly
                      className="text-rose-600 focus:ring-rose-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {language === 'ar' 
                      ? 'توصيل مباشر لباب منزلك مريح ومعتمد بالكامل.' 
                      : 'Livreur se déplace chez vous pour remettre le colis en main propre.'
                    }
                  </p>
                </button>

                {/* Office Delivery Toggle */}
                <button
                  type="button"
                  onClick={() => setShippingForm({ ...shippingForm, deliveryType: 'office' })}
                  className={`p-4 rounded-2xl border text-start flex flex-col justify-between transition h-28 ${
                    shippingForm.deliveryType === 'office'
                      ? 'border-rose-500 bg-rose-50/40 shadow-sm ring-1 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {language === 'ar' ? 'مكتب التوصيل المحلي' : 'Bureau de Transport'}
                    </span>
                    <input
                      type="radio"
                      checked={shippingForm.deliveryType === 'office'}
                      readOnly
                      className="text-rose-600 focus:ring-rose-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {language === 'ar' 
                      ? 'الاستلام من مكتب شركة الشحن الأقرب لبلديتك (يالدين، قاضي تور، إلخ).' 
                      : 'Récupération rapide au guichet de l\'agence locale, tarif réduit.'
                    }
                  </p>
                </button>

              </div>
            </div>

            {/* Address Field: Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">
                {shippingForm.deliveryType === 'house'
                  ? (language === 'ar' ? 'العنوان السكني الدقيق لتسليم الطرد *' : 'Adresse Exacte du Domicile *')
                  : (language === 'ar' ? 'ملاحظات بخصوص مكتب الشحن (اختياري)' : 'Instructions optionnelles / Agence préférentielle')
                }
              </label>
              <textarea
                rows={3}
                required={shippingForm.deliveryType === 'house'}
                value={shippingForm.fullAddress}
                onChange={e => setShippingForm({ ...shippingForm, fullAddress: e.target.value })}
                placeholder={
                  shippingForm.deliveryType === 'house'
                    ? (language === 'ar' ? 'اسم الشارع، رقم المنزل، العمارة، الطابق...' : 'Ex: 12 Rue des Martyrs, Cité 500 logts, Bat C, Escalier 2...')
                    : (language === 'ar' ? 'مثال: تفضيل مكتب يالدين للشحن بوسط المدينة.' : 'Ex: Agence Yalidine de Bir Mourad Raïs de préférence.')
                }
                className="w-full text-xs sm:text-sm px-4.5 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={purchasing}
              className="w-full flex items-center justify-center gap-2.5 py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold rounded-full shadow-lg hover:shadow-rose-600/10 active:scale-95 transition-all text-xs sm:text-sm tracking-wider uppercase mt-4"
            >
              {purchasing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4 animate-pulse" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{language === 'ar' ? 'جاري إرسال طلب الشحن الفاخر...' : 'Envoi de votre commande en cours...'}</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تأكيد وحجز طلبي الآن' : 'Confirmer et Commander Maintenant'}</span>
                </>
              )}
            </button>

          </form>

        </div>

      </div>
    );
  }

  // Back to normal Book Specs view
  return (
    <div id="metabook_book_details_view" className="space-y-4 pb-32 md:pb-24 page-transition select-none">
      
      {/* 1. Back button */}
      <button
        onClick={() => {
          setSelectedBook(null);
          setCurrentPage('explore');
        }}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition active:scale-95 bg-white border border-slate-100 shadow-sm px-4 py-2 rounded-full"
      >
        <ArrowLeft className="w-4 h-4 text-rose-600" />
        <span>{language === 'ar' ? 'الرجوع للمعرض' : 'Retour à la Galerie'}</span>
      </button>

      {/* 2. Main Luxury Book Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start pt-4">
        
        {/* Left Aspect: The Cover Artwork with Spine Shadows */}
        <div className="md:col-span-5 flex justify-center sticky top-24">
          <div className="relative w-64 sm:w-80 aspect-[3/4]">
            
            {/* Massive physical shadow depth */}
            <div className="absolute -inset-2 bg-rose-600/10 rounded-[2.5rem] blur-2xl opacity-80" />
            
            <div className="absolute inset-0 bg-white rounded-3xl overflow-hidden shadow-[20px_35px_70px_-10px_rgba(15,23,42,0.35)] transform duration-300 hover:scale-[1.01]">
              <img
                src={selectedBook.coverImage}
                alt={selectedBook.title}
                className="w-full h-full object-cover"
              />
              
              {/* Core physical depth cues */}
              <div className={`absolute top-0 bottom-0 w-3.5 bg-gradient-to-r from-black/28 to-transparent ${
                dir === 'rtl' ? 'right-0' : 'left-0'
              }`} />
              <div className={`absolute top-0 bottom-0 w-1 bg-white/20 ${
                dir === 'rtl' ? 'right-3.5' : 'left-3.5'
              }`} />
            </div>
          </div>
        </div>

        {/* Right Aspect: Typographic reviews & purchase card */}
        <div className="md:col-span-7 space-y-8">
          
          <div className="space-y-4">
            {/* Tags line */}
            <div className="flex flex-wrap items-center gap-2.5">
              {selectedBook.isOriginal ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white text-[10px] font-bold uppercase rounded-full tracking-wider shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 fill-white" />
                  <span>{t.original}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase rounded-full tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t.nonOriginal}</span>
                </div>
              )}
              {store && (
                <span className="text-[10px] bg-rose-50 border border-rose-100/50 text-rose-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  {store.name}
                </span>
              )}
            </div>

            {/* Book Title */}
            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {selectedBook.title}
            </h1>

            {/* Author */}
            <p className="font-serif italic text-lg sm:text-2xl text-slate-500">
              {language === 'ar' ? 'بأنامل ' : 'By '}
              <span className="font-sans font-bold not-italic text-sm text-slate-800 uppercase tracking-widest block sm:inline">
                {selectedBook.author}
              </span>
            </p>
          </div>

          {/* Purchase Option (Visible on Desktop / hidden on mobile dynamically for layout beauty) */}
          <div className="hidden md:block bg-slate-50 border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6 max-w-lg">
            
            <div className="flex items-center justify-between border-b border-rose-100/40 pb-4">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{language === 'ar' ? 'سعر الكتاب المطبوع' : 'Prix livre imprimé'}</span>
                <p className="text-3xl font-extrabold text-slate-900">{formatPrice(selectedBook.price, language)}</p>
              </div>
              <div className="text-[10px] text-slate-500 max-w-[160px] text-end italic">
                {language === 'ar' ? 'شحن لجميع ولايات الجزائر · الدفع عند الاستلام' : 'Livraison partout en Algérie · Paiement à la livraison'}
              </div>
            </div>

            {isPurchased ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 px-4.5 py-3.5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 text-sm font-semibold">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{t.addedToCart}</span>
                </div>
                <button
                  onClick={() => setCurrentPage('profile')}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 border border-emerald-200 hover:bg-emerald-50/50 text-emerald-800 font-bold rounded-full transition-all text-xs tracking-wider"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ar' ? 'عرض طلباتي' : 'Voir mes commandes'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsCheckoutActive(true)}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold rounded-full shadow-lg hover:shadow-rose-600/10 active:scale-95 transition-all text-sm tracking-wider"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t.buyNow}</span>
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium font-mono">
              <Truck className="w-3.5 h-3.5 text-rose-500" />
              <span>{language === 'ar' ? 'شحن سريع لجميع الولايات · الدفع عند الاستلام' : 'LIVRAISON COD · TOUTES WILAYAS · ALGÉRIE'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. MOBILE FIXED PURCHASE BOTTOM SHEET */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-rose-100/60 shadow-[0_-8px_24px_rgba(244,63,94,0.1)] px-5 py-4 z-40 flex items-center justify-between gap-4 pb-safe">
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{t.priceLabel}</span>
          <span className="text-xl font-black text-rose-600">{formatPrice(selectedBook.price, language)}</span>
        </div>

        {isPurchased ? (
          <button
            onClick={() => setCurrentPage('profile')}
            className="flex-1 max-w-[200px] flex items-center justify-center gap-1.5 px-4 py-3 bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold rounded-full text-xs shadow-sm"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ar' ? 'شراء ناجح' : 'Purchased ✓'}</span>
          </button>
        ) : (
          <button
            onClick={() => setIsCheckoutActive(true)}
            className="flex-1 max-w-[240px] flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold rounded-full text-xs shadow-md tracking-wider active:scale-95 transition-all"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{t.buyNow}</span>
          </button>
        )}
      </div>

    </div>
  );
};
