import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Compass, Store, User, LayoutDashboard, Newspaper } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentPage, setCurrentPage, currentUser, userProfile, t } = useApp();

  const navItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'explore', label: t.explore, icon: Compass },
    { id: 'partners', label: t.partners, icon: Store },
    { id: 'news', label: t.news, icon: Newspaper },
    { id: 'profile', label: t.profile, icon: User },
  ];

  return (
    <div id="metabook_mobile_bottom_nav" className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-40">
      
      {/* Quick Dashboard Entry point for mobile vendor/admin */}
      {currentUser && userProfile && (userProfile.role === 'partner' || userProfile.role === 'admin') && (
        <div className="flex justify-center -mt-4 mb-1">
          <button
            onClick={() => setCurrentPage(userProfile.role === 'partner' ? 'store-dashboard' : 'admin-dashboard')}
            className={`flex items-center gap-1 px-4 py-1.5 rounded-none shadow-sm text-[10px] font-bold uppercase tracking-wider transition-all border ${
              userProfile.role === 'partner'
                ? 'bg-rose-50 border-rose-600 text-rose-700'
                : 'bg-violet-50 border-violet-600 text-violet-700'
            }`}
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>
              {userProfile.role === 'partner' ? t.storeDashboard : t.adminDashboard}
            </span>
          </button>
        </div>
      )}

      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || 
            (item.id === 'partners' && currentPage === 'store-view') ||
            (item.id === 'explore' && currentPage === 'book-view');

          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-400 transition-colors"
              aria-label={item.label}
            >
              <div className={`p-1 transition-all duration-200 ${
                isActive 
                  ? 'text-rose-600' 
                  : 'hover:text-slate-600'
              }`}>
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-wider uppercase font-bold transition-colors ${
                isActive ? 'text-rose-600' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
