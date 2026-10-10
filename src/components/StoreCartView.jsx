import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Trash2, 
  Store, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Tag, 
  ShoppingCart, 
  CheckCircle2, 
  Clock,
  Layers,
  Percent,
  Plus
} from 'lucide-react';
import { STORES_LIST } from '../data/stores';
import { INITIAL_CATEGORIES } from '../data/initialCategories';
import StoreBadge from './StoreBadge';

// Logični vrstni red polic v trgovini za optimalno hojo med policami
const AISLE_ORDER = [
  'sadje-zelenjava', // 1. Vhod v trgovino (sadje in zelenjava)
  'pekarna',         // 2. Pekarna / sveži kruh
  'mlecno',          // 3. Mlečni izdelki, siri, jajca
  'meso',            // 4. Meso in mesnica
  'shramba',         // 5. Testenine, omake, riž, moka, kava
  'zamrznjeno',      // 6. Zamrzovalniki
  'pijace',          // 7. Pijače in pivo
  'cistila',         // 8. Čistila in dom
  'nega',            // 9. Nega in kozmetika
  'ostalo'           // 10. Ostalo / blagajna
];

export default function StoreCartView({
  items = [],
  selectedStore = 'all', // 'all' | 'Spar' | 'Lidl' | 'Hofer' ...
  onSelectStore,
  onToggleItem,
  onDeleteItem,
  onClearCompleted,
  onUpdateItemPrice,
  onOpenAddItem,
  onCheckout,
  elapsedSeconds = 0,
  currentMember
}) {
  const [showOtherStores, setShowOtherStores] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [tempPrice, setTempPrice] = useState('');

  // Štetje artiklov po trgovinah
  const storeCounts = useMemo(() => {
    const counts = { all: items.filter(i => !i.completed).length };
    items.forEach(i => {
      if (!i.completed && i.store) {
        counts[i.store] = (counts[i.store] || 0) + 1;
      }
    });
    return counts;
  }, [items]);

  // Razvrščanje artiklov glede na izbrano trgovino
  const { currentStoreItems, otherStoresItems, completedItems } = useMemo(() => {
    const completed = items.filter(i => i.completed);
    const active = items.filter(i => !i.completed);

    if (selectedStore === 'all') {
      return {
        currentStoreItems: active,
        otherStoresItems: [],
        completedItems: completed
      };
    }

    const current = [];
    const other = [];

    active.forEach(item => {
      // Artikel spada v trenutno trgovino če:
      // 1. Ima izrecno nastavljeno to trgovino
      // 2. Je brez določene trgovine (splošen artikel, ki ga lahko kupimo v kateri koli trgovini)
      if (!item.store || item.store.toLowerCase() === selectedStore.toLowerCase()) {
        current.push(item);
      } else {
        other.push(item);
      }
    });

    return {
      currentStoreItems: current,
      otherStoresItems: other,
      completedItems: completed
    };
  }, [items, selectedStore]);

  // Razvrščanje artiklov trenutne trgovine po optimalnih policah (Aisle Order)
  const groupedByAisle = useMemo(() => {
    const groups = {};
    AISLE_ORDER.forEach(catId => {
      groups[catId] = [];
    });

    currentStoreItems.forEach(item => {
      const cat = item.category || 'ostalo';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    return Object.entries(groups)
      .filter(([_, catItems]) => catItems.length > 0)
      .map(([catId, catItems]) => {
        const catMeta = INITIAL_CATEGORIES.find(c => c.id === catId) || {
          name: 'Ostalo',
          emoji: '🛒'
        };
        return {
          catId,
          catMeta,
          items: catItems
        };
      });
  }, [currentStoreItems]);

  // Seštevki zneskov
  const { currentStoreTotal, overallTotal, overallSavings } = useMemo(() => {
    let curTot = 0;
    let allTot = 0;
    let allSav = 0;

    completedItems.forEach(i => {
      const p = Number(i.price) || 0;
      const s = Number(i.savings) || 0;
      allTot += p;
      allSav += s;
      if (selectedStore === 'all' || (i.store && i.store.toLowerCase() === selectedStore.toLowerCase())) {
        curTot += p;
      }
    });

    return {
      currentStoreTotal: curTot,
      overallTotal: allTot,
      overallSavings: allSav
    };
  }, [completedItems, selectedStore]);

  // Formatiranje časa
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Varno brisanje s stopPropagation
  const handleDeleteSafe = (e, itemId) => {
    e.stopPropagation();
    onDeleteItem?.(itemId);
  };

  return (
    <div className="space-y-4 pb-28">
      
      {/* ======================================================== */}
      {/* 1. HORIZONTALNA IZBIRA TRGOVINE Z LOGOTIPI */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-xs space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>Kje nakupujete zdaj?</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Razvrsti po policah
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-2 px-2 scroll-smooth">
          {/* Vse trgovine */}
          <button
            type="button"
            onClick={() => onSelectStore('all')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer border shrink-0 ${
              selectedStore === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/10'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>🏪</span>
            <span>Vse trgovine</span>
            {storeCounts.all > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                selectedStore === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {storeCounts.all}
              </span>
            )}
          </button>

          {/* Posamezni trgovci z uradnimi SVG logotipi */}
          {STORES_LIST.map((store) => {
            const isSelected = selectedStore.toLowerCase() === store.shortName.toLowerCase();
            const count = storeCounts[store.shortName] || 0;

            return (
              <button
                type="button"
                key={store.id}
                onClick={() => onSelectStore(store.shortName)}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer border shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/25 scale-[1.02]'
                    : 'bg-white text-slate-800 border-slate-200/90 hover:bg-slate-50'
                }`}
              >
                <StoreBadge storeName={store.shortName} size="xs" />
                <span>{store.shortName}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. ARTIKLI TRENUTNE TRGOVINE RAZVRŠČENI PO POLICAH (AISLES) */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span>Za nakup</span>
              {selectedStore !== 'all' && (
                <span className="text-emerald-700 font-extrabold">v {selectedStore}</span>
              )}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              {currentStoreItems.length}
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            Dotik odkljuka v voziček
          </span>
        </div>

        {currentStoreItems.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl">
              🛒
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              {selectedStore === 'all' 
                ? 'Vsi artikli so že v košarici!' 
                : `Za trgovino ${selectedStore} ni neodkljukanih artiklov.`}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Preklopite na drugo trgovino ali dodajte nov artikel na seznam.
            </p>
            <button
              type="button"
              onClick={onOpenAddItem}
              className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Dodaj artikel</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedByAisle.map(({ catId, catMeta, items: catItems }) => (
              <div key={catId} className="space-y-1.5">
                
                {/* Glava police / kategorije */}
                <div className="flex items-center gap-1.5 px-1 pt-1 text-slate-600">
                  <span className="text-sm">{catMeta.emoji}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {catMeta.name}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    ({catItems.length})
                  </span>
                </div>

                {/* Artikli v polici */}
                <div className="space-y-2">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onToggleItem(item.id, item.completed)}
                      className="group bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99]"
                    >
                      {/* Okrogel gumb za potrditev */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleItem(item.id, item.completed);
                        }}
                        className="w-7 h-7 rounded-full border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center transition cursor-pointer shrink-0"
                        title="Daj v košarico"
                      >
                        <Check className="w-3.5 h-3.5 text-transparent" />
                      </button>

                      {/* Vsebina */}
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
                        </div>

                        {/* Oznaka trgovca & kupon & cena */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px]">
                          {item.store && (
                            <div className="inline-flex items-center gap-1">
                              <StoreBadge storeName={item.store} size="xs" />
                              <span className="font-semibold text-slate-700">{item.store}</span>
                            </div>
                          )}

                          {item.price > 0 && (
                            <span className="font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              {Number(item.price).toFixed(2)} €
                            </span>
                          )}

                          {item.hasCouponApplied && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                              <span>🃏</span>
                              <span>-25% Spar Joker</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Gumb za brisanje (varno izoliran s stopPropagation) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteSafe(e, item.id);
                        }}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 rounded-xl transition cursor-pointer shrink-0"
                        title="Izbriši artikel"
                      >
                        <Trash2 className="w-4 h-4 pointer-events-none" />
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. ZLOŽLJIV RAZDELEK: ARTIKLI ZA OSTALE TRGOVINE */}
      {/* ======================================================== */}
      {selectedStore !== 'all' && otherStoresItems.length > 0 && (
        <div className="pt-2">
          <div className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200 space-y-2">
            <button
              type="button"
              onClick={() => setShowOtherStores(!showOtherStores)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Artikli za druge trgovine ({otherStoresItems.length})</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-medium">
                  {showOtherStores ? 'Skrij' : 'Pokaži'}
                </span>
                {showOtherStores ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showOtherStores && (
              <div className="space-y-1.5 pt-1">
                {otherStoresItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-white/80 rounded-xl p-2.5 border border-slate-200/70 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      {item.store && <StoreBadge storeName={item.store} size="xs" />}
                      <span className="font-semibold text-slate-700 truncate">{item.title}</span>
                      {item.quantity && <span className="text-slate-400">({item.quantity})</span>}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.store || 'Druga trgovina'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteSafe(e, item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 active:scale-95 rounded-lg cursor-pointer"
                        title="Izbriši artikel"
                      >
                        <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. KUPLJENI ARTIKLI (V VOZIČKU) */}
      {/* ======================================================== */}
      {completedItems.length > 0 && (
        <div className="pt-4 border-t border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <span>V vozičku ({completedItems.length})</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClearCompleted}
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
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
                    <button
                      type="button"
                      onClick={() => onToggleItem(item.id, item.completed)}
                      className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:bg-emerald-700 transition"
                      title="Vrni med aktivne"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

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
                        {item.store && <StoreBadge storeName={item.store} size="xs" />}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                        <span>{category?.emoji} {category?.name}</span>
                        {item.savings > 0 && (
                          <span className="text-emerald-700 font-bold">
                            • Prihranek: -{Number(item.savings).toFixed(2)} €
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Vnos ali urejanje cene */}
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
                            className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPriceId(item.id);
                            setTempPrice(hasPrice ? item.price.toString() : '');
                          }}
                          className={`px-2 py-1 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
                            hasPrice
                              ? 'bg-white text-slate-900 border-emerald-300 shadow-2xs hover:border-emerald-500'
                              : 'bg-emerald-100/90 text-emerald-800 border-dashed border-emerald-400 hover:bg-emerald-200'
                          }`}
                          title="Kliknite za vnos cene"
                        >
                          {hasPrice ? (
                            <>
                              <span>{item.price.toFixed(2)} €</span>
                              <span className="text-[10px] text-slate-400">✏️</span>
                            </>
                          ) : (
                            <span>+ Cena</span>
                          )}
                        </button>
                      )}

                      {/* Gumb za brisanje */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteSafe(e, item.id);
                        }}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 active:scale-95 rounded-lg transition cursor-pointer"
                        title="Izbriši artikel"
                      >
                        <Trash2 className="w-4 h-4 pointer-events-none" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. FIKSNA SPODNJA VRSTICA ZNESKA (SEJA V ŽIVO) */}
      {/* ======================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-700/80 shadow-2xl">
        <div className="max-w-2xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-3">
            
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-5 h-5" />
              </div>

              <div className="truncate">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-white tracking-tight">
                    {overallTotal.toFixed(2)} €
                  </span>
                  {selectedStore !== 'all' && (
                    <span className="text-xs text-slate-300">
                      ({selectedStore}: <strong className="text-emerald-400">{currentStoreTotal.toFixed(2)} €</strong>)
                    </span>
                  )}
                  {overallSavings > 0 && (
                    <span className="text-xs font-bold text-emerald-400">
                      (-{overallSavings.toFixed(2)} €)
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate">
                  V vozičku: <strong className="text-white font-bold">{completedItems.length}</strong> kupljeno
                  {elapsedSeconds > 0 && ` • Čas: ${formatTime(elapsedSeconds)}`}
                </div>
              </div>
            </div>

            {/* Gumb za zaključek nakupa */}
            {completedItems.length > 0 && (
              <button
                type="button"
                onClick={onCheckout}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition cursor-pointer shrink-0"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Zaključi</span>
              </button>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}
