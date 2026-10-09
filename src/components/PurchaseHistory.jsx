import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Calendar, 
  Store, 
  ChevronDown, 
  Trash2, 
  TrendingDown, 
  ShoppingBag, 
  CreditCard,
  User,
  Tag
} from 'lucide-react';
import { STORE_INFO, INITIAL_CATEGORIES } from '../data/initialCategories';

export default function PurchaseHistory({
  history = [],
  onDeleteHistoryItem,
  onClearHistory
}) {
  const [expandedId, setExpandedId] = useState(null);

  // Izračun mesečne porabe za trenutni mesec
  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalSpent = 0;
    let totalSaved = 0;
    let purchasesCount = 0;

    for (const item of history) {
      const itemDate = new Date(item.completedAt || Date.now());
      if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
        totalSpent += Number(item.totalSpent) || 0;
        totalSaved += Number(item.totalSaved) || 0;
        purchasesCount++;
      }
    }

    const monthNames = [
      'januarju', 'februarju', 'marcu', 'aprilu', 'maju', 'juniju',
      'juliju', 'avgustu', 'septembru', 'oktobru', 'novembru', 'decembru'
    ];

    return {
      totalSpent,
      totalSaved,
      purchasesCount,
      monthName: monthNames[currentMonth]
    };
  }, [history]);

  // Formatiranje datuma in ure v slovenščini
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const day = date.getDate();
    const monthNames = [
      'jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.',
      'jul.', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${day}. ${month} ${year} ob ${hours}:${mins}`;
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      
      {/* ======================================================== */}
      {/* 1. MESEČNI SEŠTEVEK PORABE */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-5 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Receipt className="w-40 h-40" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                💶
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Pregled porabe v {currentMonthStats.monthName}
              </span>
            </div>
            
            <span className="text-[11px] font-semibold bg-white/10 px-2.5 py-1 rounded-full text-slate-300">
              {currentMonthStats.purchasesCount} {currentMonthStats.purchasesCount === 1 ? 'nakup' : currentMonthStats.purchasesCount === 2 ? 'nakupa' : 'nakupov'}
            </span>
          </div>

          <div className="pt-1">
            <div className="text-[11px] text-slate-400 font-medium">Ta mesec porabljeno:</div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black tracking-tight text-white">
                {currentMonthStats.totalSpent.toFixed(2)} €
              </span>
              
              {currentMonthStats.totalSaved > 0 && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Prihranek: {currentMonthStats.totalSaved.toFixed(2)} €</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. KARTICE ZAKLJUČENIH NAKUPOV */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zgodovina nakupov ({history.length})</span>
          </h3>

          {history.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Ali res želite počistiti celotno zgodovino nakupov?')) {
                  onClearHistory?.();
                }
              }}
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
            >
              Počisti vso zgodovino
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-3xl flex items-center justify-center mx-auto mb-3 text-2xl">
              🧾
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Ni še zaključenih nakupov
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Ko v trgovini odkljukate artikle in kliknete "Zaključi nakup", se bodo vaši računi in prihranki trajno shranili tukaj.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.map((record) => {
              const isExpanded = expandedId === record.id;
              const storeInfo = STORE_INFO[record.storeName];

              return (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition overflow-hidden"
                >
                  
                  {/* Glava kartice (klik odpre podrobnosti) */}
                  <div
                    onClick={() => toggleExpand(record.id)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/70 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Ikona trgovine ali logotip */}
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-lg shrink-0">
                        {storeInfo?.logo || '🛍️'}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900">
                            {record.storeName || 'Splošno'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {formatDate(record.completedAt)}
                          </span>
                        </div>

                        {/* Kdo je kupil in število artiklov */}
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                            <span>{record.userAvatar || '🧑'}</span>
                            <span>{record.userName || 'Družinski član'}</span>
                          </span>
                          <span>•</span>
                          <span>{record.itemsCount || record.items?.length || 0} artiklov</span>
                        </div>
                      </div>
                    </div>

                    {/* Znesek, prihranek in puščica */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900">
                          {(Number(record.totalSpent) || 0).toFixed(2)} €
                        </div>
                        {Number(record.totalSaved) > 0 && (
                          <div className="text-[10px] font-bold text-emerald-600">
                            -{Number(record.totalSaved).toFixed(2)} €
                          </div>
                        )}
                      </div>

                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400">
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {/* Razširjen seznam kupljenih artiklov (Accordion) */}
                  {isExpanded && (
                    <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Razčlenitev kupljenih artiklov:
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
                        {(record.items || []).map((art, idx) => {
                          const category = INITIAL_CATEGORIES.find(c => c.id === art.category);
                          return (
                            <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50/50">
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <span className="text-sm">{category?.emoji || '🛒'}</span>
                                <div className="truncate">
                                  <div className="font-semibold text-slate-800 truncate">
                                    {art.title}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {art.quantity}
                                    {art.selectedTier && ` • Razred: ${art.selectedTier}`}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-bold text-slate-900">
                                  {art.price > 0 ? `${Number(art.price).toFixed(2)} €` : 'Brez cene'}
                                </span>
                                {art.savings > 0 && (
                                  <div className="text-[10px] font-semibold text-emerald-600">
                                    -{Number(art.savings).toFixed(2)} €
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Brisanje zapisa */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400">
                          ID: {record.id}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Ali res želite izbrisati ta račun iz zgodovine?')) {
                              onDeleteHistoryItem(record.id);
                            }
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Izbriši račun</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
