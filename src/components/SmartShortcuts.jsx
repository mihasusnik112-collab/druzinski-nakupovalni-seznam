import React, { useMemo } from 'react';
import { Plus, Check, Sparkles, TrendingDown } from 'lucide-react';
import { findBestDeal } from '../utils/fuzzyMatch';
import { STORE_INFO } from '../data/initialCategories';
import StoreBadge from './StoreBadge';

export default function SmartShortcuts({
  frequencies = [],
  deals = [],
  activeItems = [],
  onAddShortcutItem
}) {
  // Bližnjice so artikli s pogostostjo >= 2
  const shortcuts = useMemo(() => {
    return frequencies
      .filter(f => (f.count || 0) >= 2)
      .slice(0, 10); // Prvih 10 najbolj priljubljenih
  }, [frequencies]);

  if (shortcuts.length === 0) return null;

  return (
    <div className="space-y-2 animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Priljubljeno & Bližnjice</span>
        </div>
        <span className="text-[11px] text-slate-400">
          Dodaj z enim dotikom
        </span>
      </div>

      {/* Vodoravni drsni trak bližnjic */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 scroll-smooth">
        {shortcuts.map((item) => {
          // Poišči najboljšo trenutno ponudbo za ta artikel
          const match = findBestDeal(item.title, deals, 'best_value');
          const bestDeal = match?.bestDeal;
          const storeInfo = bestDeal ? STORE_INFO[bestDeal.store] : null;

          // Preveri, ali je artikel že na seznamu (neodkljukan)
          const isAlreadyOnList = activeItems.some(
            ai => !ai.completed && ai.title.toLowerCase().trim() === item.title.toLowerCase().trim()
          );

          const handleAdd = () => {
            onAddShortcutItem?.({
              title: item.title,
              category: item.category || 'ostalo',
              quantity: bestDeal?.unit || '1 kos',
              price: bestDeal ? Number(bestDeal.discountPrice) : null,
              savings: bestDeal?.regularPrice && bestDeal.regularPrice > bestDeal.discountPrice
                ? Number((bestDeal.regularPrice - bestDeal.discountPrice).toFixed(2))
                : 0,
              store: bestDeal?.store || null,
              selectedTier: bestDeal?.tier || null,
              matchedDealId: bestDeal?.id || null
            });
          };

          return (
            <div
              key={item.normalizedKeyword}
              className={`shrink-0 w-36 bg-white rounded-2xl p-2.5 border transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between ${
                isAlreadyOnList 
                  ? 'border-emerald-200 bg-emerald-50/40 ring-1 ring-emerald-500/10' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Zgornji del: Emoji in Ime */}
              <div className="flex items-start justify-between gap-1.5 mb-1.5">
                <span className="text-xl leading-none">{item.emoji || '🛒'}</span>
                
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isAlreadyOnList}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition active:scale-90 cursor-pointer shrink-0 ${
                    isAlreadyOnList
                      ? 'bg-emerald-100 text-emerald-700 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                  }`}
                  title={isAlreadyOnList ? 'Že na seznamu' : 'Dodaj na seznam'}
                >
                  {isAlreadyOnList ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  )}
                </button>
              </div>

              <div>
                <div className="font-bold text-xs text-slate-900 truncate" title={item.title}>
                  {item.title}
                </div>

                {/* Živa primerjava cen (mini značka) */}
                <div className="mt-1">
                  {bestDeal ? (
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md truncate max-w-full">
                      <StoreBadge storeName={bestDeal.store} size="xs" />
                      <span className="text-slate-900">{bestDeal.store}:</span>
                      <span className="text-emerald-700 font-extrabold">{bestDeal.discountPrice.toFixed(2)} €</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 block truncate">
                      {item.preferredBrand || 'Pogost nakup'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
