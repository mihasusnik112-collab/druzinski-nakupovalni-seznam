import React, { useState } from 'react';
import { 
  Check, 
  Trash2, 
  Flame, 
  Sparkles, 
  ChevronDown, 
  Layers, 
  Plus, 
  ExternalLink,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { INITIAL_CATEGORIES, STORE_INFO } from '../data/initialCategories';
import StoreBadge from './StoreBadge';

export default function ShoppingList({
  items = [],
  itemDealsMap = new Map(),
  onToggleItem,
  onDeleteItem,
  onClearCompleted,
  onOpenAddItem,
  onOpenDealComparison,
  onSelectTier,
  onUpdateItemPrice
}) {
  const [showCompleted, setShowCompleted] = useState(true);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [tempPrice, setTempPrice] = useState('');

  const activeItems = items.filter(i => !i.completed);
  const completedItems = items.filter(i => i.completed);

  return (
    <div className="space-y-4">
      
      {/* ======================================================== */}
      {/* 1. AKTIVNI ARTIKLI (NEODKLJUKANO) */}
      {/* ======================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Potrebujemo za kupiti
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">
              {activeItems.length}
            </span>
          </div>

          {activeItems.length > 0 && (
            <span className="text-[11px] text-slate-400">
              Klik na značko izbere kakovostni razred
            </span>
          )}
        </div>

        {activeItems.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
              🛒
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Nakupovalni seznam je prazen!
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Vsi artikli so že nakupljeni ali pa še niste dodali nobenega živila.
            </p>
            <button
              onClick={onOpenAddItem}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Dodaj prvi artikel</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeItems.map((item) => {
              const category = INITIAL_CATEGORIES.find(c => c.id === item.category) || {
                name: 'Ostalo',
                emoji: '🛒'
              };

              const matchData = itemDealsMap.get(item.id);
              const tieredDeals = matchData?.tieredDeals || {};
              const hasTiers = tieredDeals.budget || tieredDeals.brand || tieredDeals.premium_local;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Okrogel gumb za kljukico */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleItem(item.id, item.completed);
                      }}
                      className="mt-0.5 shrink-0 w-7 h-7 rounded-full border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center transition cursor-pointer"
                      title="Označi kot kupljeno"
                    >
                      <Check className="w-3.5 h-3.5 text-transparent" />
                    </button>

                    {/* Glavna vsebina */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {item.title}
                        </span>

                        {item.quantity && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                            {item.quantity}
                          </span>
                        )}

                        {item.hasCouponApplied && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                            🃏 {item.couponTitle || '-25% Joker'}
                          </span>
                        )}
                      </div>

                      {/* Kategorija & Avtorstvo */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <span>{category.emoji}</span>
                          <span>{category.name}</span>
                        </span>

                        {/* Kdo je dodal (Avatar + Ime) */}
                        {item.addedByName && (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            • <span>{item.addedByAvatar || '🧑'}</span>
                            <span className="font-medium text-slate-600">{item.addedByName}</span>
                          </span>
                        )}
                      </div>

                      {/* ======================================================== */}
                      {/* 3 KAKOVOSTNI RAZREDI (ZNAČKE Z ENO-DOTIČNO IZBIRO) */}
                      {/* ======================================================== */}
                      {hasTiers && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Razpoložljive opcije v katalogih:
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenDealComparison(item, tieredDeals, item.selectedTier);
                              }}
                              className="text-[10px] font-semibold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>Primerjaj vse</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {/* 1. DISKONT / NAJCENEJE */}
                            {tieredDeals.budget && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectTier(item.id, 'budget', tieredDeals.budget);
                                }}
                                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-xl text-[11px] font-medium border transition cursor-pointer ${
                                  item.selectedTier === 'budget' || (!item.selectedTier && !tieredDeals.brand && !tieredDeals.premium_local)
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold'
                                    : 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                                }`}
                                title={`${tieredDeals.budget.productName} (${tieredDeals.budget.store})`}
                              >
                                <StoreBadge storeName={tieredDeals.budget.store} size="xs" />
                                <span>{tieredDeals.budget.store}:</span>
                                <span>{tieredDeals.budget.unitPriceFormatted || `${tieredDeals.budget.discountPrice} €`}</span>
                              </button>
                            )}

                            {/* 2. ZNAMKA / BEST VALUE */}
                            {tieredDeals.brand && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectTier(item.id, 'brand', tieredDeals.brand);
                                }}
                                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-xl text-[11px] font-medium border transition cursor-pointer ${
                                  item.selectedTier === 'brand'
                                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs font-bold'
                                    : 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100'
                                }`}
                                title={`${tieredDeals.brand.productName} (${tieredDeals.brand.store})`}
                              >
                                <StoreBadge storeName={tieredDeals.brand.store} size="xs" />
                                <span>{tieredDeals.brand.store}:</span>
                                <span>{tieredDeals.brand.unitPriceFormatted || `${tieredDeals.brand.discountPrice} €`}</span>
                                {tieredDeals.brand.discountPercentage && (
                                  <span className="text-[10px] opacity-90">({tieredDeals.brand.discountPercentage})</span>
                                )}
                              </button>
                            )}

                            {/* 3. LOKALNO / EKO */}
                            {tieredDeals.premium_local && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectTier(item.id, 'premium_local', tieredDeals.premium_local);
                                }}
                                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-xl text-[11px] font-medium border transition cursor-pointer ${
                                  item.selectedTier === 'premium_local'
                                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs font-bold'
                                    : 'bg-teal-50/70 text-teal-900 border-teal-200 hover:bg-teal-100'
                                }`}
                                title={`${tieredDeals.premium_local.productName} (${tieredDeals.premium_local.store})`}
                              >
                                <StoreBadge storeName={tieredDeals.premium_local.store} size="xs" />
                                <span>{tieredDeals.premium_local.store}:</span>
                                <span>{tieredDeals.premium_local.unitPriceFormatted || `${tieredDeals.premium_local.discountPrice} €`}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Izbris */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Izbriši artikel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. KUPLJENI ARTIKLI (V VOZIČKU) */}
      {/* ======================================================== */}
      {completedItems.length > 0 && (
        <div className="pt-4 border-t border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition"
            >
              <span>V vozičku / Kupljeno ({completedItems.length})</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={onClearCompleted}
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline"
            >
              Počisti kupljeno
            </button>
          </div>

          {showCompleted && (
            <div className="space-y-2">
              {completedItems.map((item) => {
                const category = INITIAL_CATEGORIES.find(c => c.id === item.category);
                const isEditingThisPrice = editingPriceId === item.id;
                const hasPrice = typeof item.price === 'number' && item.price > 0;

                const handleSavePrice = () => {
                  const num = parseFloat(tempPrice.replace(',', '.'));
                  if (!isNaN(num) && num >= 0) {
                    onUpdateItemPrice?.(item.id, Number(num.toFixed(2)));
                  }
                  setEditingPriceId(null);
                  setTempPrice('');
                };

                return (
                  <div
                    key={item.id}
                    className="bg-emerald-50/70 rounded-2xl p-3 border border-emerald-200/90 shadow-2xs flex items-center justify-between gap-3 transition-all"
                  >
                    {/* Kljukica - tap vrne med aktivne */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleItem(item.id, item.completed);
                      }}
                      className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:bg-emerald-700 transition"
                      title="Vrni med aktivne"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    {/* Vsebina artikla */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-800 line-through opacity-85 truncate">
                          {item.title}
                        </span>
                        {item.quantity && (
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                            {item.quantity}
                          </span>
                        )}
                        {item.hasCouponApplied && (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded">
                            🃏 {item.couponTitle || '-25% Joker'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                        <span>{category?.emoji} {category?.name}</span>
                        {item.addedByName && (
                          <span>• {item.addedByAvatar || '🧑'} {item.addedByName}</span>
                        )}
                        {item.savings > 0 && (
                          <span className="text-emerald-700 font-bold">
                            • Prihranek: -{Number(item.savings).toFixed(2)} €
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Polje / Značka za ceno */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isEditingThisPrice ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSavePrice()}
                            autoFocus
                            placeholder="0.00"
                            className="w-16 px-1.5 py-1 text-xs font-bold bg-white border border-emerald-400 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right"
                          />
                          <button
                            type="button"
                            onClick={handleSavePrice}
                            className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 cursor-pointer"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPriceId(item.id);
                            setTempPrice(hasPrice ? item.price.toString() : '');
                          }}
                          className={`px-2 py-1 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
                            hasPrice
                              ? 'bg-white text-slate-900 border-emerald-300 shadow-2xs hover:border-emerald-500'
                              : 'bg-emerald-100/90 text-emerald-800 border-dashed border-emerald-400 hover:bg-emerald-200'
                          }`}
                          title="Kliknite za vnos ali popravek cene"
                        >
                          {hasPrice ? (
                            <>
                              <span>{item.price.toFixed(2)} €</span>
                              <span className="text-[10px] text-slate-400">✏️</span>
                            </>
                          ) : (
                            <span>+ Vnesi ceno</span>
                          )}
                        </button>
                      )}

                      {/* Izbris */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition cursor-pointer"
                        title="Izbriši artikel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
