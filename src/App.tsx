import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './views/HomeView';
import { ExploreView } from './views/ExploreView';
import { PartnersView } from './views/PartnersView';
import { PartnerStoreView } from './views/PartnerStoreView';
import { BookDetailView } from './views/BookDetailView';
import { ProfileView } from './views/ProfileView';
import { StoreDashboard } from './views/StoreDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { AdminLoginView } from './views/AdminLoginView';
import { NewsView } from './views/NewsView';

const MetabookAppContent: React.FC = () => {
  const { currentPage, dir } = useApp();

  const renderActivePage = () => {
    switch (currentPage) {
      case 'home':
        return <HomeView />;
      case 'explore':
        return <ExploreView />;
      case 'partners':
        return <PartnersView />;
      case 'store-view':
        return <PartnerStoreView />;
      case 'book-view':
        return <BookDetailView />;
      case 'profile':
        return <ProfileView />;
      case 'store-dashboard':
        return <StoreDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-login':
        return <AdminLoginView />;
      case 'news':
        return <NewsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between">
      
      {/* Premium top stick header */}
      <Header />

      {/* Main layout container viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {renderActivePage()}
      </main>

      {/* Persistent mobile bottom tab bar layout */}
      <BottomNav />

      {/* Premium literary footer for desktop screen formats */}
      <footer id="metabook_global_footer" className="hidden md:block py-10 bg-slate-50 border-t border-rose-50 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="font-serif text-lg font-bold text-slate-800">Metabook Marketplace</p>
          <p className="text-xs text-slate-400 font-medium">
            &copy; 100% Secure Multi-Vendor Marketplace. Powered by Node.js & SQLite.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MetabookAppContent />
    </AppProvider>
  );
}
