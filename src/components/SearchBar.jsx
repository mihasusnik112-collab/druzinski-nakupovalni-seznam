import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Plus, X, Tag, Store, ChevronRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { INITIAL_CATEGORIES, STORE_INFO } from '../data/initialCategories';
import { searchStoreBrands } from '../utils/brandSuggestions';
import StoreBadge from './StoreBadge';

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenAddModal,
  categoryCounts = {},
  catalogDeals = [],
  onAddDirectItem
}) {
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  // Debounce 150ms za hitro in tekoče tipkanje
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Iskanje znamk in artiklov razdeljenih po trgovcih
  const searchResults = useMemo(() => {
    return searchStoreBrands(debouncedQuery, catalogDeals);
  }, [debouncedQuery, catalogDeals]);

  // Zapri dropdown ob kliku izven komponente
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dodaj splošen artikel (ko uporabnik pritisne Enter ali gumb)
  const handleAddGeneral = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    onAddDirectItem?.({
      title: searchQuery.trim(),
      category: selectedCategory !== 'all' ? selectedCategory : 'ostalo',
      quantity: '1 kos'
    });

    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  // Dodaj točno določen artikel trgovca iz predlogov
  const handleSelectSuggestion = (item) => {
    onAddDirectItem?.({
      title: item.productName || item.title,
      category: item.category || 'ostalo',
      quantity: item.unit || '1 kos',
      price: item.discountPrice ? Number(item.discountPrice) : null,
      savings: item.regularPrice && item.regularPrice > item.discountPrice
        ? Number((item.regularPrice - item.discountPrice).toFixed(2))
        : 0,
      store: item.store || null,
      selectedTier: item.tier || null,
      matchedDealId: item.id || null
    });

    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const hasSuggestions = searchResults.totalCount > 0 && isDropdownOpen && searchQuery.trim().length >= 2;

  return (
    <div ref={containerRef} className="space-y-2.5 relative">
      
      {/* Iskalnik in gumb za dodajanje */}
      <form onSubmit={handleAddGeneral} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            placeholder="Vpiši živilo ali išči (npr. Pivo, Maslo, Banane)..."
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsDropdownOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm rounded-2xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Dodaj</span>
        </button>
      </form>

      {/* ======================================================== */}
      {/* RAZŠIRJEN PREDOGLED PO TRGOVCIH (SUGGESTIONS DROPDOWN) */}
      {/* ======================================================== */}
      {hasSuggestions && (
        <div className="absolute top-11 left-0 right-0 z-50 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Predlogi znamk in cen v trgovinah ({searchResults.totalCount})</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Klik dodeli točno ceno in trgovca
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto no-scrollbar divide-y divide-slate-100 p-2 space-y-2">
            {Object.entries(searchResults.byStore).map(([storeName, items]) => {
              const storeMeta = STORE_INFO[storeName];

              return (
                <div key={storeName} className="pt-1.5 first:pt-0">
                  {/* Značka trgovca */}
                  <div className="flex items-center gap-1.5 px-2 py-1 mb-1">
                    <StoreBadge storeName={storeName} size="sm" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {storeName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      ({items.length})
                    </span>
                  </div>

                  {/* Artikli tega trgovca */}
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectSuggestion(item)}
                        className="p-2 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 flex items-center justify-between gap-3 cursor-pointer transition group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-950 truncate">
                              {item.productName || item.title}
                            </span>
                            
                            {item.tierBadge && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                                item.tier === 'budget' 
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.tier === 'premium_local'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {item.tierBadge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {item.brandName && (
                              <span>Znamka: <strong className="text-slate-700">{item.brandName}</strong></span>
                            )}
                            {item.unitPriceFormatted && (
                              <span>• {item.unitPriceFormatted}</span>
                            )}
                            {item.origin && (
                              <span>• {item.origin}</span>
                            )}
                          </div>
                        </div>

                        {/* Cena in gumb Dodaj */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-black text-slate-900 group-hover:text-emerald-700">
                              {item.discountPrice?.toFixed(2)} €
                            </div>
                            {item.discountPercentage && (
                              <div className="text-[10px] font-bold text-rose-600">
                                {item.discountPercentage}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-emerald-600 text-slate-600 group-hover:text-white flex items-center justify-center transition shadow-2xs"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spodnji gumb: Dodaj splošen artikel ob pritisku Enter */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100">
            <button
              type="button"
              onClick={handleAddGeneral}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dodaj kot splošen artikel: <strong>"{searchQuery}"</strong></span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                <CornerDownLeft className="w-3 h-3" />
                <span>Enter</span>
              </span>
            </button>
          </div>

        </div>
      )}

      {/* Vodoravni drsni trak kategorij (horizontal pill filter) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 scroll-smooth">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>✨ Vse kategorije</span>
        </button>

        {INITIAL_CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.id] || 0;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-sm leading-none">{cat.emoji}</span>
              <span>{cat.name}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
