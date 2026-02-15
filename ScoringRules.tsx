import React from 'react';

export const ScoringRules: React.FC = () => {
  const auctionRules = [
    { category: 'Team Purse', rule: '50.00 Lakhs per team', detail: 'Strictly maintained in Lakhs (L)' },
    { category: 'A+ Category', rule: 'Platinum Players', detail: 'Base: 5.00L | 2 per team' },
    { category: 'A Category', rule: 'Gold Players', detail: 'Base: 3.00L | 3 per team' },
    { category: 'B Category', rule: 'Silver Players', detail: 'Base: 2.00L | 2 per team' },
    { category: 'C Category', rule: 'Bronze Players', detail: 'Base: 1.00L | 4 per team' },
    { category: 'Bidding', rule: '10% of Base Price', detail: 'Increment goes up by 10% of category base' },
    { category: 'Retention (C)', rule: 'Fixed Price A+', detail: '20.00L deducted from purse' },
    { category: 'Retention (C)', rule: 'Fixed Price A', detail: '13.00L deducted from purse' },
    { category: 'Retention (C)', rule: 'Fixed Price B', detail: '8.00L deducted from purse' },
    { category: 'Retention (C)', rule: 'Fixed Price C', detail: '3.50L deducted from purse' },
    { category: 'Owners', rule: 'Owner Retention', detail: 'Automatic 2.5X of category base price' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="border-b border-gray-200 pb-8 text-center md:text-left">
        <h2 className="text-4xl font-black text-ecbNavy uppercase tracking-tighter italic mb-4">League Regulations 2026</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Auction Protocol & Guidelines</p>
      </div>

      <div className="grid grid-cols-1 max-w-4xl mx-auto gap-12">
        {/* Auction Rules Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-1.5 h-8 bg-ecbRed"></div>
             <h3 className="text-2xl font-black text-ecbNavy uppercase italic tracking-tight">Auction Protocol</h3>
          </div>
          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400">Section</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400">Rule</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-gray-400">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {auctionRules.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-5">
                        <span className="text-[9px] font-black px-2 py-1 rounded bg-ecbNavy text-white uppercase whitespace-nowrap">{r.category}</span>
                      </td>
                      <td className="px-8 py-5 font-bold text-ecbNavy text-xs">{r.rule}</td>
                      <td className="px-8 py-5 text-right font-black text-ecbRed italic text-[10px] uppercase">{r.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bg-ecbNavy rounded-3xl p-8 text-white shadow-xl">
           <h4 className="text-xl font-black uppercase italic mb-4">Retention & Owner Selection</h4>
           <div className="space-y-4">
             <p className="text-white/60 text-xs leading-relaxed">
               Each team may retain 1 player/captain before the auction at fixed price levels based on their category.
             </p>
             <p className="text-white/60 text-xs leading-relaxed">
               In the event that two team owners express interest in the same captain/player, the final ownership will be decided through a verified Luck Draw. 
               The winning team pays the standard fixed retention price for that tier.
             </p>
             <div className="pt-4 border-t border-white/10">
               <span className="text-ecbRed font-black uppercase text-[10px] tracking-widest">Important:</span>
               <p className="text-white/60 text-xs mt-1 italic">Retained players do not enter the active bidding pool.</p>
             </div>
           </div>
        </section>
      </div>
    </div>
  );
};