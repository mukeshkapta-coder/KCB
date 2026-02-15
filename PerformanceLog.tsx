import React, { useState, useMemo } from 'react';
import { Player, Franchise, MatchRecord, MatchPlayerPerformance } from '../types';
import { SportIcon } from './SportIcon';

interface PerformanceLogProps {
  players: Player[];
  franchises: Franchise[];
  matchRecords: MatchRecord[];
}

type PerformanceSortKey = 'match' | 'player' | 'team' | 'franchise' | 'points' | 'total';

export const PerformanceLog: React.FC<PerformanceLogProps> = ({ players, franchises, matchRecords }) => {
  const [selectedMatch, setSelectedMatch] = useState<number | 'all'>('all');
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: PerformanceSortKey; order: 'asc' | 'desc' }>({ key: 'match', order: 'desc' });

  const matchNumbers = useMemo(() => {
    // Explicitly type sort parameters as numbers to fix arithmetic operation error (left and right hand side of '-')
    return Array.from(new Set(matchRecords.map(m => m.matchNumber))).sort((a: number, b: number) => b - a);
  }, [matchRecords]);

  const getFranchiseInfo = (playerName: string, perf: MatchPlayerPerformance) => {
    if (perf.franchiseIdSnapshot && perf.franchiseIdSnapshot !== "Free Agent") {
        const f = franchises.find(fr => fr.id === perf.franchiseIdSnapshot);
        if (f) return { id: f.id, name: f.name, color: f.color, icon: f.icon, isFreeAgent: false };
    }
    const player = players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (player?.teamId) {
      const f = franchises.find(fr => fr.id === player.teamId);
      if (f) return { 
        id: f.id, name: f.name, color: f.color, icon: f.icon, isFreeAgent: false,
        isC: f.captainId === player.id, isVC: f.viceCaptainId === player.id
      };
    }
    return { id: 'Free Agent', name: 'Free Agent', color: '#cbd5e1', icon: 'shield', isFreeAgent: true };
  };

  const flattenedData = useMemo(() => {
    const list: any[] = [];
    matchRecords.forEach(m => {
      m.performances.forEach(perf => {
        const f = getFranchiseInfo(perf.playerName, perf);
        const player = players.find(p => p.name.toLowerCase() === perf.playerName.toLowerCase());
        
        let multiplier = perf.multiplierApplied || 1;
        if (!m.isPhaseFixed) {
            if ((f as any).isC) multiplier = 2;
            else if ((f as any).isVC) multiplier = 1.5;
        }

        list.push({
          match: m.matchNumber,
          date: m.date,
          player: perf.playerName,
          team: player?.originalTeam || '-',
          franchise: f.name,
          franchiseId: f.id,
          points: perf.points,
          multiplier,
          total: Math.round(perf.points * multiplier),
          potm: perf.isPOTM,
          breakdown: perf.breakdown
        });
      });
    });

    return list.filter(item => {
      const matchPass = selectedMatch === 'all' || item.match === selectedMatch;
      const franchisePass = selectedFranchiseId === 'all' || item.franchiseId === selectedFranchiseId;
      return matchPass && franchisePass;
    }).sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
      if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [matchRecords, players, franchises, selectedMatch, selectedFranchiseId, sortConfig]);

  const toggleSort = (key: PerformanceSortKey) => setSortConfig(p => ({ key, order: p.key === key && p.order === 'asc' ? 'desc' : 'asc' }));
  const SortIndicator = ({ column }: { column: PerformanceSortKey }) => (sortConfig.key !== column ? <span className="ml-1 opacity-20">⇅</span> : <span className="ml-1 text-ecbCyan">{sortConfig.order === 'asc' ? '↑' : '↓'}</span>);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col space-y-8 border-b border-gray-200 pb-10">
        <h2 className="text-4xl font-black text-ecbNavy uppercase italic tracking-tighter">Match Performance Log</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="text-[10px] font-black text-ecbCyan uppercase tracking-widest">Select Match</div>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    <button onClick={() => setSelectedMatch('all')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase ${selectedMatch === 'all' ? 'bg-ecbNavy text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>All</button>
                    {matchNumbers.map(m => (
                        <button key={m} onClick={() => setSelectedMatch(m)} className={`w-10 h-10 flex items-center justify-center rounded-lg text-[11px] font-black ${selectedMatch === m ? 'bg-ecbCyan text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>{m}</button>
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                <div className="text-[10px] font-black text-ecbCyan uppercase tracking-widest">Filter Franchise</div>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    <button onClick={() => setSelectedFranchiseId('all')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase ${selectedFranchiseId === 'all' ? 'bg-ecbNavy text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>All</button>
                    {franchises.map(f => (
                        <button key={f.id} onClick={() => setSelectedFranchiseId(f.id)} className={`px-3 py-2 flex items-center gap-2 rounded-lg ${selectedFranchiseId === f.id ? 'bg-white border-2 border-ecbCyan' : 'bg-white text-gray-400 border border-gray-100'}`}>
                            <SportIcon name={f.icon} color={f.color} className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase whitespace-nowrap">{f.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 tracking-widest">
              <tr>
                <th className="px-6 py-6 cursor-pointer" onClick={() => toggleSort('match')}>Match <SortIndicator column="match" /></th>
                <th className="px-6 py-6 cursor-pointer" onClick={() => toggleSort('player')}>Player <SortIndicator column="player" /></th>
                <th className="px-6 py-6 cursor-pointer" onClick={() => toggleSort('team')}>Team <SortIndicator column="team" /></th>
                <th className="px-6 py-6 cursor-pointer" onClick={() => toggleSort('franchise')}>Franchise <SortIndicator column="franchise" /></th>
                <th className="px-6 py-6 text-center cursor-pointer" onClick={() => toggleSort('points')}>Base Pts <SortIndicator column="points" /></th>
                <th className="px-6 py-6 text-center">Mult</th>
                <th className="px-6 py-6 text-right cursor-pointer" onClick={() => toggleSort('total')}>Weighted <SortIndicator column="total" /></th>
                <th className="px-6 py-6">Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {flattenedData.length > 0 ? flattenedData.map((row, idx) => (
                <tr key={`${row.match}-${row.player}-${idx}`} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-5 text-[11px] font-black text-gray-400">M{row.match}</td>
                  <td className="px-6 py-5 font-black text-ecbNavy">{row.player} {row.potm && <span className="text-[8px] bg-amber-400 text-white px-1.5 py-0.5 rounded ml-1">POTM</span>}</td>
                  <td className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase">{row.team}</td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black text-ecbNavy uppercase italic border-l-2 pl-2 border-ecbCyan">{row.franchise}</span>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-gray-400">{row.points}</td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${row.multiplier > 1 ? 'bg-ecbCyan/10 text-ecbCyan' : 'text-gray-300'}`}>{row.multiplier}x</span>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-ecbNavy text-lg tracking-tighter">{row.total}</td>
                  <td className="px-6 py-5 text-[10px] font-medium text-gray-400 italic max-w-xs truncate" title={row.breakdown}>{row.breakdown}</td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-6 py-20 text-center text-gray-300 font-black uppercase tracking-widest">No matching records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};