import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Book, Store, Order, OrderStatus, PrintRequest, PrintRequestStatus, formatPrice } from '../types';
import {
  Users, Store as StoreIcon, Library, Sparkles, ShieldAlert, CheckCircle2,
  Trash2, ShieldCheck, ShieldX, Edit, X, PlusCircle, ShoppingBag, Calendar,
  Upload, Package, Truck, Clock, XCircle, ChevronDown, FileText, Eye, Download,
  Printer, AlertCircle, RefreshCw, ArrowRight, BarChart2, TrendingUp
} from 'lucide-react';

// ─── Status helpers ──────────────────────────────────────────────────────────

const ORDER_STATUSES: { value: OrderStatus; labelFr: string; labelAr: string; color: string; icon: React.FC<any> }[] = [
  { value: 'pending',    labelFr: 'En attente',   labelAr: 'قيد الانتظار',     color: 'bg-amber-50 text-amber-700 border-amber-200',    icon: Clock },
  { value: 'confirmed',  labelFr: 'Confirmée',    labelAr: 'مؤكد',             color: 'bg-blue-50 text-blue-700 border-blue-200',       icon: CheckCircle2 },
  { value: 'processing', labelFr: 'En préparation',labelAr: 'قيد التجهيز',     color: 'bg-violet-50 text-violet-700 border-violet-200', icon: Package },
  { value: 'shipped',    labelFr: 'Expédiée',     labelAr: 'تم الشحن',         color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Truck },
  { value: 'delivered',  labelFr: 'Livrée',       labelAr: 'تم التسليم',       color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  { value: 'on_hold',    labelFr: 'En pause',     labelAr: 'معلق',             color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertCircle },
  { value: 'cancelled',  labelFr: 'Annulée',      labelAr: 'ملغي',             color: 'bg-rose-50 text-rose-700 border-rose-200',       icon: XCircle },
];

const PRINT_STATUSES: { value: PrintRequestStatus; labelFr: string; labelAr: string; color: string; icon: React.FC<any> }[] = [
  { value: 'pending',   labelFr: 'En attente',   labelAr: 'قيد الانتظار',     color: 'bg-amber-50 text-amber-700 border-amber-200',    icon: Clock },
  { value: 'reviewing', labelFr: 'En révision',  labelAr: 'قيد المراجعة',     color: 'bg-blue-50 text-blue-700 border-blue-200',       icon: Eye },
  { value: 'printing',  labelFr: 'Impression',   labelAr: 'قيد الطباعة',      color: 'bg-violet-50 text-violet-700 border-violet-200', icon: Printer },
  { value: 'shipped',   labelFr: 'Expédiée',     labelAr: 'تم الشحن',         color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Truck },
  { value: 'delivered', labelFr: 'Livrée',       labelAr: 'تم التسليم',       color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  { value: 'on_hold',   labelFr: 'En pause',     labelAr: 'معلق',             color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertCircle },
  { value: 'cancelled', labelFr: 'Annulée',      labelAr: 'ملغي',             color: 'bg-rose-50 text-rose-700 border-rose-200',       icon: XCircle },
];

function getOrderStatus(status: OrderStatus | undefined, language: string) {
  const s = ORDER_STATUSES.find(x => x.value === (status || 'pending')) || ORDER_STATUSES[0];
  return { ...s, label: language === 'ar' ? s.labelAr : s.labelFr };
}
function getPrintStatus(status: PrintRequestStatus | undefined, language: string) {
  const s = PRINT_STATUSES.find(x => x.value === (status || 'pending')) || PRINT_STATUSES[0];
  return { ...s, label: language === 'ar' ? s.labelAr : s.labelFr };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

type AnyStatusOption = { value: string; labelFr: string; labelAr: string; color: string; icon: React.FC<any> };
function StatusDropdown({ current, options, onChange, language }: {
  current: string;
  options: AnyStatusOption[];
  onChange: (v: string) => void;
  language: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === current) || options[0];
  const Icon = selected.icon;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border rounded-full transition whitespace-nowrap ${selected.color}`}
      >
        <Icon className="w-3 h-3 flex-shrink-0" />
        <span className="truncate max-w-[90px]">{language === 'ar' ? (selected as any).labelAr : (selected as any).labelFr}</span>
        <ChevronDown className="w-3 h-3 flex-shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
            {options.map(o => {
              const OIcon = o.icon;
              return (
                <button
                  key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition ${o.value === current ? 'font-bold' : ''}`}
                >
                  <OIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{language === 'ar' ? o.labelAr : o.labelFr}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    userProfile,
    books,
    stores,
    orders,
    allUsers,
    printRequests,
    seedDatabase,
    setCurrentPage,
    setSelectedStore,
    addNewBook,
    updateBook,
    deleteBookById,
    updateStore,
    deleteStoreById,
    approveUserPartner,
    deleteUserAdmin,
    updateOrderStatus,
    updatePrintRequestStatus,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'print' | 'users' | 'originals' | 'stores'>('orders');

  // Book form
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [bookForm, setBookForm] = useState<Partial<Book>>({ id: '', title: '', author: '', price: 1500, coverImage: '', isOriginal: true, storeId: 'metabook_hq' });

  // Store form
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [storeForm, setStoreForm] = useState<Partial<Store>>({ id: '', name: '', description: '', bannerImage: '' });

  // Order detail / note
  const [orderNote, setOrderNote] = useState<{ id: string; note: string } | null>(null);

  // Print request detail
  const [printDetail, setPrintDetail] = useState<PrintRequest | null>(null);
  const [printNote, setPrintNote] = useState<{ id: string; note: string } | null>(null);
  const [printFileData, setPrintFileData] = useState<{ fileData: string; fileName: string } | null>(null);
  const { api: _api } = (() => { try { return require('../api'); } catch { return { api: null }; } })();

  const isAr = language === 'ar';

  // Guard
  if (userProfile?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-slate-900">
          {isAr ? 'مطلوب صلاحيات مسؤول النظام' : 'Droits Administratifs Requis'}
        </h2>
        <p className="text-slate-500 text-sm">
          {isAr
            ? 'الوصول مخصص حصرياً لمديري النظام.'
            : "L'accès est réservé exclusivement aux administrateurs."}
        </p>
      </div>
    );
  }

  // ── Stats ──
  const pendingOrders = orders.filter(o => !o.status || o.status === 'pending').length;
  const pendingPrint = printRequests.filter(p => p.status === 'pending' || p.status === 'reviewing').length;
  const pendingPartners = allUsers.filter(u => u.role === 'partner' && !u.approved).length;

  // ── Book helpers ──
  const handleFileUploadBook = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    new Promise<string>(res => { const r = new FileReader(); r.onloadend = () => res(r.result as string); r.readAsDataURL(file); })
      .then(data => setBookForm(prev => ({ ...prev, coverImage: data })));
  };
  const handleFileUploadStore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    new Promise<string>(res => { const r = new FileReader(); r.onloadend = () => res(r.result as string); r.readAsDataURL(file); })
      .then(data => setStoreForm(prev => ({ ...prev, bannerImage: data })));
  };
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.author) { alert('Titre et auteur obligatoires'); return; }
    try {
      if (isAddingBook) {
        await addNewBook({ title: bookForm.title!, author: bookForm.author!, price: Number(bookForm.price) || 1200, coverImage: bookForm.coverImage || '', isOriginal: true, featured: !!bookForm.featured, storeId: 'metabook_hq' });
        setIsAddingBook(false);
      } else {
        await updateBook(bookForm as Book);
        setIsEditingBook(false);
      }
      setBookForm({ id: '', title: '', author: '', price: 1500, coverImage: '', isOriginal: true, storeId: 'metabook_hq' });
    } catch (err: any) { alert(err.message); }
  };
  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeForm.name || !storeForm.description) return;
    try { await updateStore(storeForm as Store); setIsEditingStore(false); }
    catch (err: any) { alert(err.message); }
  };
  const handleDeleteStore = async (store: Store) => {
    if (!window.confirm(isAr ? `حذف متجر "${store.name}"؟` : `Supprimer "${store.name}" ?`)) return;
    try { await deleteStoreById(store.id); } catch (err: any) { alert(err.message); }
  };

  const originalBooks = books.filter(b => b.isOriginal);

  // ── Tab nav ──
  const tabs: { id: typeof activeTab; label: string; labelAr: string; badge?: number }[] = [
    { id: 'orders',    label: 'Commandes',      labelAr: 'الطلبات',         badge: pendingOrders || undefined },
    { id: 'print',     label: 'Impression',     labelAr: 'طلبات الطباعة',   badge: pendingPrint || undefined },
    { id: 'users',     label: 'Utilisateurs',   labelAr: 'المستخدمون',      badge: pendingPartners || undefined },
    { id: 'originals', label: 'Catalogue',      labelAr: 'الكتالوج' },
    { id: 'stores',    label: 'Boutiques',      labelAr: 'المتاجر' },
  ];

  return (
    <div className="space-y-8 pb-24" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Header ── */}
      <div className="bg-slate-950 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#7c3aed22,_transparent_60%)]" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'لوحة إدارة ميتابوك' : 'Tableau de Bord Administrateur'}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              {isAr ? 'مركز العمليات' : 'Centre de Contrôle'}
            </h1>
            <p className="text-slate-400 text-sm">{currentUser?.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-black">{orders.length}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{isAr ? 'طلبات' : 'Commandes'}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-black">{printRequests.length}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{isAr ? 'طباعة' : 'Impressions'}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-black">{books.length}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{isAr ? 'كتب' : 'Livres'}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-black">{allUsers.length}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{isAr ? 'أعضاء' : 'Membres'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab nav ── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-max flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>{isAr ? tab.labelAr : tab.label}</span>
            {tab.badge !== undefined && (
              <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ──────────────────── ORDERS TAB ──────────────────── */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-slate-900">
              {isAr ? 'إدارة طلبات الشراء' : 'Gestion des Commandes'}
            </h2>
            <span className="text-xs text-slate-400 font-mono">{orders.length} {isAr ? 'طلب' : 'commandes'}</span>
          </div>

          {/* Status overview pills */}
          <div className="flex flex-wrap gap-2">
            {ORDER_STATUSES.map(s => {
              const count = orders.filter(o => (o.status || 'pending') === s.value).length;
              if (count === 0) return null;
              const Icon = s.icon;
              return (
                <div key={s.value} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded-full ${s.color}`}>
                  <Icon className="w-3 h-3" />
                  <span>{isAr ? s.labelAr : s.labelFr}</span>
                  <span className="bg-white/60 px-1.5 rounded-full font-black">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[720px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px] w-52">{isAr ? 'العميل' : 'Client'}</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px] w-40">{isAr ? 'الكتاب' : 'Livre'}</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px] w-28">{isAr ? 'الولاية' : 'Wilaya'}</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px] w-24">{isAr ? 'الإجمالي' : 'Total'}</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px] w-24">{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px] text-center w-36">{isAr ? 'الحالة' : 'Statut'}</th>
                    <th className="py-3 px-4 text-[10px] w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.length === 0 && (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-400 italic">{isAr ? 'لا توجد طلبات بعد.' : 'Aucune commande pour le moment.'}</td></tr>
                  )}
                  {orders.map(order => {
                    const stat = getOrderStatus(order.status, language);
                    const Icon = stat.icon;
                    const total = (order.bookPrice || 0) + (order.shippingFee || 0);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{order.fullName || '—'}</div>
                          <div className="text-slate-400 text-[10px] font-mono">{order.userEmail}</div>
                          {order.phone && <div className="text-slate-400 text-[10px]">{order.phone}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-serif font-bold text-slate-800 max-w-[140px] truncate">{order.bookTitle}</div>
                          <div className="text-slate-400 text-[10px]">{order.bookAuthor}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-700">{order.wilayaName || '—'}</div>
                          <div className="text-slate-400 text-[10px]">{order.commune}</div>
                          <div className="text-slate-400 text-[10px]">
                            {order.deliveryType === 'house' ? (isAr ? 'منزل' : 'Domicile') : (isAr ? 'مكتب' : 'Bureau')}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatPrice(total, language)}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">
                          {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-DZ' : 'fr-FR')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusDropdown
                            current={order.status || 'pending'}
                            options={ORDER_STATUSES}
                            language={language}
                            onChange={(v) => updateOrderStatus(order.id, v as OrderStatus)}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setOrderNote({ id: order.id, note: order.adminNote || '' })}
                            className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"
                            title={isAr ? 'ملاحظة إدارية' : 'Note admin'}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────── PRINT REQUESTS TAB ──────────────────── */}
      {activeTab === 'print' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-slate-900">
              {isAr ? 'طلبات الطباعة' : 'Demandes d\'Impression'}
            </h2>
            <span className="text-xs text-slate-400 font-mono">{printRequests.length} {isAr ? 'طلب' : 'demandes'}</span>
          </div>

          {/* Status overview pills */}
          <div className="flex flex-wrap gap-2">
            {PRINT_STATUSES.map(s => {
              const count = printRequests.filter(p => p.status === s.value).length;
              if (count === 0) return null;
              const Icon = s.icon;
              return (
                <div key={s.value} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded-full ${s.color}`}>
                  <Icon className="w-3 h-3" />
                  <span>{isAr ? s.labelAr : s.labelFr}</span>
                  <span className="bg-white/60 px-1.5 rounded-full font-black">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px] w-48">{isAr ? 'العميل' : 'Client'}</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px] w-52">{isAr ? 'تفاصيل الطباعة' : 'Détails'}</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px] w-28">{isAr ? 'الملف' : 'Fichier'}</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px] w-24">{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px] text-center w-36">{isAr ? 'الحالة' : 'Statut'}</th>
                    <th className="py-3 px-4 text-[10px] w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {printRequests.length === 0 && (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 italic">{isAr ? 'لا توجد طلبات طباعة بعد.' : 'Aucune demande d\'impression.'}</td></tr>
                  )}
                  {printRequests.map(pr => {
                    const stat = getPrintStatus(pr.status, language);
                    const coverLabel = pr.coverType === 'hard'
                      ? (isAr ? 'غلاف صلب' : 'Couv. rigide')
                      : (isAr ? 'غلاف عادي' : 'Couv. souple');
                    const colorLabel = pr.colorMode === 'color'
                      ? (isAr ? 'ألوان' : 'Couleur')
                      : (isAr ? 'أبيض وأسود' : 'N&B');
                    return (
                      <tr key={pr.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{pr.fullName}</div>
                          <div className="text-slate-400 text-[10px] font-mono">{pr.userEmail}</div>
                          <div className="text-slate-400 text-[10px]">{pr.phone}</div>
                          <div className="text-slate-400 text-[10px]">{pr.wilayaName}</div>
                        </td>
                        <td className="py-3 px-4 space-y-0.5">
                          <div className="flex flex-wrap gap-1">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">{pr.copies} {isAr ? 'نسخة' : 'ex.'}</span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{pr.paperSize}</span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{coverLabel}</span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{colorLabel}</span>
                          </div>
                          {pr.pageCount && <div className="text-slate-400 text-[10px]">{pr.pageCount} {isAr ? 'صفحة' : 'pages'}</div>}
                          {pr.notes && <div className="text-slate-500 text-[10px] italic max-w-[200px] truncate">{pr.notes}</div>}
                        </td>
                        <td className="py-3 px-4">
                          {pr.fileData ? (
                            <button
                              onClick={() => setPrintDetail(pr)}
                              className="flex items-center gap-1 text-violet-600 hover:text-violet-800 font-bold"
                            >
                              <FileText className="w-4 h-4" />
                              <span className="text-[10px] max-w-[100px] truncate">{pr.fileName || 'PDF'}</span>
                            </button>
                          ) : (
                            <span className="text-slate-300 text-[10px]">{isAr ? 'لا ملف' : 'Aucun'}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">
                          {new Date(pr.createdAt).toLocaleDateString(isAr ? 'ar-DZ' : 'fr-FR')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusDropdown
                            current={pr.status}
                            options={PRINT_STATUSES}
                            language={language}
                            onChange={(v) => updatePrintRequestStatus(pr.id, v as PrintRequestStatus)}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setPrintNote({ id: pr.id, note: pr.adminNote || '' })}
                            className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"
                            title={isAr ? 'ملاحظة' : 'Note'}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────── USERS TAB ──────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-slate-900">
              {isAr ? 'إدارة المستخدمين' : 'Gestion des Utilisateurs'}
            </h2>
            <button
              onClick={seedDatabase}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAr ? 'مزامنة' : 'Sync'}</span>
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px]">{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px]">{isAr ? 'الدور' : 'Rôle'}</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px]">{isAr ? 'الحالة' : 'Statut'}</th>
                    <th className="py-3 px-4 text-center font-bold uppercase tracking-wider text-slate-400 text-[10px]">{isAr ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allUsers.map(user => (
                    <tr key={user.uid} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-mono text-slate-800">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-full ${
                          user.role === 'admin' ? 'bg-rose-50 text-rose-700' : user.role === 'partner' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>{user.role}</span>
                      </td>
                      <td className="py-3 px-4">
                        {user.role === 'partner' ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold uppercase rounded-full ${
                            user.approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {user.approved ? <><ShieldCheck className="w-3 h-3" />{isAr ? 'معتمد' : 'Agréé'}</> : <><ShieldX className="w-3 h-3" />{isAr ? 'معلق' : 'En attente'}</>}
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3 px-4 flex items-center justify-center gap-2">
                        {user.role === 'partner' && (
                          <button
                            onClick={() => approveUserPartner(user.uid, !user.approved)}
                            className={`p-1.5 rounded-lg border transition ${user.approved ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700' : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'}`}
                          >
                            {user.approved ? <ShieldX className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => deleteUserAdmin(user.uid)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {allUsers.length === 0 && (
                    <tr><td colSpan={4} className="py-12 text-center text-slate-400 italic">{isAr ? 'لا يوجد مستخدمون.' : 'Aucun utilisateur.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────── CATALOGUE TAB ──────────────────── */}
      {activeTab === 'originals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-slate-900">{isAr ? 'الكتالوج الأصلي' : 'Catalogue Metabook'}</h2>
            {!isAddingBook && !isEditingBook && (
              <button
                onClick={() => { setBookForm({ id:'', title:'', author:'', price:1500, coverImage:'', isOriginal:true, storeId:'metabook_hq' }); setIsAddingBook(true); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-full transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isAr ? 'إضافة كتاب' : 'Ajouter'}</span>
              </button>
            )}
          </div>

          {(isAddingBook || isEditingBook) && (
            <form onSubmit={handleSaveBook} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4 max-w-xl">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                <h4 className="font-serif text-sm font-bold text-slate-800">{isAddingBook ? (isAr ? 'كتاب جديد' : 'Nouveau livre') : (isAr ? 'تعديل' : 'Modifier')}</h4>
                <button type="button" onClick={() => { setIsAddingBook(false); setIsEditingBook(false); }} className="p-1 hover:bg-slate-200 rounded-full text-slate-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">{isAr ? 'العنوان' : 'Titre'}</label>
                  <input type="text" required value={bookForm.title || ''} onChange={e => setBookForm({...bookForm, title: e.target.value})} className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">{isAr ? 'المؤلف' : 'Auteur'}</label>
                  <input type="text" required value={bookForm.author || ''} onChange={e => setBookForm({...bookForm, author: e.target.value})} className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">{isAr ? 'السعر (د.ج)' : 'Prix (DZD)'}</label>
                  <input type="number" required value={bookForm.price || ''} onChange={e => setBookForm({...bookForm, price: Number(e.target.value)})} className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400">{isAr ? 'صورة الغلاف' : 'Couverture'}</label>
                  <div className="flex gap-3 items-center bg-white border border-slate-200 rounded-xl p-3">
                    <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-500 transition">
                      <Upload className="w-4 h-4" />
                      <span>{isAr ? 'رفع' : 'Choisir'}</span>
                      <input type="file" accept="image/*" onChange={handleFileUploadBook} className="hidden" />
                    </label>
                    {bookForm.coverImage && <img src={bookForm.coverImage} alt="" className="w-10 h-14 object-cover rounded shadow-sm" />}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-rose-300 transition select-none">
                    <input type="checkbox" checked={!!bookForm.featured} onChange={e => setBookForm({ ...bookForm, featured: e.target.checked })} className="mt-0.5 w-4 h-4 accent-rose-600" />
                    <span className="space-y-0.5">
                      <span className="block text-xs font-bold text-slate-800">{isAr ? 'عرضه في الواجهة الرئيسية (Hot Deal)' : 'Mettre en avant (Hot Deals)'}</span>
                      <span className="block text-[10px] text-slate-400">{isAr ? 'يظهر في القسم العلوي للصفحة الرئيسية.' : "Affiché en vedette sur la page d'accueil."}</span>
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => { setIsAddingBook(false); setIsEditingBook(false); }} className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 uppercase">{isAr ? 'إلغاء' : 'Annuler'}</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold uppercase">{isAr ? 'حفظ' : 'Enregistrer'}</button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px]">{isAr ? 'الغلاف' : 'Couv.'}</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px]">{isAr ? 'الكتاب' : 'Livre'}</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-slate-400 text-[10px]">{isAr ? 'السعر' : 'Prix'}</th>
                    <th className="py-3 px-4 text-center font-bold uppercase tracking-wider text-slate-400 text-[10px]">{isAr ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {originalBooks.map(book => (
                    <tr key={book.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4"><img src={book.coverImage} alt={book.title} className="w-8 h-12 rounded object-cover shadow-sm bg-slate-100" referrerPolicy="no-referrer" /></td>
                      <td className="py-3 px-4">
                        <div className="font-serif font-bold text-slate-800">{book.title}</div>
                        <div className="text-slate-400 text-[10px]">{book.author}</div>
                        {book.featured && <span className="text-[8px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold uppercase">Hot Deal</span>}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">{formatPrice(book.price, language)}</td>
                      <td className="py-3 px-4 flex items-center justify-center gap-2">
                        <button onClick={() => { setBookForm(book); setIsEditingBook(true); setIsAddingBook(false); }} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteBookById(book.id)} className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {originalBooks.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-slate-400 italic">{isAr ? 'لا توجد كتب أصلية.' : 'Aucun titre original.'}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────── STORES TAB ──────────────────── */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-slate-900">{isAr ? 'المتاجر الشريكة' : 'Boutiques Partenaires'}</h2>

          {isEditingStore && (
            <form onSubmit={handleSaveStore} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4 max-w-xl">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                <h4 className="font-serif text-sm font-bold text-slate-800">{isAr ? 'تعديل المتجر' : 'Modifier la boutique'}</h4>
                <button type="button" onClick={() => setIsEditingStore(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <input type="text" required value={storeForm.name || ''} onChange={e => setStoreForm({...storeForm, name: e.target.value})} placeholder={isAr ? 'اسم المتجر' : 'Nom'} className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg" />
                <textarea required rows={3} value={storeForm.description || ''} onChange={e => setStoreForm({...storeForm, description: e.target.value})} placeholder={isAr ? 'الوصف' : 'Description'} className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg" />
                <div className="flex gap-3 items-center bg-white border border-slate-200 rounded-xl p-3">
                  <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold uppercase text-slate-500 transition">
                    <Upload className="w-4 h-4" /><span>{isAr ? 'شعار' : 'Logo'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUploadStore} className="hidden" />
                  </label>
                  {storeForm.bannerImage && <img src={storeForm.bannerImage} alt="" className="w-16 h-10 object-cover rounded shadow-sm" referrerPolicy="no-referrer" />}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setIsEditingStore(false)} className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 uppercase">{isAr ? 'إلغاء' : 'Annuler'}</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold uppercase">{isAr ? 'حفظ' : 'Enregistrer'}</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map(store => (
              <div key={store.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
                <img src={store.bannerImage} alt={store.name} className="w-full h-28 object-cover bg-slate-100" referrerPolicy="no-referrer" />
                <div className="p-4 space-y-2">
                  <h3 className="font-serif text-sm font-bold text-slate-800">{store.name}</h3>
                  <p className="text-slate-400 text-[10px] line-clamp-2">{store.description}</p>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { setStoreForm(store); setIsEditingStore(true); }} className="flex-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-1"><Edit className="w-3 h-3" />{isAr ? 'تعديل' : 'Éditer'}</button>
                    <button onClick={() => { setSelectedStore(store); setCurrentPage('store-view'); }} className="flex-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-1"><Eye className="w-3 h-3" />{isAr ? 'عرض' : 'Voir'}</button>
                    <button onClick={() => handleDeleteStore(store)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
            {stores.length === 0 && <div className="col-span-3 py-12 text-center text-slate-400 italic">{isAr ? 'لا توجد متاجر.' : 'Aucune boutique.'}</div>}
          </div>
        </div>
      )}

      {/* ── Order admin-note modal ── */}
      {orderNote && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-slate-900">{isAr ? 'ملاحظة إدارية' : 'Note Administrative'}</h3>
              <button onClick={() => setOrderNote(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <textarea rows={4} value={orderNote.note} onChange={e => setOrderNote({ ...orderNote, note: e.target.value })} placeholder={isAr ? 'اكتب ملاحظتك هنا...' : 'Votre note interne...'} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:border-violet-400" />
            <div className="flex gap-2">
              <button onClick={() => setOrderNote(null)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50">{isAr ? 'إلغاء' : 'Annuler'}</button>
              <button
                onClick={async () => {
                  const order = orders.find(o => o.id === orderNote.id);
                  if (order) await updateOrderStatus(order.id, order.status || 'pending', orderNote.note);
                  setOrderNote(null);
                }}
                className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold"
              >
                {isAr ? 'حفظ' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Print request note modal ── */}
      {printNote && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-slate-900">{isAr ? 'ملاحظة للطلب' : 'Note sur la demande'}</h3>
              <button onClick={() => setPrintNote(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <textarea rows={4} value={printNote.note} onChange={e => setPrintNote({ ...printNote, note: e.target.value })} placeholder={isAr ? 'اكتب ملاحظتك هنا...' : 'Votre note interne...'} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:border-violet-400" />
            <div className="flex gap-2">
              <button onClick={() => setPrintNote(null)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50">{isAr ? 'إلغاء' : 'Annuler'}</button>
              <button
                onClick={async () => {
                  const pr = printRequests.find(p => p.id === printNote.id);
                  if (pr) await updatePrintRequestStatus(pr.id, pr.status, printNote.note);
                  setPrintNote(null);
                }}
                className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold"
              >
                {isAr ? 'حفظ' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Print file viewer modal ── */}
      {printDetail && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-slate-900">{isAr ? 'ملف PDF المرفق' : 'Fichier PDF joint'}</h3>
              <button onClick={() => { setPrintDetail(null); setPrintFileData(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <div><span className="font-bold">{isAr ? 'الملف:' : 'Fichier :'}</span> {printDetail.fileName || 'document.pdf'}</div>
              <div><span className="font-bold">{isAr ? 'الصفحات:' : 'Pages :'}</span> {printDetail.pageCount ?? '—'}</div>
            </div>
            <p className="text-xs text-slate-400">{isAr ? 'لتنزيل الملف، استخدم الزر أدناه.' : 'Utilisez le bouton ci-dessous pour télécharger le fichier.'}</p>
            <a
              href={`/api/print-requests/${printDetail.id}/file`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تنزيل الملف' : 'Télécharger'}</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
};
