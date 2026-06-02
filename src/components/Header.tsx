import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Store, User, Globe, LayoutDashboard, LogOut, Library, Newspaper } from 'lucide-react';
import { Language } from '../types';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    currentPage, 
    setCurrentPage, 
    currentUser, 
    userProfile, 
    logoutUser,
    t,
    dir
  } = useApp();

  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t.home, icon: BookOpen },
    { id: 'explore', label: t.explore, icon: Library },
    { id: 'partners', label: t.partners, icon: Store },
    { id: 'news', label: t.news, icon: Newspaper },
  ];

  return (
    <header id="metabook_main_header" className="sticky top-0 z-40 w-full bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
        
        {/* Left Side: Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 h-full" aria-label="Desktop primary navigation">
          {navLinks.map((link) => {
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setCurrentPage(link.id)}
                className={`text-sm font-medium tracking-wide transition-colors relative py-5 h-full flex items-center ${
                  isActive 
                    ? 'text-rose-600 font-bold border-b-2 border-rose-600' 
                    : 'text-slate-500 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-200'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Center: Brand Logo & Title */}
        <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 flex items-center gap-2.5 cursor-pointer h-full" onClick={() => setCurrentPage('home')}>
          <Logo className="w-9 h-9" showText={true} textSize="text-2xl" />
        </div>

        {/* Right Side: Actions (I18n, Dashboards, Quick Profile) */}
        <div className="flex items-center gap-4">
          
          {/* I18n Language Selector */}
          <div className="relative">
            <button
              id="language-menu-trigger"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center bg-slate-50 border border-slate-200 rounded-none px-3 py-1.5 gap-1.5 text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle language menu"
            >
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold uppercase">{language}</span>
            </button>

            {langMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangMenuOpen(false)} />
                <div className={`absolute top-full mt-1.5 w-36 bg-white border border-slate-200 rounded-none shadow-md z-20 overflow-hidden ${
                  dir === 'rtl' ? 'left-0' : 'right-0'
                }`}>
                  <div className="py-1">
                    {(['fr', 'ar'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-start px-4 py-2 text-xs font-medium hover:bg-slate-50 transition-colors ${
                          language === lang ? 'text-rose-600 bg-rose-50/50 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        {lang === 'fr' ? 'Français (FR)' : 'العربية (AR)'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Dashboards Shortcut (Only visible if vendor partner or admin is authenticated) */}
          {currentUser && userProfile && (
            <div className="hidden sm:flex items-center gap-2">
              {userProfile.role === 'partner' && (
                <button
                  onClick={() => setCurrentPage('store-dashboard')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-none border text-xs font-medium transition-all ${
                    currentPage === 'store-dashboard'
                      ? 'bg-rose-50 border-rose-600 text-rose-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t.storeDashboard}</span>
                </button>
              )}
              {userProfile.role === 'admin' && (
                <button
                  onClick={() => setCurrentPage('admin-dashboard')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-none border text-xs font-medium transition-all ${
                    currentPage === 'admin-dashboard'
                      ? 'bg-violet-50 border-violet-600 text-violet-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-violet-600" />
                  <span>{t.adminDashboard}</span>
                </button>
              )}
            </div>
          )}

          {/* Profile Hub / Sign In Toggle */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage('profile')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-none text-xs font-medium border border-slate-200 transition ${
                  currentPage === 'profile'
                    ? 'bg-rose-600 text-white hover:bg-rose-700 border-transparent font-semibold'
                    : 'bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate hidden sm:inline">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <span className="inline sm:hidden uppercase">
                  {userProfile?.role === 'admin' ? 'A' : userProfile?.role === 'partner' ? 'P' : 'R'}
                </span>
              </button>
              <button
                onClick={logoutUser}
                className="p-1.5 border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-rose-600 transition"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentPage('profile')}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold rounded-none tracking-wider transition duration-205"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.login.toUpperCase()}</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
