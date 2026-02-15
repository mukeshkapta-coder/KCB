
import React from 'react';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'auction' | 'retention' | 'dashboard' | 'players' | 'rules';
  setActiveTab: (tab: 'auction' | 'retention' | 'dashboard' | 'players' | 'rules') => void;
  onSync: () => void;
  onReset: () => void;
  onLogout: () => void;
  isSyncing: boolean;
  role: 'admin' | 'user';
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  onReset, 
  onLogout,
  role
}) => {
  // Reordered: Auction -> Franchise (dashboard) -> Retention (was lucky-draw) -> Players -> Rules
  const allTabs = (['auction', 'dashboard', 'retention', 'players', 'rules'] as const).filter(tab => {
    if (role === 'user') {
      return !['auction', 'retention'].includes(tab);
    }
    return true;
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-[#f3f4f6] relative">
      <header className="sticky top-0 z-50 shadow-md">
        {/* Top Dark Bar */}
        <div className="bg-ecbNavy text-white">
          <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-12 h-full">
              <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setActiveTab(role === 'admin' ? 'auction' : 'dashboard')}>
                <Logo className="h-10 w-auto" inverted />
                <div className="hidden sm:block border-l border-white/20 pl-4">
                  <h1 className="text-white font-black text-sm leading-none uppercase italic tracking-tighter">Kalpataru Cricket Bash</h1>
                  <p className="text-ecbCyan font-black text-[8px] uppercase tracking-[0.2em] mt-0.5">KCB SEASON 2026</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className={`text-[10px] font-black uppercase italic ${role === 'admin' ? 'text-ecbRed' : 'text-ecbGreen'}`}>
                  {role === 'admin' ? 'Admin Access' : 'Viewer Mode'}
                </span>
              </div>
              {role === 'admin' && (
                <button onClick={onReset} className="text-[10px] font-black uppercase tracking-tighter hover:text-ecbRed transition-colors">Reset</button>
              )}
              <button 
                onClick={onLogout}
                className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        {/* Second Level Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-[1800px] mx-auto flex h-14 overflow-hidden">
            {allTabs.map((tab, idx) => {
              const isActive = activeTab === tab;
              let label = tab.charAt(0).toUpperCase() + tab.slice(1);
              if (tab === 'auction') label = 'AUCTION';
              if (tab === 'retention') label = 'RETENTION';
              if (tab === 'dashboard') label = 'FRANCHISE';
              if (tab === 'players') label = 'PLAYERS';
              if (tab === 'rules') label = 'RULES';

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex items-center justify-center px-8 transition-all h-full text-[13px] font-black uppercase tracking-widest ${
                    isActive 
                      ? 'bg-ecbRed text-white z-20' 
                      : 'bg-white text-gray-500 hover:text-ecbNavy z-10'
                  }`}
                  style={{
                    clipPath: idx === 0 
                      ? 'polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%)' 
                      : 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',
                    marginLeft: idx === 0 ? '0' : '-20px',
                    paddingLeft: idx === 0 ? '2rem' : '3rem',
                    paddingRight: '3rem'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1800px] mx-auto w-full py-8 px-6 md:py-12 relative z-10">
        {children}
      </main>

      <footer className="bg-ecbNavy text-white pt-16 pb-12 mt-auto relative z-10">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/10 pb-12 mb-8 gap-8">
            <div className="flex items-center space-x-6">
              <Logo className="h-20 w-auto" inverted />
              <div className="border-l border-white/20 pl-6">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Kalpataru Cricket Bash 2026</h3>
                <p className="text-ecbCyan text-xs font-black uppercase tracking-[0.4em] mt-1">KCB Official Auction Portal</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-white/20 text-[9px] uppercase tracking-[0.5em] font-black">
            <p>&copy; 2026 KALPATARU CRICKET BASH (KCB). ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
