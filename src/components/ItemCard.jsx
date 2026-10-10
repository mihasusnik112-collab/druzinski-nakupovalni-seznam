import React from 'react';
import { Check, Trash2, Tag, Sparkles, ExternalLink, Flame } from 'lucide-react';
import { INITIAL_CATEGORIES, STORE_INFO } from '../data/initialCategories';

export default function ItemCard({
  item,
  deal,
  onToggle,
  onDelete,
  onOpenDeal
}) {
  const category = INITIAL_CATEGORIES.find(c => c.id === item.category) || {
    name: 'Ostalo',
    emoji: '🛒',
    color: 'bg-slate-100 text-slate-800'
  };

  const storeInfo = deal ? (STORE_INFO[deal.store] || { textColor: 'text-emerald-700', badgeColor: 'bg-emerald-100 text-emerald-800' }) : null;

  return (
    <div
      className={`group relative flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
        item.completed
          ? 'bg-slate-50/80 border-slate-200 opacity-60'
          : 'bg-white border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        {/* Okrogel gumb za kljukico */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.id, item.completed);
          }}
          aria-label={item.completed ? "Označi kot nakupljeno" : "Označi kot kupljeno"}
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            item.completed
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-transparent'
          }`}
        >
          <Check className={`w-4 h-4 stroke-[3] transition-transform ${item.completed ? 'scale-100' : 'scale-50 opacity-0'}`} />
        </button>

        {/* Vsebina artikla */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-semibold truncate transition-all ${
                item.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-900'
              }`}
            >
              {item.title}
            </span>

            {/* Količina značka */}
            {item.quantity && (
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                item.completed ? 'bg-slate-200/60 text-slate-500' : 'bg-slate-100 text-slate-700 font-semibold'
              }`}>
                {item.quantity}
              </span>
            )}

            {/* Značka kupona */}
            {item.hasCouponApplied && (
              <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                🃏 {item.couponTitle || '-25% Joker'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Kategorija oznaka */}
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <span>{category.emoji}</span>
              <span>{category.name}</span>
            </span>

            {/* Kdo je dodal (Avatar + Ime) */}
            {(item.addedByName || item.addedBy) && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                <span>{item.addedByAvatar || '🧑'}</span>
                <span>{item.addedByName || item.addedBy}</span>
              </span>
            )}
          </div>

          {/* Pametna značka akcije (Smart Deal Badge) */}
          {!item.completed && deal && (
            <div className="mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDeal(deal, item);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 hover:border-emerald-400 text-emerald-800 text-xs font-medium shadow-xs transition hover:scale-[1.02] active:scale-95 group/deal"
              >
                <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                <span className="font-bold text-slate-900">{deal.store}:</span>
                <span className="font-extrabold text-emerald-700">{deal.discountPrice?.toFixed(2)} €</span>
                {deal.discountPercentage && (
                  <span className="px-1.5 py-0.2 rounded-md bg-rose-500 text-white text-[10px] font-bold">
                    {deal.discountPercentage}
                  </span>
                )}
                <ExternalLink className="w-3 h-3 text-emerald-600 opacity-60 group-hover/deal:opacity-100 ml-0.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Gumb za brisanje */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
          title="Izbriši artikel"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
