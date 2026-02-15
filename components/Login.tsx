import React, { useState } from 'react';
import { Logo } from './Logo';

interface LoginProps {
  onLogin: (role: 'admin' | 'user') => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [error, setError] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'KCB@123') {
      onLogin('admin');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-ecbRed"></div>
      
      <div className="w-full max-w-2xl px-6 flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <Logo className="h-32 w-auto" />
          <div className="mt-4 text-center">
            <h1 className="text-ecbNavy font-black text-2xl md:text-3xl leading-none uppercase italic tracking-tighter">
              Kalpataru Cricket Bash 2026
            </h1>
            <p className="text-ecbRed font-black text-[10px] uppercase tracking-[0.3em] mt-1">
              Official Auction Portal
            </p>
          </div>
        </div>

        {!showAdminPanel ? (
          <div className="w-full flex flex-row gap-4 items-stretch mt-12">
            <div className="flex-1 relative group cursor-pointer" onClick={() => setShowAdminPanel(true)}>
              <div 
                className="w-full h-24 bg-ecbNavy text-white flex flex-col items-center justify-center p-4 transition-all active:scale-[0.98] group-hover:bg-ecbRed"
                style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}
              >
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-xl font-black uppercase tracking-tighter leading-none italic text-center">Admin Login</span>
              </div>
            </div>

            <div className="flex-1 relative group cursor-pointer" onClick={() => onLogin('user')}>
              <div 
                className="w-full h-24 bg-ecbNavy text-white flex flex-col items-center justify-center p-4 transition-all active:scale-[0.98] group-hover:bg-ecbRed"
                style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}
              >
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xl font-black uppercase tracking-tighter leading-none italic text-center">User Login</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300 mt-12">
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 text-center block">Validation Key</label>
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-6 py-5 bg-gray-50 border-2 ${error ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-100 focus:border-ecbNavy'} rounded-2xl outline-none font-black transition-all text-center text-2xl tracking-[0.5em]`}
                />
              </div>
              <div className="flex flex-col gap-3">
                <button type="submit" className="w-full bg-ecbNavy text-white font-black py-5 rounded-2xl uppercase text-[12px] tracking-widest shadow-xl transition-all active:scale-95">Verify Access</button>
                <button type="button" onClick={() => setShowAdminPanel(false)} className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Return to Selection</button>
              </div>
            </form>
          </div>
        )}
        <div className="mt-24 text-center">
          <p className="text-[10px] font-black text-gray-200 uppercase tracking-[0.6em]">Powered by Kalpataru Cricket Bash</p>
        </div>
      </div>
    </div>
  );
};
