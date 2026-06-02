import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Mail, Lock, Sparkles, LogOut, ArrowRight, Home } from 'lucide-react';
import { Logo } from '../components/Logo';

export const AdminLoginView: React.FC = () => {
  const { 
    currentUser, 
    userProfile, 
    loginWithEmail, 
    logoutUser,
    authError, 
    language, 
    setCurrentPage, 
    t 
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAr = language === 'ar';

  // Automatically navigate to admin dashboard if already logged in as administrator
  useEffect(() => {
    if (currentUser && userProfile?.role === 'admin') {
      setCurrentPage('admin-dashboard');
    }
  }, [currentUser, userProfile, setCurrentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (email.trim().toLowerCase() !== 'admin@metabook-dz.com') {
      setErrorMsg(
        isAr
          ? 'هذه البوابة مخصصة حصرياً للمسؤول الرئيسي (admin@metabook-dz.com).'
          : 'Ce portail est exclusivement réservé au compte Directeur Principal (admin@metabook-dz.com).'
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await loginWithEmail(email.trim().toLowerCase(), password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentification échouée.');
    } finally {
      setLoading(false);
    }
  };

  // Case 1: Already logged in as Admin
  if (currentUser && userProfile?.role === 'admin') {
    return (
      <div id="metabook_admin_logged_in" className="max-w-md mx-auto py-16 text-center space-y-6 page-transition" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <ShieldCheck className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            {isAr ? 'تم تسجيل الدخول كمسؤول' : 'Session Administration Active'}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {isAr 
              ? 'أنت متصل بالفعل بصفة مسؤول النظام الرئيسي لميتابوك.' 
              : 'Vous êtes déjà authentifié en tant que Directeur Principal de Metabook.'
            }
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setCurrentPage('admin-dashboard')}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-150 flex items-center justify-center gap-2"
          >
            <span>{isAr ? 'دخول لوحة التحكم' : 'Accéder au Pupitre'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={logoutUser}
            className="px-4 py-3 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold uppercase transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Case 2: Logged in but NOT as Admin (e.g. reader or partner)
  if (currentUser && userProfile?.role !== 'admin') {
    return (
      <div id="metabook_admin_non_authorized" className="max-w-md mx-auto py-16 text-center space-y-6 page-transition" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="w-20 h-20 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <LogOut className="w-10 h-10" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            {isAr ? 'مطلوب تسجيل خروج الحساب الحالي' : 'Déconnexion Requise'}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            {isAr 
              ? 'حسابك الحالي ليس له صلاحيات مدير. يرجى تسجيل الخروج أولاً لتتمكن من تفقد البوابة الإدارية.'
              : 'Votre compte actif ne détient pas de droits d\'administration. Veuillez vous déconnecter pour accéder au portail administratif.'
            }
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            {isAr ? `الحساب الحالي: ${currentUser.email}` : `Compte actif : ${currentUser.email}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={logoutUser}
            className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-150"
          >
            {isAr ? 'تسجيل الخروج الآن' : 'Se Déconnecter'}
          </button>
          
          <button
            onClick={() => setCurrentPage('home')}
            className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>{isAr ? 'الرئيسية' : 'Retour'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Case 3: Display Admin Login Interface
  return (
    <div id="metabook_admin_login" className="max-w-md mx-auto py-6 px-4 page-transition select-none" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <Logo className="w-16 h-16" showText={true} textSize="text-3xl" />
        <div className="inline-flex items-center gap-1 bg-violet-100 text-violet-800 border border-violet-200 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest">
          <Sparkles className="w-3 h-3" />
          <span>{isAr ? 'بوابة إدارة التحكم الآمن' : 'Portail de Direction Générale'}</span>
        </div>
      </div>

      <div className="bg-slate-950 text-white rounded-none border-2 border-slate-800 p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-violet-600" />
        
        <div className="text-center space-y-2 border-b border-slate-900 pb-4">
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
            {isAr ? 'التحقق من الهوية الرئاسية' : 'Sceau Authentificateur'}
          </h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
            {isAr 
              ? 'الوصول مقتصر على لوحات الإدارة والتحكم وتعديل تراخيص دور النشر الشريكة.' 
              : 'Saisissez vos clés de contrôle pour prendre les rênes de la direction de la plateforme.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/20 text-rose-400 border border-rose-900/40 text-xs font-semibold leading-relaxed">
              {errorMsg}
            </div>
          )}
          {authError && !errorMsg && (
            <div className="p-3 bg-rose-950/20 text-rose-400 border border-rose-900/40 text-xs font-semibold leading-relaxed">
              {authError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block">
              {isAr ? 'البريد الإلكتروني الإداري' : 'Identifiant Administratif'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@metabook-dz.com"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-none py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-slate-900 transition font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block">
              {isAr ? 'رمز المرور السري المشفر' : 'Clé de Sécurité'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-none py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-slate-900 transition font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800/40 disabled:text-slate-500 text-white text-xs font-bold uppercase tracking-widest rounded-none shadow-md transition-all duration-200 mt-2"
          >
            {loading ? (isAr ? 'جاري التحقق...' : 'Vérification...') : (isAr ? 'ولوج آمن بصفة مدير' : 'Déverrouiller le Pupitre')}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-900">
          <button
            onClick={() => setCurrentPage('home')}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition block font-semibold underline"
          >
            {isAr ? 'العودة إلى متجر الكتب العام' : 'Retourner au Marché Commun'}
          </button>
        </div>
      </div>
    </div>
  );
};
