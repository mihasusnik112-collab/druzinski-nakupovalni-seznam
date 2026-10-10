import React, { useState, useMemo } from 'react';
import { 
  UtensilsCrossed, 
  Search, 
  Clock, 
  Users, 
  Sparkles, 
  ShoppingBag, 
  Plus, 
  ChevronRight, 
  Flame, 
  X, 
  ChefHat, 
  Zap,
  Wand2,
  Trash2
} from 'lucide-react';
import RecipeDetailsModal from './RecipeDetailsModal';
import AddRecipeModal from './AddRecipeModal';
import { CUISINES_OPTIONS } from '../data/defaultFamilies';
import { findBestDeal } from '../utils/fuzzyMatch';

export default function RecipeBook({
  recipes = [],
  deals = [],
  currentItems = [],
  activeFamily = null,
  onImportIngredients,
  onAddRecipe,
  onDeleteRecipe
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [activeRecipe, setActiveRecipe] = useState(null);

  // Stanje za modal novega recepta
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);

  // AI predlog tedna: Poišče recept glede na priljubljene kuhinje družine in popuste
  const aiWeeklySuggestion = useMemo(() => {
    if (!recipes || recipes.length === 0) return null;
    const favoriteCuisines = activeFamily?.preferences?.cuisines || ['slovenska', 'azijska'];

    const scored = recipes.map(rec => {
      let score = 0;
      if (favoriteCuisines.includes(rec.cuisine)) score += 5;
      
      let dealMatches = 0;
      rec.ingredients.forEach(ing => {
        const match = findBestDeal(ing.name || ing.keyword, deals);
        if (match?.bestDeal) dealMatches++;
      });
      score += dealMatches * 3;

      return { recipe: rec, score, dealMatches };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0];
  }, [recipes, activeFamily, deals]);

  // Izračun akcij za vsak recept
  const recipeDealsMap = useMemo(() => {
    const map = new Map();
    recipes.forEach(rec => {
      let dealCount = 0;
      rec.ingredients.forEach(ing => {
        const match = findBestDeal(ing.name || ing.keyword, deals);
        if (match?.bestDeal) dealCount++;
      });
      map.set(rec.id, dealCount);
    });
    return map;
  }, [recipes, deals]);

  // Filtrirani recepti
  const filteredRecipes = useMemo(() => {
    return recipes.filter(rec => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = rec.title.toLowerCase().includes(q) || (rec.subtitle && rec.subtitle.toLowerCase().includes(q));
        const matchesIng = rec.ingredients.some(i => i.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesIng) return false;
      }

      if (selectedCuisine !== 'all' && rec.cuisine !== selectedCuisine) {
        return false;
      }

      return true;
    });
  }, [recipes, searchQuery, selectedCuisine]);

  // Funkcija za AI predlog tedna gumb
  const triggerAiSuggestion = () => {
    if (aiWeeklySuggestion?.recipe) {
      setActiveRecipe(aiWeeklySuggestion.recipe);
    }
  };


  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Glava z AI Predlogom tedna in gumbom za nov recept */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-xl shadow-2xs">
              👨‍🍳
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight flex items-center gap-2">
                Pametna knjiga receptov
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {recipes.length} jedi
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Povezano z akcijami slovenskih trgovcev & uvoz z enim klikom
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Predlog tedna gumb */}
            <button
              onClick={triggerAiSuggestion}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer shrink-0"
              title="Predlog glede na najljubše kuhinje in popuste v trgovinah"
            >
              <Wand2 className="w-3.5 h-3.5" /> AI predlog tedna
            </button>

            <button
              onClick={() => setIsAddRecipeOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer shrink-0 border border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Nov recept / AI</span>
            </button>
          </div>
        </div>

        {/* AI Poudarek tedna (Če obstaja) */}
        {aiWeeklySuggestion?.recipe && (
          <div 
            onClick={() => setActiveRecipe(aiWeeklySuggestion.recipe)}
            className="p-3 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/50 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-3 cursor-pointer hover:border-amber-400 transition"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1 bg-white rounded-xl shadow-2xs">
                {aiWeeklySuggestion.recipe.emoji || '🍲'}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-1.5 py-0.2 rounded-md">
                    ✨ AI predlog tedna
                  </span>
                  {aiWeeklySuggestion.dealMatches > 0 && (
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-rose-500" /> {aiWeeklySuggestion.dealMatches} v akciji
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                  {aiWeeklySuggestion.recipe.title}
                </h4>
              </div>
            </div>

            <span className="text-xs font-bold text-amber-700 flex items-center gap-1 shrink-0">
              Kuhaj to <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        )}

        {/* Iskalnik */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Išči po jedi ali sestavini (npr. testenine, juha, meso)..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter po kuhinjah */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCuisine('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCuisine === 'all'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            Vse kuhinje
          </button>
          {CUISINES_OPTIONS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCuisine(c.id)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCuisine === c.id
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mreža receptov */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
          <ChefHat className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">Ni najdenih receptov</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Poskusite spremeniti iskalni niz ali izberite drugo kulinarično kategorijo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredRecipes.map(recipe => {
            const dealsCount = recipeDealsMap.get(recipe.id) || 0;
            return (
              <div
                key={recipe.id}
                onClick={() => setActiveRecipe(recipe)}
                className="bg-white rounded-3xl p-4 border border-slate-200/90 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl p-1 bg-amber-50 rounded-2xl group-hover:scale-110 transition-transform">
                        {recipe.emoji || '🍲'}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition leading-snug">
                          {recipe.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {recipe.subtitle || recipe.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700">
                      <Clock className="w-3 h-3 text-slate-400" /> {recipe.cookTime} min
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700">
                      <Users className="w-3 h-3 text-slate-400" /> {recipe.servings} porcije
                    </span>
                    {dealsCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-100 text-rose-700">
                        <Flame className="w-3 h-3 fill-rose-500" /> {dealsCount} v akciji
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:text-amber-700">
                  <span>Kuhaj to & Prenesi v košarico</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL ZA PODROBNOSTI RECEPTA */}
      <RecipeDetailsModal
        isOpen={Boolean(activeRecipe)}
        onClose={() => setActiveRecipe(null)}
        recipe={activeRecipe}
        deals={deals}
        currentItems={currentItems}
        onImportIngredients={onImportIngredients}
      />

      {/* MODAL ZA NOV RECEPT IN AI ISKANJE */}
      <AddRecipeModal
        isOpen={isAddRecipeOpen}
        onClose={() => setIsAddRecipeOpen(false)}
        onAddRecipe={onAddRecipe}
        onImportIngredients={onImportIngredients}
        deals={deals}
        currentItems={currentItems}
        activeFamily={activeFamily}
      />

    </div>
  );
}
