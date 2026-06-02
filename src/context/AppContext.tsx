import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setToken, getToken } from '../api';
import {
  Book, Store, UserProfile, Language, translations, UserRole, Order, OrderStatus,
  Favorite, NewsArticle, AuthUser, PrintRequest, PrintRequestStatus,
} from '../types';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
  t: typeof translations['fr'];

  // Auth state
  currentUser: AuthUser | null;
  userProfile: UserProfile | null;
  isLoggingIn: boolean;
  authError: string | null;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, role: UserRole) => Promise<void>;
  logoutUser: () => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;

  // Live State (from Node.js backend)
  books: Book[];
  stores: Store[];
  orders: Order[];
  favorites: Favorite[];
  allUsers: UserProfile[];
  newsArticles: NewsArticle[];
  loadingData: boolean;

  // Navigation & Details
  currentPage: 'home' | 'explore' | 'partners' | 'profile' | 'store-dashboard' | 'admin-dashboard' | 'store-view' | 'book-view' | 'admin-login' | 'news';
  setCurrentPage: (page: any) => void;
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;

  // Actions
  addNewBook: (book: Omit<Book, 'id'>) => Promise<void>;
  updateBook: (book: Book) => Promise<void>;
  deleteBookById: (id: string) => Promise<void>;
  registerOrUpdateStore: (store: Omit<Store, 'ownerUid'>) => Promise<void>;
  updateStore: (store: Store) => Promise<void>;
  deleteStoreById: (id: string) => Promise<void>;
  seedDatabase: () => Promise<void>;
  addNewsArticle: (news: Omit<NewsArticle, 'id' | 'createdAt' | 'authorName'>) => Promise<void>;
  deleteNewsArticle: (id: string) => Promise<void>;

  // Print Requests
  printRequests: PrintRequest[];
  submitPrintRequest: (req: Omit<PrintRequest, 'id' | 'userId' | 'userEmail' | 'status' | 'createdAt'>) => Promise<void>;
  updatePrintRequestStatus: (id: string, status: PrintRequestStatus, adminNote?: string) => Promise<void>;

  // Order status management (admin)
  updateOrderStatus: (id: string, status: OrderStatus, adminNote?: string) => Promise<void>;

  // Dynamic features
  toggleFavorite: (bookId: string) => Promise<void>;
  approveUserPartner: (uid: string, approved: boolean) => Promise<void>;
  deleteUserAdmin: (uid: string) => Promise<void>;

  // Purchases
  purchasedBookIds: string[];
  purchaseBook: (bookId: string, shippingInfo?: Partial<Order>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('metabook_lang');
    if (saved === 'fr' || saved === 'ar') return saved;
    return 'fr';
  });
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Navigation
  const [currentPage, setCurrentPageState] = useState<AppContextType['currentPage']>('home');

  const setCurrentPage = (page: any) => {
    setCurrentPageState(page);

    let path = '/';
    if (page === 'admin-login') path = '/admin/login';
    else if (page === 'profile') path = '/profile';
    else if (page === 'explore') path = '/explore';
    else if (page === 'partners') path = '/partners';
    else if (page === 'store-dashboard') path = '/store-dashboard';
    else if (page === 'admin-dashboard') path = '/admin-dashboard';
    else if (page === 'store-view') path = '/store-view';
    else if (page === 'book-view') path = '/book-view';
    else if (page === 'news') path = '/news';

    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  // Listen to browser URL path and hash changes (Popstate / Deep-linking)
  useEffect(() => {
    const handleUrlSync = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;

      if (pathname === '/admin/login' || hash === '#/admin/login' || hash === '#/admin-login') {
        setCurrentPageState('admin-login');
      } else if (pathname === '/profile' || hash === '#/profile') {
        setCurrentPageState('profile');
      } else if (pathname === '/explore' || hash === '#/explore') {
        setCurrentPageState('explore');
      } else if (pathname === '/partners' || hash === '#/partners') {
        setCurrentPageState('partners');
      } else if (pathname === '/store-dashboard' || hash === '#/store-dashboard') {
        setCurrentPageState('store-dashboard');
      } else if (pathname === '/admin-dashboard' || hash === '#/admin-dashboard') {
        setCurrentPageState('admin-dashboard');
      } else if (pathname === '/store-view' || hash === '#/store-view') {
        setCurrentPageState('store-view');
      } else if (pathname === '/book-view' || hash === '#/book-view') {
        setCurrentPageState('book-view');
      } else if (pathname === '/' || pathname === '') {
        setCurrentPageState('home');
      }
    };

    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    window.addEventListener('hashchange', handleUrlSync);
    return () => {
      window.removeEventListener('popstate', handleUrlSync);
      window.removeEventListener('hashchange', handleUrlSync);
    };
  }, []);

  const [selectedBook, setSelectedBookState] = useState<Book | null>(null);
  const [selectedStore, setSelectedStoreState] = useState<Store | null>(null);

  // Data arrays
  const [books, setBooks] = useState<Book[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [printRequests, setPrintRequests] = useState<PrintRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [purchasedBookIds, setPurchasedBookIds] = useState<string[]>([]);

  const t = translations[language];

  // Sync RTL Direction with language
  useEffect(() => {
    const isRtl = language === 'ar';
    setDir(isRtl ? 'rtl' : 'ltr');
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('metabook_lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  const setSelectedBook = (book: Book | null) => {
    setSelectedBookState(book);
    if (book) setCurrentPage('book-view');
  };

  const setSelectedStore = (store: Store | null) => {
    setSelectedStoreState(store);
    if (store) setCurrentPage('store-view');
  };

  // ---- Public data (books, stores, news) ----
  const refreshPublic = useCallback(async () => {
    try {
      const [booksRes, storesRes, newsRes] = await Promise.all([
        api.getBooks(),
        api.getStores(),
        api.getNews(),
      ]);
      setBooks(booksRes);
      setStores(storesRes);
      setNewsArticles(newsRes);
    } catch (err) {
      console.error('Failed to load catalogue:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // ---- Authenticated data (orders, favorites, admin users) ----
  const refreshPrivate = useCallback(async (profile: UserProfile | null) => {
    if (!profile) {
      setOrders([]);
      setFavorites([]);
      setAllUsers([]);
      setPurchasedBookIds([]);
      return;
    }
    try {
      const [ordersRes, favsRes] = await Promise.all([api.getOrders(), api.getFavorites()]);
      setOrders(ordersRes);
      setFavorites(favsRes);
      setPurchasedBookIds(Array.from(new Set(ordersRes.map((o) => o.bookId))));
    } catch (err) {
      console.error('Failed to load member data:', err);
    }
    if (profile.role === 'admin') {
      try {
        const [usersRes, printRes] = await Promise.all([api.getUsers(), api.getPrintRequests()]);
        setAllUsers(usersRes);
        setPrintRequests(printRes);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      }
    } else {
      try {
        setPrintRequests(await api.getPrintRequests());
      } catch (err) {
        console.error('Failed to load print requests:', err);
      }
    }
  }, []);

  // Initial load + restore session from stored token
  useEffect(() => {
    refreshPublic();
    const token = getToken();
    if (token) {
      api.me()
        .then(({ profile }) => {
          setUserProfile(profile);
          setCurrentUser({ uid: profile.uid, email: profile.email });
          refreshPrivate(profile);
        })
        .catch(() => {
          setToken(null);
        });
    }
  }, [refreshPublic, refreshPrivate]);

  // ---- Auth actions ----
  const applyAuth = (token: string, profile: UserProfile) => {
    setToken(token);
    setUserProfile(profile);
    setCurrentUser({ uid: profile.uid, email: profile.email });
    refreshPrivate(profile);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const { token, profile } = await api.login(email, pass);
      applyAuth(token, profile);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid credentials.');
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, role: UserRole) => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const { token, profile } = await api.register(email, pass, role);
      applyAuth(token, profile);
    } catch (err: any) {
      setAuthError(err.message || 'Account creation failed.');
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logoutUser = async () => {
    setToken(null);
    setCurrentUser(null);
    setUserProfile(null);
    setOrders([]);
    setFavorites([]);
    setAllUsers([]);
    setPurchasedBookIds([]);
    setCurrentPage('home');
    setSelectedBookState(null);
    setSelectedStoreState(null);
  };

  const updateUserRole = async (role: UserRole) => {
    if (!currentUser) return;
    try {
      const { profile } = await api.updateRole(role);
      setUserProfile(profile);
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  // ---- Stores ----
  const registerOrUpdateStore = async (storeData: Omit<Store, 'ownerUid'>) => {
    if (!currentUser) throw new Error('Authentication required');
    await api.saveStore(storeData);
    setStores(await api.getStores());
  };

  const updateStore = async (store: Store) => {
    await api.updateStore(store);
    setStores(await api.getStores());
  };

  const deleteStoreById = async (id: string) => {
    await api.deleteStore(id);
    const [storesRes, booksRes] = await Promise.all([api.getStores(), api.getBooks()]);
    setStores(storesRes);
    setBooks(booksRes);
  };

  // ---- Books ----
  const addNewBook = async (bookData: Omit<Book, 'id'>) => {
    if (!currentUser) throw new Error('Authentication required');
    await api.createBook(bookData);
    setBooks(await api.getBooks());
  };

  const updateBook = async (book: Book) => {
    if (!currentUser) throw new Error('Authentication required');
    await api.updateBook(book);
    setBooks(await api.getBooks());
  };

  const deleteBookById = async (id: string) => {
    await api.deleteBook(id);
    setBooks(await api.getBooks());
  };

  const seedDatabase = async () => {
    // The backend seeds itself on first run; here we simply refresh the catalogue.
    await refreshPublic();
    alert('Metabook catalogue synchronized.');
  };

  // ---- Favorites ----
  const toggleFavorite = async (bookId: string) => {
    if (!currentUser) return;
    try {
      await api.toggleFavorite(bookId);
      setFavorites(await api.getFavorites());
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  // ---- Admin: users ----
  const approveUserPartner = async (uid: string, approved: boolean) => {
    try {
      await api.approveUser(uid, approved);
      setAllUsers(await api.getUsers());
    } catch (err) {
      console.error('Failed to approve user:', err);
    }
  };

  const deleteUserAdmin = async (uid: string) => {
    try {
      await api.deleteUser(uid);
      // The backend cascades store/book/favorite removal, so refresh those too.
      const [usersRes, storesRes, booksRes] = await Promise.all([
        api.getUsers(),
        api.getStores(),
        api.getBooks(),
      ]);
      setAllUsers(usersRes);
      setStores(storesRes);
      setBooks(booksRes);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  // ---- Orders / Purchases ----
  const purchaseBook = async (bookId: string, shippingInfo?: Partial<Order>) => {
    if (!currentUser) return;
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    const orderPayload: Partial<Order> = {
      userId: currentUser.uid,
      userEmail: currentUser.email || '',
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookPrice: book.price,
      coverImage: book.coverImage,
      storeId: book.storeId,
      createdAt: new Date().toISOString(),
      ...shippingInfo,
    };
    try {
      await api.createOrder(orderPayload);
      setOrders(await api.getOrders());
      setPurchasedBookIds((prev) => Array.from(new Set([...prev, bookId])));
    } catch (err) {
      console.error('Order placement failed:', err);
    }
  };

  // ---- Order status (admin) ----
  const updateOrderStatus = async (id: string, status: OrderStatus, adminNote?: string) => {
    try {
      await api.updateOrderStatus(id, status, adminNote);
      setOrders(await api.getOrders());
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // ---- Print Requests ----
  const submitPrintRequest = async (reqData: Omit<PrintRequest, 'id' | 'userId' | 'userEmail' | 'status' | 'createdAt'>) => {
    await api.createPrintRequest(reqData);
    setPrintRequests(await api.getPrintRequests());
  };

  const updatePrintRequestStatus = async (id: string, status: PrintRequestStatus, adminNote?: string) => {
    try {
      await api.updatePrintRequestStatus(id, status, adminNote);
      setPrintRequests(await api.getPrintRequests());
    } catch (err) {
      console.error('Failed to update print request status:', err);
    }
  };

  // ---- News ----
  const addNewsArticle = async (newsInput: Omit<NewsArticle, 'id' | 'createdAt' | 'authorName'>) => {
    try {
      await api.createNews(newsInput);
      setNewsArticles(await api.getNews());
    } catch (err) {
      console.error('Failed to create news:', err);
    }
  };

  const deleteNewsArticle = async (id: string) => {
    try {
      await api.deleteNews(id);
      setNewsArticles(await api.getNews());
    } catch (err) {
      console.error('Failed to delete news:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        dir,
        t,
        currentUser,
        userProfile,
        isLoggingIn,
        authError,
        loginWithEmail,
        registerWithEmail,
        logoutUser,
        updateUserRole,
        books,
        stores,
        orders,
        favorites,
        allUsers,
        newsArticles,
        loadingData,
        currentPage,
        setCurrentPage,
        selectedBook,
        setSelectedBook,
        selectedStore,
        setSelectedStore,
        addNewBook,
        updateBook,
        deleteBookById,
        registerOrUpdateStore,
        updateStore,
        deleteStoreById,
        seedDatabase,
        toggleFavorite,
        approveUserPartner,
        deleteUserAdmin,
        purchasedBookIds,
        purchaseBook,
        addNewsArticle,
        deleteNewsArticle,
        printRequests,
        submitPrintRequest,
        updatePrintRequestStatus,
        updateOrderStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
