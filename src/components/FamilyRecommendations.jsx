import React, { useMemo } from 'react';
import { 
  Sparkles, 
  ChefHat, 
  Plus, 
  ChevronRight, 
  Store, 
  UtensilsCrossed, 
  ShieldCheck, 
  Flame,
  Check
} from 'lucide-react';
import StoreBadge from './StoreBadge';
import { findBestDeal } from '../utils/fuzzyMatch';

export default function FamilyRecommendations({
  activeFamily,
  deals = [],
  recipes = [],
  currentItems = [],
  onAddItem,
  onOpenRecipe
}) {
  const preferences = activeFamily?.preferences || {};
  const favoriteStores = preferences.favoriteStores || ['spar', 'lidl', 'hofer'];
  const favoriteCuisines = preferences.cuisines || ['slovenska', 'italijanska'];

  // 1. Priporočene akcije v najljubših trgovinah družine
  const recommendedDeals = useMemo(() => {
    if (!deals || deals.length === 0) return [];
    
    // Filtriraj akcije glede na najljubše trgovine družine
    const storeDeals = deals.filter(deal => {
      const matchStore = favoriteStores.some(s => 
        deal.store.toLowerCase().includes(s.toLowerCase()) || 
        s.toLowerCase().includes(deal.store.toLowerCase())
      );
      return matchStore;
    });

    // Poudari artikle, ki ustrezajo prehranskim zahtevam (npr. lokalno, bio)
    const prioritized = storeDeals.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      if (a.isLocal) scoreA += 2;
      if (b.isLocal) scoreB += 2;
      if (a.isBio) scoreA += 1;
      if (b.isBio) scoreB += 1;
      return scoreB - scoreA;
    });

    // Vzemi top 4 unikatne
    return prioritized.slice(0, 4);
  }, [deals, favoriteStores]);

  // 2. Najboljši predlog kosila za danes
  const suggestedRecipe = useMemo(() => {
    if (!recipes || recipes.length === 0) return null;

    // Poišči recept, ki se ujema s priljubljeno kuhinjo in ima največ sestavin v akciji
    const scored = recipes.map(rec => {
      let score = 0;
      if (favoriteCuisines.includes(rec.cuisine)) score += 5;
      
      let dealMatches = 0;
      rec.ingredients.forEach(ing => {
        const match = findBestDeal(ing.name || ing.keyword, deals);
        if (match?.bestDeal) dealMatches++;
      });
      score += dealMatches * 2;

      return { recipe: rec, score, dealMatches };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0];
  }, [recipes, favoriteCuisines, deals]);

  // Ali je artikel že na seznamu
  const isItemOnList = (title) => {
    return currentItems.some(item => 
      item.title.toLowerCase().includes(title.toLowerCase()) || 
      title.toLowerCase().includes(item.title.toLowerCase())
    );
  };

  if (!activeFamily) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-cyan-50/60 rounded-3xl p-4 sm:p-5 border border-emerald-100/90 shadow-2xs space-y-4">
      
      {/* Glava priporočil */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-600 text-white shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Priporočeno za {activeFamily.familyName}
            </h3>
            <p className="text-[11px] text-emerald-800/80">
              Prilagojeno vašim trgovinam in prehranskim preferencam
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* KARTICA 1: KOSILO DNEVA */}
        {suggestedRecipe && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3.5 border border-emerald-200/60 flex flex-col justify-between hover:shadow-sm transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <ChefHat className="w-3 h-3" /> Kuharski predlog dneva
                </span>
                {suggestedRecipe.dealMatches > 0 && (
                  <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                    <Flame className="w-3 h-3 fill-rose-500" /> {suggestedRecipe.dealMatches} v akciji
                  </span>
                )}
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-3xl p-1 bg-amber-50 rounded-xl">
                  {suggestedRecipe.recipe.emoji || '🍲'}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {suggestedRecipe.recipe.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {suggestedRecipe.recipe.subtitle || `${suggestedRecipe.recipe.cookTime} min • ${suggestedRecipe.recipe.servings} porcije`}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenRecipe && onOpenRecipe(suggestedRecipe.recipe)}
              className="mt-3 w-full py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs"
            >
              <span>Odpri recept & uvozi sestavine</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* KARTICA 2: AKCIJE V PRILJUBLJENIH TRGOVINAH */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3.5 border border-emerald-200/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                <Store className="w-3 h-3" /> Akcije v vaših trgovinah
              </span>
              <span className="text-[10px] text-slate-400">
                {favoriteStores.length} trgovin
              </span>
            </div>

            <div className="space-y-1.5">
              {recommendedDeals.slice(0, 3).map(deal => {
                const onList = isItemOnList(deal.productName);
                return (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition"
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
                          ? 'bg-slate-100 text-slate-400 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                      }`}
                      title={onList ? 'Že na seznamu' : 'Dodaj na seznam'}
                    >
                      {onList ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
