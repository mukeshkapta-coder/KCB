
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Layout } from './components/Layout';
import { AuctionRoom } from './components/AuctionRoom';
import { ScoringRules } from './components/ScoringRules';
import { LuckDraw } from './components/LuckDraw';
import { Login } from './components/Login';
import { SportIcon } from './components/SportIcon';
import { INITIAL_PLAYERS, FRANCHISES as INITIAL_FRANCHISES, INITIAL_BUDGET } from './constants';
import { Player, Franchise } from './types';

type SortKey = 'name' | 'category' | 'skill' | 'valuation';
type SortOrder = 'asc' | 'desc';

const CATEGORY_LIMITS: Record<string, number> = { 'A+': 2, 'A': 3, 'B': 2, 'C': 4 };
const CATEGORY_BASE_PRICES: Record<string, number> = { 'A+': 5.00, 'A': 3.00, 'B': 2.00, 'C': 1.00 };
const RETENTION_PRICES: Record<string, number> = { 'A+': 20.00, 'A': 13.00, 'B': 8.00, 'C': 3.50 };
const CATEGORY_ORDER: Record<string, number> = { 'A+': 1, 'A': 2, 'B': 3, 'C': 4 };

const getClassification = (category: string) => {
  const map: Record<string, { label: string, color: string }> = {
    'A+': { label: 'PLATINUM', color: 'bg-indigo-600' },
    'A': { label: 'GOLD', color: 'bg-amber-500' },
    'B': { label: 'SILVER', color: 'bg-slate-400' },
    'C': { label: 'BRONZE', color: 'bg-orange-700' }
  };
  return map[category] || { label: 'Standard', color: 'bg-gray-400' };
};

const ErrorPopup: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ecbNavy/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full border border-red-100 animate-in zoom-in duration-300 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-xl font-black text-ecbNavy uppercase tracking-tighter mb-2 italic">League Alert</h3>
      <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed px-4">{message}</p>
      <button onClick={onClose} className="w-full bg-ecbNavy hover:bg-black text-white font-black py-4 rounded-xl uppercase text-[10px] tracking-[0.2em] transition-all">Dismiss</button>
    </div>
  </div>
);

const ConfirmModal: React.FC<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; onClose: () => void; confirmText?: string; variant?: 'danger' | 'info'; }> = ({ isOpen, title, message, onConfirm, onClose, confirmText = "Confirm", variant = 'info' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-ecbNavy/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full border border-gray-100 animate-in zoom-in duration-300">
        <h3 className="text-2xl font-black text-ecbNavy text-center uppercase tracking-tighter mb-4 italic leading-tight">{title}</h3>
        <p className="text-gray-400 text-center text-sm font-medium mb-10 leading-relaxed px-4">{message}</p>
        <div className="flex flex-col space-y-4">
          <button onClick={onConfirm} className={`w-full ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-ecbCyan hover:bg-ecbNavy'} text-white font-black py-5 rounded-2xl uppercase text-[12px] tracking-widest shadow-xl transition-all active:scale-95`}>{confirmText}</button>
          <button onClick={onClose} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-400 font-black py-5 rounded-2xl uppercase text-[12px] tracking-widest transition-all">Cancel</button>
        </div>
      </div>
    </div>
  );
};

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const colors = { 
    'A+': 'bg-amber-500 text-white', 
    'A': 'bg-ecbCyan text-white', 
    'B': 'bg-ecbNavy text-white', 
    'C': 'bg-blue-600 text-white' 
  };
  return <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${colors[category as keyof typeof colors] || 'bg-gray-400 text-white'}`}>{category}</span>;
};

const PlayerInitial: React.FC<{ player: Player; size?: 'xs' | 'sm' | 'md' }> = ({ player, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = {
    xs: 'w-8 h-8 text-[8px]',
    sm: 'w-10 h-10 text-[10px]',
    md: 'w-12 h-12 text-sm'
  };
  const classInfo = getClassification(player.category);
  const imageUrl = player.imageUrl || `players/${player.name}.jpg`;

  return (
    <div className={`${sizeClasses[size]} rounded-full border-2 border-white shadow-sm ${classInfo.color} flex items-center justify-center font-black text-white italic shrink-0 overflow-hidden bg-gray-200`}>
      {!imgError ? (
        <img 
          src={imageUrl} 
          alt={player.name} 
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        player.name.charAt(0).toUpperCase()
      )}
    </div>
  );
};

export default function App() {
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(() => sessionStorage.getItem('kcb_v4_role') as any);
  const [activeTab, setActiveTab] = useState<'auction' | 'retention' | 'dashboard' | 'players' | 'rules'>(() => {
    const role = sessionStorage.getItem('kcb_v4_role');
    return role === 'user' ? 'dashboard' : 'auction';
  });

  const initializeAuctionData = () => {
    let players = [...INITIAL_PLAYERS];
    let franchises = [...INITIAL_FRANCHISES];
    
    // Auto-assign owners as retained players at 2.5x base price
    franchises = franchises.map(f => {
      const ownerPlayerIndex = players.findIndex(p => p.name.toLowerCase() === f.name.toLowerCase());
      if (ownerPlayerIndex !== -1) {
        const ownerPlayer = players[ownerPlayerIndex];
        const soldPrice = ownerPlayer.basePrice * 2.5;
        players[ownerPlayerIndex] = { ...ownerPlayer, isSold: true, teamId: f.id, soldPrice: soldPrice };
        return { ...f, budget: f.budget - soldPrice };
      }
      return f;
    });
    return { players, franchises };
  };

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('kcb_v4_players');
    if (saved) return JSON.parse(saved);
    const initial = initializeAuctionData();
    return initial.players;
  });

  const [franchises, setFranchises] = useState<Franchise[]>(() => {
    const saved = localStorage.getItem('kcb_v4_franchises');
    if (saved) return JSON.parse(saved);
    const initial = initializeAuctionData();
    return initial.franchises;
  });
  
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({ key: 'name', order: 'asc' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [editingPlayerValuation, setEditingPlayerValuation] = useState<{ playerId: string, newPrice: string } | null>(null);
  const [releasingPlayerId, setReleasingPlayerId] = useState<string | null>(null);
  
  useEffect(() => {
    localStorage.setItem('kcb_v4_players', JSON.stringify(players));
    localStorage.setItem('kcb_v4_franchises', JSON.stringify(franchises));
  }, [players, franchises]);

  const franchisesWithCalculatedStats = useMemo(() => {
    return franchises.map(f => {
      const roster = players.filter(p => p.teamId === f.id);
      const squadStats: Record<string, { owned: number, limit: number }> = {};
      const statusDetails: string[] = [];

      Object.entries(CATEGORY_LIMITS).forEach(([cat, limit]) => {
        const owned = roster.filter(p => p.category === cat).length;
        squadStats[cat] = { owned, limit };
        statusDetails.push(`${cat}: ${owned}/${limit}`);
      });

      const totalRequired = Object.values(CATEGORY_LIMITS).reduce((a, b) => a + b, 0);
      const currentCount = roster.length;
      const isQualified = Object.entries(squadStats).every(([cat, s]) => s.owned >= s.limit);
      
      return { 
        ...f, 
        roster, 
        isQualified, 
        squadStats,
        statusString: statusDetails.join(' | '),
        needsCount: totalRequired - currentCount
      };
    });
  }, [players, franchises]);

  const processedPlayersList = useMemo(() => {
    return [...players].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortConfig.key === 'valuation') {
        aVal = a.isSold ? a.soldPrice : a.basePrice;
        bVal = b.isSold ? b.soldPrice : b.basePrice;
      } else if (sortConfig.key === 'category') {
        aVal = CATEGORY_ORDER[a.category] || 99;
        bVal = CATEGORY_ORDER[b.category] || 99;
      } else {
        aVal = a[sortConfig.key as keyof Player];
        bVal = b[sortConfig.key as keyof Player];
      }

      if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
      if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [players, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortConfig.key !== col) return <span className="ml-1 opacity-20 text-[8px]">⇅</span>;
    return <span className="ml-1 text-ecbRed text-[8px]">{sortConfig.order === 'asc' ? '▲' : '▼'}</span>;
  };

  const handleLuckDrawWinner = (playerId: string, franchiseId: string) => {
    const player = players.find(p => p.id === playerId);
    const franchise = franchises.find(f => f.id === franchiseId);
    if (!player || !franchise) return;

    const price = RETENTION_PRICES[player.category] || player.basePrice;
    if (franchise.budget < price) {
      setErrorMessage(`${franchise.name} has insufficient budget for this retention.`);
      return;
    }

    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isSold: true, teamId: franchiseId, soldPrice: price } : p));
    setFranchises(prev => prev.map(f => f.id === franchiseId ? { ...f, budget: f.budget - price } : f));
  };

  const handleImageUpload = (playerId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, imageUrl: base64String } : p));
    };
    reader.readAsDataURL(file);
  };

  const downloadExcel = () => {
    let csv = "Franchise,Player,Category,Valuation (L)\n";
    franchisesWithCalculatedStats.forEach(f => {
      f.roster.forEach(p => { csv += `"${f.name}","${p.name}","${p.category}","${p.soldPrice?.toFixed(2)}"\n`; });
      csv += `"${f.name}","[REMAINING BUDGET]","-","${f.budget.toFixed(2)}"\n\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `KCB_Portfolios.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateValuation = () => {
    if (!editingPlayerValuation) return;
    const { playerId, newPrice } = editingPlayerValuation;
    const player = players.find(p => p.id === playerId);
    if (!player || !player.teamId) return;
    
    const franchise = franchises.find(f => f.id === player.teamId);
    if (!franchise) return;

    const newAmt = parseFloat(newPrice);
    if (isNaN(newAmt) || newAmt < CATEGORY_BASE_PRICES[player.category]) {
      setErrorMessage(`Valuation must be at least ${CATEGORY_BASE_PRICES[player.category].toFixed(2)}L.`);
      return;
    }

    const oldAmt = player.soldPrice || 0;
    const tempBudget = franchise.budget + oldAmt;
    const roster = players.filter(p => p.teamId === franchise.id);
    
    let totalReservedCost = 0;
    Object.entries(CATEGORY_LIMITS).forEach(([cat, limit]) => {
      const owned = roster.filter(p => p.category === cat).length;
      let remainingSlots = limit - owned;
      if (remainingSlots > 0) totalReservedCost += remainingSlots * CATEGORY_BASE_PRICES[cat];
    });

    if (newAmt > (tempBudget - totalReservedCost)) {
      setErrorMessage(`Update failed. Must reserve ${totalReservedCost.toFixed(2)}L for remaining squad slots.`);
      return;
    }

    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, soldPrice: newAmt } : p));
    setFranchises(prev => prev.map(f => f.id === franchise.id ? { ...f, budget: tempBudget - newAmt } : f));
    setEditingPlayerValuation(null);
  };

  const handleReleasePlayer = () => {
    if (!releasingPlayerId) return;
    const player = players.find(p => p.id === releasingPlayerId);
    if (!player || !player.teamId) return;

    const franchise = franchises.find(f => f.id === player.teamId);
    if (!franchise) return;

    const refundAmount = player.soldPrice || 0;

    setPlayers(prev => prev.map(p => p.id === releasingPlayerId ? { ...p, isSold: false, teamId: undefined, soldPrice: undefined } : p));
    setFranchises(prev => prev.map(f => f.id === franchise.id ? { ...f, budget: f.budget + refundAmount } : f));
    setReleasingPlayerId(null);
  };

  const handleMovePlayer = (playerId: string, toFranchiseId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player || player.teamId === toFranchiseId) return;

    const toFranchise = franchises.find(f => f.id === toFranchiseId);
    const fromFranchise = franchises.find(f => f.id === player.teamId);
    if (!toFranchise) return;

    // RULE 1: Owners cannot be moved from their franchise
    if (player.name.toLowerCase() === fromFranchise?.name.toLowerCase()) {
       setErrorMessage(`Owners like ${player.name} cannot be moved from their home franchise.`);
       return;
    }

    // RULE 2: Target team must have category slots available
    if (players.filter(p => p.teamId === toFranchiseId && p.category === player.category).length >= CATEGORY_LIMITS[player.category]) {
        setErrorMessage(`${toFranchise.name} has already reached the limit for Category ${player.category}.`);
        return;
    }

    const valuation = player.soldPrice || 0;
    if (toFranchise.budget < valuation) {
      setErrorMessage(`${toFranchise.name} has insufficient budget.`);
      return;
    }

    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, teamId: toFranchiseId } : p));
    setFranchises(prev => prev.map(f => {
      if (f.id === toFranchiseId) return { ...f, budget: f.budget - valuation };
      if (f.id === player.teamId) return { ...f, budget: f.budget + valuation };
      return f;
    }));
  };

  const handleLogin = (role: 'admin' | 'user') => { 
    setUserRole(role); 
    sessionStorage.setItem('kcb_v4_role', role); 
    setActiveTab(role === 'user' ? 'dashboard' : 'auction');
  };

  const resetData = () => {
    const initial = initializeAuctionData();
    setPlayers(initial.players);
    setFranchises(initial.franchises);
    localStorage.removeItem('kcb_v4_players');
    localStorage.removeItem('kcb_v4_franchises');
    setIsResetModalOpen(false);
  };

  if (!userRole) return <Login onLogin={handleLogin} />;

  return (
    <Layout activeTab={activeTab as any} setActiveTab={setActiveTab as any} onSync={() => {}} onReset={() => setIsResetModalOpen(true)} onLogout={() => { setUserRole(null); sessionStorage.removeItem('kcb_v4_role'); }} isSyncing={false} role={userRole}>
      {errorMessage && <ErrorPopup message={errorMessage} onClose={() => setErrorMessage(null)} />}
      <ConfirmModal isOpen={isResetModalOpen} title="Reset Auction?" message="This will clear all squads and budgets and re-initialize owners." onConfirm={resetData} onClose={() => setIsResetModalOpen(false)} confirmText="Reset" variant="danger" />
      
      <ConfirmModal 
        isOpen={!!releasingPlayerId} 
        title="Release Player?" 
        message={`Are you sure you want to release ${players.find(p => p.id === releasingPlayerId)?.name} back into the Auction Pool? The franchise will be refunded their valuation.`} 
        onConfirm={handleReleasePlayer} 
        onClose={() => setReleasingPlayerId(null)} 
        confirmText="Release to Pool" 
        variant="danger" 
      />

      {editingPlayerValuation && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-ecbNavy/80 backdrop-blur-md">
           <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full border border-gray-100">
              <h3 className="text-2xl font-black text-ecbNavy text-center uppercase tracking-tighter mb-4 italic leading-tight">Edit Valuation</h3>
              <p className="text-gray-400 text-center text-xs font-medium mb-8 uppercase tracking-widest">Update price for {players.find(p => p.id === editingPlayerValuation.playerId)?.name}</p>
              <div className="space-y-6">
                 <div className="relative">
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300">L</span>
                    <input 
                      type="number" 
                      step="0.01"
                      autoFocus
                      className="w-full pr-12 pl-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-ecbNavy font-black text-2xl"
                      value={editingPlayerValuation.newPrice}
                      onChange={(e) => setEditingPlayerValuation(prev => prev ? { ...prev, newPrice: e.target.value } : null)}
                    />
                 </div>
                 <div className="flex gap-4">
                    <button onClick={handleUpdateValuation} className="flex-1 bg-ecbCyan text-white font-black py-5 rounded-2xl uppercase text-[12px] tracking-widest shadow-xl transition-all active:scale-95">Update</button>
                    <button onClick={() => setEditingPlayerValuation(null)} className="flex-1 bg-gray-50 text-gray-400 font-black py-5 rounded-2xl uppercase text-[12px] tracking-widest">Cancel</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'auction' && <AuctionRoom players={players} franchises={franchisesWithCalculatedStats as any} onBid={() => {}} onSold={(pId, tId, amt) => { setPlayers(prev => prev.map(p => p.id === pId ? { ...p, isSold: true, teamId: tId, soldPrice: amt } : p)); setFranchises(prev => prev.map(f => f.id === tId ? { ...f, budget: f.budget - amt } : f)); }} onSkip={() => {}} onError={setErrorMessage} role={userRole} />}
      {activeTab === 'retention' && <LuckDraw players={players} franchises={franchisesWithCalculatedStats as any} onWinner={handleLuckDrawWinner} role={userRole} />}
      {activeTab === 'rules' && <ScoringRules />}
      {activeTab === 'players' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <h2 className="text-4xl font-black text-ecbNavy uppercase italic tracking-tighter border-b border-gray-200 pb-8">Registry</h2>
           <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 tracking-widest select-none">
                  <tr>
                    <th className="px-6 py-6 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>Player <SortIcon col="name" /></th>
                    <th className="px-6 py-6 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('category')}>Cat <SortIcon col="category" /></th>
                    <th className="px-6 py-6 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('category')}>Classification <SortIcon col="category" /></th>
                    <th className="px-6 py-6 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('skill')}>Role <SortIcon col="skill" /></th>
                    <th className="px-6 py-6 text-right cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('valuation')}>Base Price (L) <SortIcon col="valuation" /></th>
                    {userRole === 'admin' && <th className="px-6 py-6 text-center">Admin</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {processedPlayersList.map(p => {
                    const classInfo = getClassification(p.category);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80">
                        <td className="px-6 py-6 flex items-center gap-3">
                           <PlayerInitial player={p} size="sm" />
                           <span className="font-black text-ecbNavy">{p.name}</span>
                        </td>
                        <td className="px-6 py-6"><CategoryBadge category={p.category} /></td>
                        <td className="px-6 py-6">
                           <span className={`${classInfo.color} text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest`}>
                             {classInfo.label}
                           </span>
                        </td>
                        <td className="px-6 py-6">
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{p.skill}</span>
                        </td>
                        <td className="px-6 py-6 text-right font-black text-ecbNavy">{p.isSold ? (p.soldPrice || 0).toFixed(2) : p.basePrice.toFixed(2)}L</td>
                        {userRole === 'admin' && (
                          <td className="px-6 py-6 text-center">
                            <label className="cursor-pointer bg-ecbNavy/5 hover:bg-ecbNavy hover:text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all">
                              Upload Pic
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(p.id, file);
                                }} 
                              />
                            </label>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
           </div>
        </div>
      )}
      {activeTab === 'dashboard' && (
        <div className="space-y-10 pb-20 animate-in fade-in duration-500 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
            <div>
                <h2 className="text-4xl font-black text-ecbNavy uppercase italic tracking-tighter">Franchise Portfolios</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Squad monitoring</p>
            </div>
            <button onClick={downloadExcel} className="bg-ecbNavy hover:bg-black text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 shadow-lg active:scale-95">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Export Excel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12">
             {franchisesWithCalculatedStats.map((f: any) => (
               <div key={f.id} onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('ring-4', 'ring-ecbCyan/30'); }} onDragLeave={(e) => e.currentTarget.classList.remove('ring-4', 'ring-ecbCyan/30')} onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('ring-4', 'ring-ecbCyan/30'); const pId = e.dataTransfer.getData('playerId'); if (pId) handleMovePlayer(pId, f.id); }} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col group transition-all">
                  <div className="p-8 pb-4 bg-white">
                      <div className="flex items-center gap-5 mb-8">
                          <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-md"><SportIcon name={f.icon || 'shield'} color={f.color} className="w-12 h-12" /></div>
                          <div>
                              <h3 className="text-2xl font-black text-ecbNavy uppercase italic tracking-tighter leading-none">{f.name}</h3>
                          </div>
                      </div>
                      <div className={`mb-6 p-5 rounded-3xl text-center border transition-all ${f.isQualified ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-100'}`}>
                         <div className={`text-[11px] font-black uppercase italic tracking-tighter mb-2 ${f.isQualified ? 'text-green-600' : 'text-amber-600'}`}>
                            {f.isQualified ? 'SQUAD QUALIFIED' : `SQUAD NEEDS: ${f.needsCount > 0 ? f.needsCount : 0} PLAYERS`}
                         </div>
                         <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                            {Object.entries(f.squadStats).map(([cat, stats]: [string, any]) => {
                               const isFull = stats.owned >= stats.limit;
                               return (
                                 <div key={cat} className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-bold text-gray-400">{cat}</span>
                                    <span className={`text-[10px] font-black ${isFull ? 'text-green-600' : 'text-ecbNavy'}`}>
                                       {stats.owned}/{stats.limit}
                                    </span>
                                 </div>
                               );
                            })}
                         </div>
                      </div>
                      <div className="space-y-2 mt-4">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest"><span className="text-gray-400">PURSE AVAILABLE</span><span className="text-ecbNavy font-bold text-lg">{f.budget.toFixed(2)}L</span></div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full transition-all duration-1000" style={{ width: `${((INITIAL_BUDGET - f.budget) / INITIAL_BUDGET) * 100}%`, backgroundColor: f.color }}></div></div>
                      </div>
                  </div>
                  <div className="p-8 pt-4 flex-1 flex flex-col"><div className="space-y-4 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar pb-8 px-1">
                      {f.roster.map((p: any) => {
                          const isOwner = p.name.toLowerCase() === f.name.toLowerCase();
                          return (
                            <div key={p.id} draggable={userRole === 'admin' && !isOwner} onDragStart={(e) => { e.dataTransfer.setData('playerId', p.id); e.currentTarget.classList.add('opacity-50'); }} onDragEnd={(e) => e.currentTarget.classList.remove('opacity-50')} className={`rounded-3xl border p-5 flex justify-between items-center bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow min-h-[95px] ${isOwner ? 'cursor-default ring-1 ring-ecbNavy/5 bg-gray-50/30' : 'cursor-grab active:cursor-grabbing'}`}>
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                  <PlayerInitial player={p} size="md" />
                                  <div className="flex flex-col">
                                    <h5 className="text-[20px] font-black text-ecbNavy uppercase italic truncate mb-1 tracking-tight leading-tight">
                                      {p.name}
                                    </h5>
                                    <div className="flex items-center gap-2">
                                      <CategoryBadge category={p.category} />
                                      {isOwner && <span className="text-[8px] not-italic bg-ecbNavy text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-black">OWNER</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="shrink-0 ml-4 flex items-center gap-1">
                                   <div className="text-center px-4 py-2 rounded-2xl border bg-gray-50 border-gray-100">
                                      <span className="text-[8px] font-black uppercase text-gray-400 block mb-1">VALUATION</span>
                                      <span className="text-[16px] font-black text-ecbNavy">{(p.soldPrice || 0).toFixed(2)}L</span>
                                   </div>
                                   {userRole === 'admin' && (
                                     <div className="flex flex-col gap-1">
                                       <button 
                                          onClick={() => setEditingPlayerValuation({ playerId: p.id, newPrice: (p.soldPrice || 0).toString() })}
                                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-ecbCyan transition-all"
                                          title="Edit Price"
                                       >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                       </button>
                                       {!isOwner && (
                                         <button 
                                            onClick={() => setReleasingPlayerId(p.id)}
                                            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                                            title="Release back to pool"
                                         >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                         </button>
                                       )}
                                     </div>
                                   )}
                                </div>
                            </div>
                          );
                      })}
                  </div></div>
               </div>
             ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
