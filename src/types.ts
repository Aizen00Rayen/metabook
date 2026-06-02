export type UserRole = 'reader' | 'partner' | 'admin';

// Authenticated user as returned by the Node.js backend (replaces Firebase User).
export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
}

export interface UserProfile {
  uid: string;
  role: UserRole;
  email: string;
  createdAt: string; // ISO String
  approved?: boolean; // For partners
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'on_hold' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookPrice: number;
  coverImage: string;
  storeId: string;
  createdAt: string;
  // Shipping details for Algerian physical book logistics
  fullName?: string;
  phone?: string;
  wilayaId?: number;
  wilayaName?: string;
  commune?: string;
  deliveryType?: 'house' | 'office';
  fullAddress?: string;
  shippingFee?: number;
  status?: OrderStatus;
  adminNote?: string;
}

export type PrintRequestStatus = 'pending' | 'reviewing' | 'printing' | 'shipped' | 'delivered' | 'on_hold' | 'cancelled';

export interface PrintRequest {
  id: string;
  userId: string;
  userEmail: string;
  fullName: string;
  phone: string;
  wilayaId?: number;
  wilayaName?: string;
  commune?: string;
  fullAddress?: string;
  fileData?: string | null;   // base64 PDF (null in list view)
  fileName?: string;
  pageCount?: number;
  copies: number;
  coverType: 'hard' | 'soft';
  paperSize: 'A4' | 'A5' | 'B5';
  colorMode: 'bw' | 'color';
  bindingType: 'glue' | 'spiral' | 'staple';
  notes?: string;
  status: PrintRequestStatus;
  adminNote?: string;
  createdAt: string;
}

export interface Favorite {
  id: string; // userId + "_" + bookId
  userId: string;
  bookId: string;
  createdAt: string;
}

export interface Store {
  id: string; // Matches ownerUid or independent ID
  ownerUid: string;
  name: string;
  description: string;
  bannerImage: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  coverImage: string;
  storeId: string;
  isOriginal: boolean;
  featured?: boolean; // Show in the homepage hero as a Hot Deal
}

export type Language = 'fr' | 'ar';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  home: string;
  explore: string;
  partners: string;
  profile: string;
  adminDashboard: string;
  storeDashboard: string;
  bookOfTheWeek: string;
  metabookOriginals: string;
  partnerBoutiques: string;
  buyNow: string;
  addedToCart: string;
  original: string;
  nonOriginal: string;
  login: string;
  logout: string;
  register: string;
  email: string;
  password: string;
  becomePartner: string;
  readersGroup: string;
  searchPlaceholder: string;
  noBooksFound: string;
  allCategories: string;
  viewStore: string;
  addBook: string;
  titleLabel: string;
  authorLabel: string;
  priceLabel: string;
  coverUrlLabel: string;
  isOriginalLabel: string;
  actions: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  dashboard: string;
  loading: string;
  selectLanguage: string;
  errorRequired: string;
  news: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  category: 'event' | 'book' | 'partnership' | 'general';
  createdAt: string;
  authorName: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  fr: {
    appName: "Metabook",
    tagline: "Le refuge numérique exclusif multi-boutiques pour lectures prestigieuses",
    home: "Accueil",
    explore: "Galerie",
    partners: "Boutiques d'Éditeurs",
    profile: "Espace Membre",
    adminDashboard: "Direction",
    storeDashboard: "Studio Boutique",
    bookOfTheWeek: "Chef-d'œuvre de la Semaine",
    metabookOriginals: "Éditions Originales Metabook",
    partnerBoutiques: "Les Boutiques Partenaires Agréées",
    buyNow: "Acquérir l'Édition Digitale",
    addedToCart: "Livre ajouté à votre bibliothèque avec succès !",
    original: "Original Metabook",
    nonOriginal: "Édition Partenaire",
    login: "Se Connecter",
    logout: "Se Déconnecter",
    register: "Créer un Compte",
    email: "Adresse Email",
    password: "Mot de Passe",
    becomePartner: "Ouvrir une Boutique Partenaire",
    readersGroup: "Rejoindre le Salon Littéraire",
    searchPlaceholder: "Rechercher des manuscrits, des auteurs ou des boutiques...",
    noBooksFound: "Aucun chef-d'œuvre trouvé dans nos collections.",
    allCategories: "Toutes les Merveilles",
    viewStore: "Entrer dans la Boutique",
    addBook: "Inscrire un Nouveau Titre",
    titleLabel: "Titre du Manuscrit",
    authorLabel: "Nom de l'Écrivain",
    priceLabel: "Tarif (DZD)",
    coverUrlLabel: "URL de la Couverture d'Exception",
    isOriginalLabel: "Publier en tant que Création Exclusive Metabook",
    actions: "Actions",
    save: "Enregistrer les Modifications",
    cancel: "Annuler",
    delete: "Retirer",
    edit: "Ajuster",
    dashboard: "Tableau de Bord",
    loading: "Accès à la bibliothèque impériale...",
    selectLanguage: "Langue d'Affichage",
    errorRequired: "Cette information est obligatoire",
    news: "Actualités"
  },
  ar: {
    appName: "ميتابوك",
    tagline: "الملاذ الرقمي الفاخر للمكتبات ودور النشر المستقلة",
    home: "الرئيسية",
    explore: "المعرض",
    partners: "متاجر الشركاء",
    profile: "بوابة العضوية",
    adminDashboard: "جناح الإدارة",
    storeDashboard: "استوديو البوتيك",
    bookOfTheWeek: "روائع الأسبوع المختارة",
    metabookOriginals: "إصدارات ميتابوك الأصلية",
    partnerBoutiques: "متاجر شركائنا المعتمدة",
    buyNow: "اقتناء النسخة الرقمية",
    addedToCart: "تمت إضافة الكتاب الفاخر إلى مكتبتك بنجاح!",
    original: "أصلي من ميتابوك",
    nonOriginal: "إصدار شريك غامر",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    register: "إنشاء حساب جديد",
    email: "البريد الإلكتروني المهني",
    password: "كلمة المرور الحامية",
    becomePartner: "التقديم لفتح دور نشر شريكة",
    readersGroup: "مجلس القراء الأفذاذ",
    searchPlaceholder: "ابحث عن العناوين، المؤلفين أو دور النشر...",
    noBooksFound: "لم نجد أي عمل يطابق استفسارك الرائع.",
    allCategories: "كل التشكيلات الأدبية",
    viewStore: "ولوج المتجر",
    addBook: "تسجيل عنوان مخطوطة جديد",
    titleLabel: "عنوان المخطوطة الكريمة",
    authorLabel: "اسم الكاتب القدير",
    priceLabel: "السعر بالدينار الجزائري (د.ج)",
    coverUrlLabel: "رابط غلاف الكتاب الفاخر",
    isOriginalLabel: "نشر كإصدار كلاسيكي أصلي حصري لميتابوك",
    actions: "الإجراءات المتاحة",
    save: "حفظ ومزامنة التغييرات",
    cancel: "تراجع",
    delete: "استبعاد من الرفوف",
    edit: "تنقيح",
    dashboard: "لوحة التحكم",
    loading: "جاري الإبحار في المخطوطات...",
    selectLanguage: "لغة العرض",
    errorRequired: "هذا الحقل إلزامي تماماً",
    news: "أحدث الأخبار"
  }
};

export const formatPrice = (price: number, lang: Language): string => {
  const dzdValue = Math.round(price);
  // Format as space separated e.g. 2 500
  const formatted = dzdValue.toLocaleString('fr-FR');
  return lang === 'ar' ? `${formatted} د.ج` : `${formatted} DZD`;
};
