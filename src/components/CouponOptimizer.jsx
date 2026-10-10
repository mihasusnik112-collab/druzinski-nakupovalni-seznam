import React, { useState } from 'react';
import { Tag, Sparkles, Check, ChevronRight, AlertCircle, Percent } from 'lucide-react';
import { AVAILABLE_COUPONS, findBestItemForCoupon, estimateItemPrice } from '../utils/couponManager';
import StoreBadge from './StoreBadge';

export default function CouponOptimizer({
  items = [],
  onApplyCouponToItem,
  appliedCoupons = {}, // { itemId: coupon }
  className = ''
}) {
  const [selectedCouponId, setSelectedCouponId] = useState(AVAILABLE_COUPONS[0]?.id || 'spar-joker-25');
  const [expanded, setExpanded] = useState(true);

  const selectedCoupon = AVAILABLE_COUPONS.find(c => c.id === selectedCouponId) || AVAILABLE_COUPONS[0];
  const bestMatch = findBestItemForCoupon(items, selectedCoupon);

  const handleApply = (coupon, match) => {
    if (!match?.item) return;
    onApplyCouponToItem?.(match.item.id, coupon, match.discountedPrice, match.potentialSavings);
  };

  return (
    <div className={`bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-emerald-500/10 rounded-3xl p-4 border border-amber-300/60 shadow-xs ${className}`}>
      
      {/* Glava kartice */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white text-base shadow-xs">
            🃏
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span>Pametni Kuponi & Popusti</span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-bold">
                Maksimalen prihranek
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Samodejni izračun, kje se vam kupon najbolj splača
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-bold text-amber-800 hover:text-amber-900 px-2 py-1 rounded-lg bg-amber-100/60 cursor-pointer"
        >
          {expanded ? 'Skrij' : 'Prikaži'}
        </button>
      </div>

      {expanded && (
        <div className="space-y-3">
          
          {/* Izbira kupona (Spar Joker, Lidl Plus, Hofer, ...) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-2 px-2 scroll-smooth">
            {AVAILABLE_COUPONS.map(coupon => {
              const isSelected = coupon.id === selectedCouponId;
              return (
                <button
                  type="button"
                  key={coupon.id}
                  onClick={() => setSelectedCouponId(coupon.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <StoreBadge storeName={coupon.store} size="xs" />
                  <span>{coupon.title}</span>
                  <span className={`text-[10px] px-1 py-0.2 rounded ${isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'}`}>
                    -{coupon.discountPercent}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Priporočilo kje uveljaviti kupon */}
          {bestMatch ? (
            <div className="bg-white rounded-2xl p-3.5 border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-rose-600" />
                    <span>Najboljša izbira na vašem seznamu:</span>
                  </span>
                  <StoreBadge storeName={selectedCoupon.store} size="xs" />
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {bestMatch.item.title}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    {bestMatch.estimatedPrice.toFixed(2)} €
                  </span>
                  <span className="text-sm font-black text-emerald-600">
                    {bestMatch.discountedPrice.toFixed(2)} €
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  {selectedCoupon.description} • Prihranek z Joker kuponom:{' '}
                  <strong className="text-emerald-700 font-extrabold">
                    +{bestMatch.potentialSavings.toFixed(2)} €
                  </strong>
                </p>
              </div>

              {/* Gumb za uveljavitev kupona */}
              <div className="shrink-0 flex items-center gap-2">
                {bestMatch.item.hasCouponApplied ? (
                  <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Kupon uveljavljen</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApply(selectedCoupon, bestMatch)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer"
                  >
                    <span>Uveljavi -{selectedCoupon.discountPercent}%</span>
                    <Percent className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/80 rounded-2xl p-3 border border-dashed border-amber-200 text-center">
              <p className="text-xs text-slate-600">
                Na seznamu trenutno ni primernega artikla za <strong>{selectedCoupon.title}</strong>.{' '}
                Dodajte artikel (npr. <em>plato piva, kavo Barcaffè, sir ali detergent</em>) in sistem bo takoj izračunal prihranek!
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
