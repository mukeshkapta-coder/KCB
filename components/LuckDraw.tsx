
import React, { useState, useMemo } from 'react';
import { Player, Franchise } from '../types';
import { SportIcon } from './SportIcon';

interface LuckDrawProps {
  players: Player[];
  franchises: Franchise[];
  onWinner: (playerId: string, franchiseId: string) => void;
  role: 'admin' | 'user';
}

const CATEGORY_LIMITS: Record<string, number> = { 'A+': 2, 'A': 3, 'B': 2, 'C': 4 };
const CATEGORY_ORDER: Record<string, number> = { 'A+': 1, 'A': 2, 'B': 3, 'C': 4 };

export const LuckDraw: React.FC<LuckDrawProps> = ({ players, franchises, onWinner, role }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedFranchiseIds, setSelectedFranchiseIds] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState<Franchise | null>(null);

  const availablePlayers = useMemo(() => {
    return [...players]
      .filter(p => !p.isSold && (selectedCategory === 'all' || p.category === selectedCategory))
      .sort((a, b) => {
        const orderA = CATEGORY_ORDER[a.category] || 99;
        const orderB = CATEGORY_ORDER[b.category] || 99;
        
        // Sort by Category Order first
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        
        // Then sort alphabetically within the same category
        return a.name.localeCompare(b.name);
      });
  }, [players, selectedCategory]);

  const selectedPlayer = useMemo(() => {
    return players.find(p => p.id === selectedPlayerId);
  }, [selectedPlayerId, players]);

  /**
   * ELIGIBILITY LOGIC:
   * 1. A franchise must have space in the category (Roster Limit).
   * 2. Rule: "Once a franchise gets a player [via draw] its name will not appear again for same category player lucky draw".
   */
  const eligibleFranchises = useMemo(() => {
    if (!selectedPlayer) return [];
    
    return franchises.filter(f => {
      const roster = players.filter(p => p.teamId === f.id);
      const ownedInCategory = roster.filter(p => p.category === selectedPlayer.category).length;
      
      // Check if they have reached the total limit for this category
      const limit = CATEGORY_LIMITS[selectedPlayer.category] || 0;
      const hasSpace = ownedInCategory < limit;

      // Rule: "Once a franchise gets a player [in this category] its name will not appear again for SAME CATEGORY lucky draw"
      const hasAnyInCategory = ownedInCategory > 0;

      return hasSpace && !hasAnyInCategory;
    });
  }, [franchises, players, selectedPlayer]);

  const handleToggleFranchise = (id: string) => {
    setSelectedFranchiseIds(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedPlayerId('');
    setSelectedFranchiseIds([]);
    setWinner(null);
  };

  const executeDraw = () => {
    if (selectedFranchiseIds.length < 2) return;
    setIsDrawing(true);
    setWinner(null);

    let count = 0;
    const interval = setInterval(() => {
      const tempWinnerId = selectedFranchiseIds[Math.floor(Math.random() * selectedFranchiseIds.length)];
      setWinner(franchises.find(f => f.id === tempWinnerId) || null);
      count++;
      if (count > 25) {
        clearInterval(interval);
        const finalWinnerId = selectedFranchiseIds[Math.floor(Math.random() * selectedFranchiseIds.length)];
        const finalWinner = franchises.find(f => f.id === finalWinnerId)!;
        setWinner(finalWinner);
        setIsDrawing(false);
      }
    }, 80);
  };

  const confirmWinner = () => {
    if (winner && selectedPlayerId) {
      onWinner(selectedPlayerId, winner.id);
      setSelectedPlayerId('');
      setSelectedFranchiseIds([]);
      setWinner(null);
    }
  };

  const categories = ['all', 'A+', 'A', 'B', 'C'];

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="text-center border-b border-gray-200 pb-8">
        <h2 className="text-5xl font-black text-ecbNavy uppercase italic tracking-tighter">Retention Resolution</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Retention Resolution System</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Box 1: Filter by Category */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl flex flex-col h-full">
          <label className="text-[10px] font-black text-ecbRed uppercase tracking-widest mb-6 block underline decoration-ecbRed/20 underline-offset-4">1. Filter by Category</label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 flex items-center justify-center ${
                  selectedCategory === cat 
                    ? 'bg-ecbNavy border-ecbNavy text-white shadow-lg' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                }`}
              >
                {cat === 'all' ? 'All Pools' : `${cat} Pool`}
              </button>
            ))}
          </div>
          <p className="mt-auto pt-6 text-[9px] font-bold text-gray-300 uppercase leading-relaxed">
            Selecting a category will filter the player list below to only show available talent from that specific tier.
          </p>
        </div>

        {/* Box 2: Select Target Player */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl flex flex-col h-full space-y-6">
          <label className="text-[10px] font-black text-ecbRed uppercase tracking-widest mb-0 block underline decoration-ecbRed/20 underline-offset-4">2. Select Target Player</label>
          <div className="flex-1 space-y-6">
            <select 
              value={selectedPlayerId}
              onChange={(e) => { setSelectedPlayerId(e.target.value); setSelectedFranchiseIds([]); setWinner(null); }}
              className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-ecbNavy font-black text-lg transition-all appearance-none cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%230b1a32\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.2em' }}
            >
              <option value="">{availablePlayers.length === 0 ? 'No players available' : 'Choose Player...'}</option>
              {availablePlayers.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
              ))}
            </select>

            {selectedPlayer ? (
              <div className="p-6 bg-ecbNavy rounded-2xl text-white relative overflow-hidden group animate-in zoom-in duration-300 shadow-inner">
                <div className="relative z-10">
                  <div className="text-[10px] font-black text-ecbCyan uppercase tracking-[0.2em] mb-1">Fixed Retention Price</div>
                  <div className="text-4xl font-black italic">{(selectedPlayer.category === 'A+' ? 20.00 : selectedPlayer.category === 'A' ? 13.00 : selectedPlayer.category === 'B' ? 8.00 : 3.50).toFixed(2)}L</div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-ecbCyan animate-pulse"></span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50">{selectedPlayer.skill}</span>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500 pointer-events-none">
                  <SportIcon name="shield" color="white" className="w-24 h-24" />
                </div>
              </div>
            ) : (
              <div className="h-[120px] flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl text-[9px] font-black text-gray-300 uppercase tracking-widest italic text-center px-4">
                Awaiting Player Selection...
              </div>
            )}
          </div>
        </div>

        {/* Box 3: Select Franchises */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl flex flex-col h-full">
          <label className="text-[10px] font-black text-ecbRed uppercase tracking-widest mb-6 block underline decoration-ecbRed/20 underline-offset-4">3. Interested & Eligible Franchises</label>
          {!selectedPlayer ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 font-bold uppercase text-[10px] space-y-4 border-2 border-dashed border-gray-50 rounded-2xl p-8 text-center">
              <svg className="w-10 h-10 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>Please select a player to view eligible teams</span>
            </div>
          ) : eligibleFranchises.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-ecbRed/40 font-bold uppercase text-[10px] space-y-4 border-2 border-dashed border-ecbRed/10 rounded-2xl p-8 text-center">
                <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>All teams have already acquired players in this category or hit the lucky draw limit.</span>
             </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
              {eligibleFranchises.map(f => (
                <button 
                  key={f.id}
                  onClick={() => handleToggleFranchise(f.id)}
                  disabled={isDrawing}
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group relative ${
                    selectedFranchiseIds.includes(f.id) 
                      ? 'border-ecbRed bg-ecbRed/5 scale-[0.98] shadow-inner' 
                      : 'border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  <SportIcon name={f.icon} color={f.color} className={`w-12 h-12 transition-transform ${selectedFranchiseIds.includes(f.id) ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className={`text-[11px] font-black uppercase tracking-tight truncate w-full text-center ${selectedFranchiseIds.includes(f.id) ? 'text-ecbRed' : 'text-ecbNavy'}`}>{f.name}</span>
                  {selectedFranchiseIds.includes(f.id) && (
                    <div className="absolute top-2 right-2 bg-ecbRed rounded-full p-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* The Reveal Area */}
      {selectedFranchiseIds.length >= 2 && role === 'admin' && (
        <div className="bg-ecbNavy rounded-[3rem] p-12 text-center shadow-[0_35px_60px_-15px_rgba(11,26,50,0.3)] relative overflow-hidden group/chamber">
          <div className="absolute inset-0 bg-gradient-to-tr from-ecbDeepNavy to-ecbNavy pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,164,228,0.05),transparent)] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className="text-white/30 font-black uppercase tracking-[0.5em] text-[10px] mb-12">The Randomized Selection Chamber</h3>
            
            <div className="min-h-[240px] flex items-center justify-center mb-12">
              {winner ? (
                <div className={`transition-all duration-300 flex flex-col items-center ${isDrawing ? 'scale-90 opacity-40 blur-sm' : 'animate-in zoom-in duration-500 scale-110'}`}>
                  <div className="w-40 h-40 bg-white rounded-[2.5rem] flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.15)] mb-8 transform -rotate-3 hover:rotate-0 transition-transform">
                     <SportIcon name={winner.icon} color={winner.color} className="w-24 h-24" />
                  </div>
                  <h4 className="text-white text-6xl font-black uppercase italic tracking-tighter drop-shadow-lg">{winner.name}</h4>
                  {!isDrawing && (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-px w-8 bg-ecbCyan"></div>
                      <span className="text-ecbCyan font-black uppercase tracking-[0.3em] text-xs">Winner Secured</span>
                      <div className="h-px w-8 bg-ecbCyan"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-white/5 text-[10rem] font-black select-none">DRAW</div>
              )}
            </div>

            {!isDrawing && !winner && (
              <button 
                onClick={executeDraw}
                className="group/btn relative px-16 py-7 bg-ecbRed text-white font-black uppercase rounded-2xl transition-all shadow-2xl hover:shadow-ecbRed/20 hover:scale-105 active:scale-95 tracking-widest overflow-hidden"
              >
                <span className="relative z-10">Initiate Random Draw</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
              </button>
            )}

            {winner && !isDrawing && (
              <div className="flex flex-col md:flex-row gap-4 justify-center animate-in slide-in-from-bottom-6 duration-500">
                 <button 
                    onClick={confirmWinner}
                    className="px-16 py-7 bg-ecbRed hover:bg-white hover:text-ecbNavy text-white font-black uppercase rounded-2xl transition-all shadow-2xl tracking-widest flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 14.142l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 15.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Confirm Winner
                  </button>
                  <button 
                    onClick={() => setWinner(null)}
                    className="px-12 py-7 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white font-black uppercase rounded-2xl transition-all tracking-widest border border-white/10"
                  >
                    Reset & Re-Draw
                  </button>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedFranchiseIds.length < 2 && selectedPlayer && (
        <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-100 rounded-[2.5rem] p-12 text-center text-gray-400 font-black uppercase text-[10px] italic tracking-[0.3em] flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
            ))}
          </div>
          Select at least 2 franchises to conduct a lucky draw
        </div>
      )}
    </div>
  );
};
