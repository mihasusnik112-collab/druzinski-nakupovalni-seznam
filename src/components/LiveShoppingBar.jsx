import React from 'react';
import { ShoppingCart, Clock, CheckCircle2, Store } from 'lucide-react';
import { STORES_LIST } from '../data/stores';
import StoreBadge from './StoreBadge';

const STORES = ['Splošno', ...STORES_LIST.map(s => s.shortName)];

export default function LiveShoppingBar({
  completedCount = 0,
  totalAmount = 0,
  totalSavings = 0,
  elapsedSeconds = 0,
  currentStore = 'Splošno',
  onSelectStore,
  onCheckout
}) {
  if (completedCount === 0) return null;

  // Formatiranje časa seje: MM:SS ali H:MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}m`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-14 sm:bottom-16 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-700/80 shadow-2xl animate-in slide-in-from-bottom-6 duration-200">
      <div className="max-w-2xl mx-auto px-4 py-2.5">
        
        {/* Zgornja vrstica: Trgovina in čas seje */}
        <div className="flex items-center justify-between text-[11px] text-slate-300 pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-slate-400">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trgovina:</span>
            </span>
            <div className="flex items-center gap-1.5 bg-slate-800 text-white font-bold text-[11px] px-2 py-0.5 rounded-lg border border-slate-700">
              <StoreBadge storeName={currentStore} size="xs" />
              <select
                value={currentStore}
                onChange={(e) => onSelectStore?.(e.target.value)}
                className="bg-transparent text-white font-bold text-[11px] focus:outline-none cursor-pointer"
              >
                {STORES.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded-lg text-slate-300">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Čas seje: {formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Glavna vrstica: Štetje artiklov, znesek, prihranek in gumb za zaključek */}
        <div className="flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>

            <div className="truncate">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-white tracking-tight">
                  {totalAmount.toFixed(2)} €
                </span>
                {totalSavings > 0 && (
                  <span className="text-xs font-bold text-emerald-400">
                    (-{totalSavings.toFixed(2)} €)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-medium truncate">
                V košarici: <strong className="text-white font-bold">{completedCount}</strong> {completedCount === 1 ? 'artikel' : completedCount === 2 ? 'artikla' : completedCount < 5 ? 'artikli' : 'artiklov'}
              </div>
            </div>
          </div>

          {/* Gumb Zaključi nakup */}
          <button
            onClick={onCheckout}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Zaključi nakup</span>
          </button>

        </div>

      </div>
    </div>
  );
}
