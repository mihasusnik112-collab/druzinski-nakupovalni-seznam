import React, { useMemo } from 'react';
import { 
  Sparkles, 
  Store, 
  Plus, 
  Check, 
  Flame, 
  Tag, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import StoreBadge from './StoreBadge';

export default function PersonalizedDeals({
  activeFamily,
  deals = [],
  currentItems = [],
  onAddItem,
  onOpenDealsTab
}) {
  const familyName = activeFamily?.familyName || 'Družina';
  const preferences = activeFamily?.preferences || {};
  const favoriteStores = preferences.favoriteStores || ['spar', 'lidl', 'hofer', 'mercator'];
  const cuisines = preferences.cuisines || ['slovenska', 'azijska'];

  // Kulinarična tema tedna (npr. Azijski teden, Ameriški BBQ, Domače slovensko)
  const themeHighlights = useMemo(() => {
    if (!deals || deals.length === 0) return [];

    const highlights = [];

    // 1. Azijska hrana
    if (cuisines.includes('azijska')) {
      const asianKeywords = ['riž', 'rezanci', 'sojina', 'wok', 'azij', 'curry'];
      const asianMatches = deals.filter(d => 
        asianKeywords.some(k => d.productName.toLowerCase().includes(k) || (d.brand && d.brand.toLowerCase().includes(k)))
      );
      if (asianMatches.length > 0) {
        highlights.push({
          theme: '🥢 Azijski kotiček & Wok ponudbe',
          subtitle: 'Znižano za ljubitelje azijske kuhinje v vaši družini',
          color: 'from-amber-600 to-rose-600',
          badgeBg: 'bg-amber-100 text-amber-800',
          deals: asianMatches.slice(0, 3)
        });
      }
    }

    // 2. Ameriška / BBQ hrana
    if (cuisines.includes('ameriska')) {
      const americanKeywords = ['burger', 'meso', 'omaka', 'čevap', 'rebrc', 'krompirček', 'perutn'];
      const bbqMatches = deals.filter(d => 
        americanKeywords.some(k => d.productName.toLowerCase().includes(k))
      );
      if (bbqMatches.length > 0) {
        highlights.push({
          theme: '🍔 Ameriški / BBQ teden',
          subtitle: 'Izbrane akcije za burgerje, meso in žar omake',
          color: 'from-red-600 to-orange-600',
          badgeBg: 'bg-red-100 text-red-800',
          deals: bbqMatches.slice(0, 3)
        });
      }
    }

    // 3. Slovenska domača kuhinja
    if (cuisines.includes('slovenska')) {
      const localMatches = deals.filter(d => d.isLocal || d.origin === 'Slovenija');
      if (localMatches.length > 0) {
        highlights.push({
          theme: '🇸🇮 Izbrana domača slovenska kakovost',
          subtitle: 'Popusti na lokalno mleko, maslo, kruh in meso',
          color: 'from-emerald-600 to-teal-700',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          deals: localMatches.slice(0, 3)
        });
      }
    }

    return highlights;
  }, [deals, cuisines]);

  // Akcije iz prvenstveno označenih trgovin družine
  const storeDeals = useMemo(() => {
    if (!deals || deals.length === 0) return [];
    
    // Filtriraj najprej po izbranih trgovinah
    const matched = deals.filter(deal => {
      return favoriteStores.some(s => 
        deal.store.toLowerCase().includes(s.toLowerCase()) || 
        s.toLowerCase().includes(deal.store.toLowerCase())
      );
    });

    // Sortiraj po popustu (%) ali razliki v ceni
    matched.sort((a, b) => {
      const savingA = (a.regularPrice && a.discountPrice) ? (a.regularPrice - a.discountPrice) : 0;
      const savingB = (b.regularPrice && b.discountPrice) ? (b.regularPrice - b.discountPrice) : 0;
      return savingB - savingA;
    });

    return matched.slice(0, 4);
  }, [deals, favoriteStores]);

  const isItemOnList = (title) => {
    return currentItems.some(i => i.title.toLowerCase().includes(title.toLowerCase()));
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-white rounded-3xl p-4 sm:p-5 border border-emerald-100/90 shadow-2xs space-y-4">
      
      {/* Glava razdelka */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-emerald-600 text-white shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Priporočeno za {familyName}
            </h3>
            <p className="text-[11px] text-emerald-800/80">
              Prilagojeno vašim najljubšim trgovinam in kulinaričnemu okusu
            </p>
          </div>
        </div>

        {onOpenDealsTab && (
          <button
            onClick={onOpenDealsTab}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
          >
            Vse akcije <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Kulinarične tematske akcije (Azijska, BBQ, Slovenska) */}
      {themeHighlights.length > 0 && (
        <div className="space-y-3">
          {themeHighlights.slice(0, 1).map((highlight, idx) => (
            <div key={idx} className="bg-white/95 rounded-2xl p-3.5 border border-emerald-200/60 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {highlight.theme}
                  </h4>
                  <p className="text-[10px] text-slate-500">{highlight.subtitle}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${highlight.badgeBg}`}>
                  Po vašem okusu
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                {highlight.deals.map(deal => {
                  const onList = isItemOnList(deal.productName);
                  return (
                    <div 
                      key={deal.id}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 mb-0.5">
                          <StoreBadge storeName={deal.store} size="xs" />
                          <span className="text-[10px] text-slate-500 truncate">{deal.store}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {deal.productName}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 block">
                          {deal.discountPrice?.toFixed(2)} €
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={onList}
                        onClick={() => onAddItem({
                          title: deal.productName,
                          category: deal.category || 'ostalo',
                          price: deal.discountPrice,
                          savings: deal.regularPrice ? (deal.regularPrice - deal.discountPrice) : 0,
                          store: deal.store,
                          selectedTier: deal.tier,
                          matchedDealId: deal.id
                        })}
                        className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                          onList
                            ? 'bg-slate-200 text-slate-400 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                        }`}
                        title={onList ? 'Že na seznamu' : 'Dodaj na seznam'}
                      >
                        {onList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Primerjave cen v označenih trgovinah družine */}
      <div className="bg-white/95 rounded-2xl p-3.5 border border-emerald-200/60 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>Top popusti v vaših trgovinah ({favoriteStores.join(', ')})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {storeDeals.map(deal => {
            const onList = isItemOnList(deal.productName);
            return (
              <div
                key={deal.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <StoreBadge storeName={deal.store} size="xs" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {deal.productName}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold block">
                      {deal.discountPrice?.toFixed(2)} €
                      {deal.regularPrice && (
                        <span className="text-slate-400 font-normal line-through ml-1">
                          {deal.regularPrice?.toFixed(2)} €
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={onList}
                  onClick={() => onAddItem({
                    title: deal.productName,
                    category: deal.category || 'ostalo',
                    price: deal.discountPrice,
                    savings: deal.regularPrice ? (deal.regularPrice - deal.discountPrice) : 0,
                    store: deal.store,
                    selectedTier: deal.tier,
                    matchedDealId: deal.id
                  })}
                  className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                    onList
                      ? 'bg-slate-200 text-slate-400 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                  }`}
                  title={onList ? 'Že na seznamu' : 'Dodaj na seznam'}
                >
                  {onList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
