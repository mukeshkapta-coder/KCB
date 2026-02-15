
import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Player, Franchise } from '../types';

interface AuctionRoomProps {
  franchises: Franchise[];
  players: Player[];
  onBid: (teamId: string, amount: number) => void;
  onSold: (playerId: string, teamId: string, amount: number) => void;
  onSkip: (playerId: string) => void;
  onError?: (message: string) => void;
  role: 'admin' | 'user';
}

const CATEGORY_LIMITS: Record<string, number> = { 'A+': 2, 'A': 3, 'B': 2, 'C': 4 };
const CATEGORY_BASE_PRICES: Record<string, number> = { 'A+': 5.00, 'A': 3.00, 'B': 2.00, 'C': 1.00 };

const getClassification = (category: string) => {
  const map: Record<string, { label: string, color: string }> = {
    'A+': { label: 'PLATINUM', color: 'bg-indigo-600' },
    'A': { label: 'GOLD', color: 'bg-amber-500' },
    'B': { label: 'SILVER', color: 'bg-slate-400' },
    'C': { label: 'BRONZE', color: 'bg-orange-700' }
  };
  return map[category] || { label: 'Standard', color: 'bg-gray-400' };
};

const CATEGORY_ORDER: Record<string, number> = { 'A+': 1, 'A': 2, 'B': 3, 'C': 4 };

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const colors = { 
    'A+': 'bg-amber-500', 
    'A': 'bg-ecbCyan', 
    'B': 'bg-ecbNavy', 
    'C': 'bg-blue-600' 
  };
  return (
    <span className={`${colors[category as keyof typeof colors] || 'bg-gray-400'} text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider`}>
      {category}
    </span>
  );
};

const PlayerInitial: React.FC<{ player: Player; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ player, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-20 h-20 text-2xl',
    lg: 'w-32 h-32 text-4xl',
    // Increased xl from w-64 to w-[480px] for a massive hero display
    xl: 'w-full max-w-[480px] aspect-[4/5] text-8xl'
  };
  const classInfo = getClassification(player.category);
  
  const imageUrl = player.imageUrl || `players/${player.name}.jpg`;

  return (
    <div className={`${sizeClasses[size]} rounded-[2.5rem] border-8 border-white shadow-2xl ${classInfo.color} flex items-center justify-center font-black text-white italic shrink-0 overflow-hidden bg-gray-100 relative group`}>
      {!imgError ? (
        <img 
          src={imageUrl} 
          alt={player.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full opacity-20">
          {player.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
      <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2rem] pointer-events-none"></div>
    </div>
  );
};

type RegistrySortKey = 'name' | 'category' | 'skill' | 'basePrice';

export const AuctionRoom = forwardRef<{ startRandom: () => void }, AuctionRoomProps>(({ 
  franchises, 
  players, 
  onBid, 
  onSold, 
  onError,
  role
}, ref) => {
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [lastBidder, setLastBidder] = useState<string | null>(null);
  const [finalPriceInput, setFinalPriceInput] = useState<string>("");
  const [animateBid, setAnimateBid] = useState(false);
  
  const [registrySort, setRegistrySort] = useState<{ key: RegistrySortKey; order: 'asc' | 'desc' }>({
    key: 'name', order: 'asc'
  });

  const categoryStats = useMemo(() => {
    const stats: Record<string, { unsold: number, totalSoldPrice: number, soldCount: number }> = {
      'A+': { unsold: 0, totalSoldPrice: 0, soldCount: 0 },
      'A': { unsold: 0, totalSoldPrice: 0, soldCount: 0 },
      'B': { unsold: 0, totalSoldPrice: 0, soldCount: 0 },
      'C': { unsold: 0, totalSoldPrice: 0, soldCount: 0 },
    };

    players.forEach(p => {
      if (stats[p.category]) {
        if (!p.isSold) {
          stats[p.category].unsold++;
        } else if (p.soldPrice !== undefined) {
          stats[p.category].totalSoldPrice += p.soldPrice;
          stats[p.category].soldCount++;
        }
      }
    });

    return stats;
  }, [players]);

  const MARQUEE_ORDER = [
    'Yash', 'Raj', 'Rishi', 'Amit S', 'Amey', 
    'Kalp', 'Dipesh', 'Khush', 'Jigar shah', 'Viral Dodia'
  ];

  const availablePlayers = useMemo(() => {
    return [...players]
      .filter(p => !p.isSold)
      .sort((a, b) => {
        let aVal: any;
        let bVal: any;

        if (registrySort.key === 'category') {
          aVal = CATEGORY_ORDER[a.category] || 99;
          bVal = CATEGORY_ORDER[b.category] || 99;
        } else {
          aVal = a[registrySort.key];
          bVal = b[registrySort.key];
        }

        if (typeof aVal === 'string') { 
          aVal = aVal.toLowerCase(); 
          bVal = bVal.toLowerCase(); 
        }

        if (aVal < bVal) return registrySort.order === 'asc' ? -1 : 1;
        if (aVal > bVal) return registrySort.order === 'asc' ? 1 : -1;
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
  }, [players, registrySort]);

  const isAdmin = role === 'admin';

  const handleSort = (key: RegistrySortKey) => {
    setRegistrySort(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ col }: { col: RegistrySortKey }) => {
    if (registrySort.key !== col) return <span className="ml-1 opacity-20 text-[8px]">⇅</span>;
    return <span className="ml-1 text-ecbRed text-[8px]">{registrySort.order === 'asc' ? '▲' : '▼'}</span>;
  };

  const calculateMaxSpendable = (teamId: string, currentCategory: string) => {
    const team = franchises.find(f => f.id === teamId);
    if (!team) return 0;

    const roster = players.filter(p => p.teamId === teamId);
    let totalReservedCost = 0;
    
    Object.entries(CATEGORY_LIMITS).forEach(([cat, limit]) => {
      const owned = roster.filter(p => p.category === cat).length;
      let remainingSlots = limit - owned;
      if (cat === currentCategory && remainingSlots > 0) {
        remainingSlots -= 1;
      }
      if (remainingSlots > 0) {
        totalReservedCost += remainingSlots * CATEGORY_BASE_PRICES[cat];
      }
    });

    return team.budget - totalReservedCost;
  };

  const drawNextTalent = () => {
    if (!isAdmin) return;
    const unsoldPlayers = players.filter(p => !p.isSold);
    if (unsoldPlayers.length === 0) return;

    for (const name of MARQUEE_ORDER) {
      const marqueePlayer = unsoldPlayers.find(p => p.name.toLowerCase() === name.toLowerCase());
      if (marqueePlayer) {
        handleStartAuction(marqueePlayer);
        return;
      }
    }

    const randomPlayer = unsoldPlayers[Math.floor(Math.random() * unsoldPlayers.length)];
    handleStartAuction(randomPlayer);
  };

  useImperativeHandle(ref, () => ({ startRandom: drawNextTalent }));

  const handleStartAuction = (player: Player) => {
    if (!isAdmin) return;
    setActivePlayer(player);
    setCurrentBid(player.basePrice);
    setLastBidder(null);
    setFinalPriceInput(player.basePrice.toFixed(2));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const placeBid = (teamId: string) => {
    if (!isAdmin || !activePlayer || lastBidder === teamId) return;
    
    const team = franchises.find(f => f.id === teamId);
    if (!team) return;

    const ownedInCategory = players.filter(p => p.teamId === teamId && p.category === activePlayer.category).length;
    if (ownedInCategory >= CATEGORY_LIMITS[activePlayer.category]) {
      onError?.(`${team.name} has already reached the limit for Category ${activePlayer.category}.`);
      return;
    }

    const increment = CATEGORY_BASE_PRICES[activePlayer.category] * 0.1;
    const nextBid = lastBidder ? currentBid + increment : activePlayer.basePrice;
    const maxSpendable = calculateMaxSpendable(teamId, activePlayer.category);
    
    if (nextBid <= maxSpendable) {
      setCurrentBid(nextBid);
      setFinalPriceInput(nextBid.toFixed(2));
      setLastBidder(teamId);
      onBid(teamId, nextBid);
      setAnimateBid(true);
      setTimeout(() => setAnimateBid(false), 300);
    } else {
      onError?.(`${team.name} must reserve ${ (team.budget - maxSpendable).toFixed(2) }L for other required players.`);
    }
  };

  const finalizeSale = () => {
    if (!isAdmin || !activePlayer || !lastBidder) return;
    
    const saleAmount = parseFloat(finalPriceInput);
    if (isNaN(saleAmount)) {
      onError?.("Please enter a valid numeric value for the final price.");
      return;
    }

    if (saleAmount < activePlayer.basePrice) {
      onError?.(`Final price cannot be lower than the player's Base Price of ${activePlayer.basePrice.toFixed(2)}L.`);
      return;
    }

    const requiredIncrement = CATEGORY_BASE_PRICES[activePlayer.category] * 0.1;
    const amountCents = Math.round(saleAmount * 100);
    const baseCents = Math.round(activePlayer.basePrice * 100);
    const incrementCents = Math.round(requiredIncrement * 100);
    
    if ((amountCents - baseCents) % incrementCents !== 0) {
      onError?.(`Final price for Category ${activePlayer.category} must follow the ${requiredIncrement.toFixed(2)}L bidding increment logic.`);
      return;
    }

    const maxSpendable = calculateMaxSpendable(lastBidder, activePlayer.category);
    if (saleAmount > maxSpendable) {
      const team = franchises.find(f => f.id === lastBidder);
      onError?.(`${team?.name} only has ${maxSpendable.toFixed(2)}L available for this slot.`);
      return;
    }

    onSold(activePlayer.id, lastBidder, saleAmount);
    setActivePlayer(null);
  };

  const currentCategoryIncrement = activePlayer ? CATEGORY_BASE_PRICES[activePlayer.category] * 0.1 : 0.1;

  return (
    <div className="flex flex-col space-y-12">
      <section>
        {activePlayer ? (
          <div className="bg-white rounded-[3.5rem] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.18)] border border-gray-100 p-12 lg:p-16 relative overflow-hidden animate-in zoom-in duration-500">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-ecbCyan/5 rounded-full -mr-[250px] -mt-[250px] blur-[120px] pointer-events-none"></div>
            
            <div className="flex flex-col items-center mb-16">
              <div className="inline-block bg-ecbRed text-white px-8 py-3 rounded-full text-[12px] font-black uppercase tracking-[0.3em] mb-12 shadow-2xl shadow-ecbRed/30">
                {isAdmin ? 'Auction Command Center' : 'Live Global Feed'}
              </div>
              
              <div className="flex flex-col xl:flex-row items-center gap-16 w-full justify-center">
                {/* Hero Pic Display Area */}
                <div className="relative w-full max-w-[480px]">
                  <div className="absolute inset-0 bg-ecbCyan/30 blur-[100px] rounded-full scale-125 animate-pulse"></div>
                  <PlayerInitial player={activePlayer} size="xl" />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-10 py-4 rounded-3xl shadow-2xl border border-gray-100 z-20">
                     <span className={`${getClassification(activePlayer.category).color} text-white text-[12px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg`}>
                        {getClassification(activePlayer.category).label} CATEGORY
                     </span>
                  </div>
                </div>
                
                <div className="text-center xl:text-left flex-1 max-w-2xl">
                  <div className="flex items-center justify-center xl:justify-start gap-6 mb-6">
                     <CategoryBadge category={activePlayer.category} />
                     <div className="h-1 w-12 bg-gray-200 rounded-full"></div>
                     <span className="text-gray-400 font-black uppercase text-sm tracking-[0.2em] italic">{activePlayer.skill}</span>
                  </div>
                  <h2 className="text-8xl lg:text-[110px] font-black text-ecbNavy mb-10 tracking-tighter italic uppercase leading-none drop-shadow-xl">{activePlayer.name}</h2>
                  
                  <div className="grid grid-cols-2 gap-8 mt-12">
                    <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 flex flex-col justify-center shadow-inner">
                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">Base Valuation</h4>
                      <div className="text-6xl font-black text-ecbNavy italic mb-4">{activePlayer.basePrice.toFixed(2)}L</div>
                      <div className="flex items-center gap-2 bg-white/60 self-start px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-ecbCyan animate-pulse"></div>
                        <p className="text-[11px] font-black text-ecbNavy uppercase tracking-widest">Steps: {currentCategoryIncrement.toFixed(2)}L</p>
                      </div>
                    </div>

                    <div className="bg-ecbNavy rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center shadow-[0_35px_60px_-15px_rgba(11,26,50,0.4)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-ecbDeepNavy to-ecbNavy pointer-events-none"></div>
                        <div className="relative z-10 w-full">
                          <p className="text-white/30 text-[11px] font-black uppercase tracking-[0.5em] mb-8">Current Bid</p>
                          <div className={`flex items-center justify-center gap-3 transition-all duration-300 ${animateBid ? 'scale-125 text-ecbCyan drop-shadow-[0_0_20px_rgba(0,164,228,0.5)]' : ''}`}>
                            <input 
                              type="number" 
                              step={currentCategoryIncrement}
                              value={finalPriceInput} 
                              readOnly={!isAdmin} 
                              onChange={(e) => isAdmin && setFinalPriceInput(e.target.value)} 
                              className="bg-transparent text-[100px] font-black text-white tracking-tighter w-full outline-none text-center cursor-default" 
                            />
                            <span className="text-5xl text-white/50 font-black italic">L</span>
                          </div>
                          <div className="w-full pt-10 border-t border-white/10 mt-10">
                            {lastBidder ? (
                              <div className="flex flex-col items-center">
                                <span className="text-ecbCyan text-[10px] font-black uppercase tracking-[0.3em] mb-2">High Bidder</span>
                                <div className="text-3xl font-black text-white italic uppercase tracking-tighter">{franchises.find(f => f.id === lastBidder)?.name}</div>
                              </div>
                            ) : (
                              <span className="text-white/10 font-black uppercase text-sm animate-pulse tracking-[0.4em]">Ready to Launch</span>
                            )}
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isAdmin && (
              <>
                <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                  {franchises.map(team => {
                    const maxSpendable = calculateMaxSpendable(team.id, activePlayer.category);
                    const increment = CATEGORY_BASE_PRICES[activePlayer.category] * 0.1;
                    const nextMinBid = lastBidder ? currentBid + increment : activePlayer.basePrice;
                    const isFull = players.filter(p => p.teamId === team.id && p.category === activePlayer.category).length >= CATEGORY_LIMITS[activePlayer.category];
                    const canAfford = nextMinBid <= maxSpendable;

                    return (
                      <button 
                        key={team.id} 
                        onClick={() => placeBid(team.id)} 
                        disabled={lastBidder === team.id || !canAfford || isFull} 
                        className={`group relative p-8 rounded-[2rem] border-2 transition-all ${lastBidder === team.id ? 'border-ecbRed bg-ecbRed/5 ring-4 ring-ecbRed/10' : isFull ? 'bg-gray-50 border-gray-100 opacity-30 grayscale cursor-not-allowed' : 'bg-white border-gray-100 hover:border-ecbNavy hover:shadow-2xl hover:-translate-y-1'} disabled:opacity-40`}
                      >
                        <div className="absolute top-0 left-0 w-full h-2 rounded-t-[2rem]" style={{ backgroundColor: isFull ? '#d1d5db' : team.color }}></div>
                        <span className="text-[11px] font-black text-gray-400 uppercase mb-3 block truncate tracking-widest">{team.name}</span>
                        <div className="text-2xl font-black text-ecbNavy mb-2 italic">{team.budget.toFixed(2)}L</div>
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Cap: {maxSpendable.toFixed(2)}L</div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-16 pt-16 border-t border-gray-100 flex gap-8">
                    <button onClick={finalizeSale} disabled={!lastBidder} className="flex-[2] bg-ecbRed hover:bg-ecbNavy disabled:bg-gray-100 rounded-[2.5rem] font-black text-4xl text-white py-10 uppercase transition-all shadow-2xl hover:-translate-y-2 active:translate-y-0 active:shadow-lg">SOLD</button>
                    <button onClick={() => setActivePlayer(null)} className="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-100 rounded-[2.5rem] font-black text-gray-400 py-10 uppercase transition-all tracking-[0.3em]">Skip Player</button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white border-4 border-dashed border-gray-100 rounded-[4rem] py-48 px-10 text-center flex flex-col items-center shadow-inner">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-10 shadow-sm border border-gray-100">
               <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h3 className="text-5xl font-black text-ecbNavy mb-6 uppercase italic tracking-tighter">{isAdmin ? 'Select Next Talent' : 'Broadcast Standing By'}</h3>
            <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[12px] mb-16 max-w-lg mx-auto leading-relaxed">Prepare the bidding paddle. The next athlete in the pool is ready for evaluation.</p>
            {isAdmin ? (
              <button onClick={drawNextTalent} className="px-24 py-8 bg-ecbNavy hover:bg-ecbRed text-white font-black uppercase rounded-3xl transition-all shadow-[0_25px_50px_-12px_rgba(11,26,50,0.5)] hover:scale-110 active:scale-95 tracking-[0.3em]">Draw Next Player</button>
            ) : (
              <div className="flex items-center gap-4 bg-gray-50 px-10 py-5 rounded-3xl border border-gray-100">
                 <div className="w-3 h-3 rounded-full bg-ecbRed animate-ping"></div>
                 <span className="text-ecbRed font-black uppercase tracking-[0.5em] text-[12px]">Awaiting Admin Action...</span>
              </div>
            )}
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-gray-100 pb-12 mb-12 gap-10">
            <div className="flex flex-col gap-6">
              <h2 className="text-6xl font-black text-ecbNavy tracking-tighter uppercase italic">Player Registry Pool</h2>
              <div className="flex flex-wrap gap-4">
                 {Object.entries(categoryStats).map(([cat, stat]) => {
                   const currentStat = stat as { unsold: number, totalSoldPrice: number, soldCount: number };
                   const avg = currentStat.soldCount > 0 ? (currentStat.totalSoldPrice / currentStat.soldCount).toFixed(2) : "0.00";
                   return (
                     <div key={cat} className="flex items-center gap-4 bg-white border-2 border-gray-50 px-6 py-4 rounded-[1.5rem] shadow-sm">
                        <CategoryBadge category={cat} />
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Avg Valuation</span>
                           <span className="text-[18px] font-black text-ecbNavy italic">{avg}L</span>
                        </div>
                     </div>
                   );
                 })}
              </div>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[12px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">REMAINING TALENT</span>
               <span className="text-5xl font-black text-ecbNavy italic tracking-tighter">{availablePlayers.length} ATHLETES</span>
            </div>
        </div>

        <div className="bg-white rounded-[3.5rem] border-2 border-gray-50 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto max-w-full custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-[11px] font-black uppercase text-gray-400 border-b-2 border-gray-100 tracking-[0.3em] select-none">
                <tr>
                  <th className="px-10 py-10 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>Player <SortIcon col="name" /></th>
                  <th className="px-10 py-10 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('category')}>Tier <SortIcon col="category" /></th>
                  <th className="px-10 py-10 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('skill')}>Role <SortIcon col="skill" /></th>
                  <th className="px-10 py-10 text-right cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('basePrice')}>Base (L) <SortIcon col="basePrice" /></th>
                  {isAdmin && <th className="px-10 py-10 text-center">Status</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {availablePlayers.map(p => {
                  const classInfo = getClassification(p.category);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-all group cursor-pointer" onClick={() => isAdmin && handleStartAuction(p)}>
                      <td className="px-10 py-8 flex items-center gap-8">
                         <PlayerInitial player={p} size="sm" />
                         <span className="font-black text-2xl text-ecbNavy group-hover:text-ecbRed transition-colors italic uppercase tracking-tighter">{p.name}</span>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`${classInfo.color} text-white text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-sm`}>
                          {classInfo.label}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-[13px] font-bold text-gray-500 uppercase tracking-widest italic">{p.skill}</span>
                      </td>
                      <td className="px-10 py-8 text-right font-black text-3xl text-ecbNavy italic">{p.basePrice.toFixed(2)}L</td>
                      {isAdmin && (
                        <td className="px-10 py-8 text-center">
                          <span className="bg-ecbNavy/5 text-ecbNavy text-[10px] font-black px-5 py-2.5 rounded-xl uppercase tracking-widest group-hover:bg-ecbRed group-hover:text-white transition-all shadow-sm">Select for Bidding</span>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
});
