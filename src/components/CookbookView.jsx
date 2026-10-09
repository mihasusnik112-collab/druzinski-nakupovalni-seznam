import React, { useState, useMemo } from 'react';
import { 
  UtensilsCrossed, 
  Search, 
  Clock, 
  Users, 
  Sparkles, 
  ShoppingBag, 
  Plus, 
  Check, 
  CheckCircle2, 
  ChevronRight, 
  Flame, 
  X, 
  ChefHat, 
  Heart, 
  Share2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import StoreBadge from './StoreBadge';
import { CUISINES_OPTIONS, DIETARY_OPTIONS } from '../data/defaultFamilies';
import { findBestDeal } from '../utils/fuzzyMatch';

export default function CookbookView({
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
  const [selectedDiet, setSelectedDiet] = useState('all');
  const [activeRecipe, setActiveRecipe] = useState(null);
  
  // Stanje za uvoz sestavin v modalnem oknu
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [importSuccess, setImportSuccess] = useState(false);

  // Stanje za dodajanje novega recepta
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCuisine, setNewCuisine] = useState('slovenska');
  const [newCookTime, setNewCookTime] = useState('30');
  const [newServings, setNewServings] = useState('4');
  const [newEmoji, setNewEmoji] = useState('🍲');
  const [newIngredientsText, setNewIngredientsText] = useState('');
  const [newInstructionsText, setNewInstructionsText] = useState('');

  // Preveri ujemajoče se akcije za sestavine receptov
  const recipeDealsMap = useMemo(() => {
    const map = new Map();
    recipes.forEach(rec => {
      let dealCount = 0;
      const ingMatches = [];

      rec.ingredients.forEach(ing => {
        const match = findBestDeal(ing.name || ing.keyword, deals);
        if (match?.bestDeal) {
          dealCount++;
          ingMatches.push({
            ingredient: ing.name,
            deal: match.bestDeal
          });
        }
      });

      map.set(rec.id, { dealCount, ingMatches });
    });
    return map;
  }, [recipes, deals]);

  // Filtrirani recepti
  const filteredRecipes = useMemo(() => {
    return recipes.filter(rec => {
      // Iskanje po imenu ali sestavinah
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = rec.title.toLowerCase().includes(q) || (rec.subtitle && rec.subtitle.toLowerCase().includes(q));
        const matchesIng = rec.ingredients.some(i => i.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesIng) return false;
      }

      // Filter po kuhinji
      if (selectedCuisine !== 'all' && rec.cuisine !== selectedCuisine) {
        return false;
      }

      // Filter po dieti
      if (selectedDiet !== 'all') {
        if (!rec.dietaryFlags || !rec.dietaryFlags.includes(selectedDiet)) {
          return false;
        }
      }

      return true;
    });
  }, [recipes, searchQuery, selectedCuisine, selectedDiet]);

  // Odpiranje podrobnosti recepta
  const openRecipeDetails = (rec) => {
    setActiveRecipe(rec);
    // Privzeto so označene vse sestavine, razen tistih, ki so že na seznamu
    const initialSelected = rec.ingredients
      .filter(ing => !currentItems.some(item => item.title.toLowerCase().includes(ing.name.toLowerCase())))
      .map(ing => ing.name);
    // Če so že vse na seznamu, označi vse
    setSelectedIngredients(initialSelected.length > 0 ? initialSelected : rec.ingredients.map(i => i.name));
    setImportSuccess(false);
  };

  const toggleIngredientSelection = (name) => {
    if (selectedIngredients.includes(name)) {
      setSelectedIngredients(selectedIngredients.filter(n => n !== name));
    } else {
      setSelectedIngredients([...selectedIngredients, name]);
    }
  };

  const handleExecuteImport = async () => {
    if (!activeRecipe || selectedIngredients.length === 0) return;
    await onImportIngredients(activeRecipe, selectedIngredients);
    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
    }, 2500);
  };

  const handleCreateRecipeSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Parsiraj sestavine iz vrstic: "200 g testenine" ali "mleko, 1 l"
    const parsedIngredients = newIngredientsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split(',');
        return {
          name: parts[0].trim(),
          quantity: parts[1] ? parts[1].trim() : '1',
          unit: parts[2] ? parts[2].trim() : 'kos',
          category: 'ostalo'
        };
      });

    const parsedInstructions = newInstructionsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const created = {
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Domači recept',
      cuisine: newCuisine,
      cookTime: parseInt(newCookTime) || 30,
      servings: parseInt(newServings) || 4,
      emoji: newEmoji || '🍳',
      ingredients: parsedIngredients.length > 0 ? parsedIngredients : [{ name: 'Sestavine po okusu', quantity: '1', unit: 'porcija' }],
      instructions: parsedInstructions.length > 0 ? parsedInstructions : ['Pripravi in postrezi z ljubeznijo.'],
      dietaryFlags: []
    };

    onAddRecipe(created);
    setIsAddRecipeOpen(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewIngredientsText('');
    setNewInstructionsText('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Glava kuharice z iskanjem in gumbom za nov recept */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-xl shadow-2xs">
              👨‍🍳
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight flex items-center gap-2">
                Pametna kuharica družine
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {recipes.length} receptov
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Povezano z akcijskimi cenami & avtomatski uvoz sestavin na seznam
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddRecipeOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Dodaj recept
          </button>
        </div>

        {/* Iskalna vrstica */}
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

        {/* Filtri po kuhinjah */}
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

      {/* Mreža kartic receptov */}
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
            const dealInfo = recipeDealsMap.get(recipe.id) || { dealCount: 0 };
            return (
              <div
                key={recipe.id}
                onClick={() => openRecipeDetails(recipe)}
                className="bg-white rounded-3xl p-4 border border-slate-200/90 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  {/* Zgornja vrstica kartice */}
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

                  {/* Značke (čas, porcije, akcije) */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700">
                      <Clock className="w-3 h-3 text-slate-400" /> {recipe.cookTime} min
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700">
                      <Users className="w-3 h-3 text-slate-400" /> {recipe.servings} porcije
                    </span>
                    {dealInfo.dealCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                        <Flame className="w-3 h-3 fill-rose-500" /> {dealInfo.dealCount} sestavin v akciji
                      </span>
                    )}
                  </div>
                </div>

                {/* Spodnji gumb za hiter ogled */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:text-amber-700">
                  <span>Prikaži sestavine & uvoz</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL ZA PODROBNOSTI RECEPTA & UVOZ SESTAVIN */}
      {activeRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Glava modala */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl p-2 bg-white/20 backdrop-blur-md rounded-2xl">
                    {activeRecipe.emoji || '🍲'}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold leading-tight">
                      {activeRecipe.title}
                    </h3>
                    <p className="text-xs text-amber-100 mt-0.5">
                      {activeRecipe.subtitle || `${activeRecipe.cookTime} minut • ${activeRecipe.servings} porcije`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveRecipe(null)}
                  className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Vsebina: Sestavine z uvozom & Navodila */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Razdelek sestavin */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-amber-600" /> Sestavine ({activeRecipe.ingredients.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Označi sestavine za uvoz na seznam
                  </span>
                </div>

                <div className="space-y-2">
                  {activeRecipe.ingredients.map((ing, idx) => {
                    const isSelected = selectedIngredients.includes(ing.name);
                    const isAlreadyOnList = currentItems.some(item => 
                      item.title.toLowerCase().includes(ing.name.toLowerCase()) || 
                      ing.name.toLowerCase().includes(item.title.toLowerCase())
                    );
                    const dealMatch = findBestDeal(ing.name || ing.keyword, deals)?.bestDeal;

                    return (
                      <div
                        key={idx}
                        onClick={() => toggleIngredientSelection(ing.name)}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                          isSelected
                            ? 'border-amber-400 bg-amber-50/50 shadow-2xs'
                            : 'border-slate-200 bg-white opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-amber-500 text-white' : 'border border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              {ing.name}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Količina: {ing.quantity} {ing.unit}
                            </span>
                          </div>
                        </div>

                        {/* Indikatorji: na seznamu / v akciji */}
                        <div className="flex items-center gap-2">
                          {dealMatch && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold">
                              <StoreBadge storeName={dealMatch.store} size="xs" />
                              <span>{dealMatch.discountPrice?.toFixed(2)} €</span>
                            </div>
                          )}

                          {isAlreadyOnList && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                              Že na seznamu
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navodila za pripravo */}
              {activeRecipe.instructions && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <UtensilsCrossed className="w-4 h-4 text-amber-600" /> Postopek priprave
                  </h4>
                  <div className="space-y-2">
                    {activeRecipe.instructions.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Spodnji gumb za uvoz sestavin */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs font-medium text-slate-600">
                Izbrano: <strong>{selectedIngredients.length}</strong> od {activeRecipe.ingredients.length}
              </span>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={selectedIngredients.length === 0}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md cursor-pointer ${
                  importSuccess
                    ? 'bg-emerald-600 text-white'
                    : selectedIngredients.length > 0
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/20 active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {importSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Dodano na seznam!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Uvozi izbrane sestavine
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL ZA DODAJANJE NOVEGA RECEPTA */}
      {isAddRecipeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Nov družinski recept</h3>
              </div>
              <button
                onClick={() => setIsAddRecipeOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecipeSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ime jedi / recepta
                </label>
                <input
                  type="text"
                  required
                  placeholder="npr. Domača enolončnica s fižolom"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kuhinja
                  </label>
                  <select
                    value={newCuisine}
                    onChange={(e) => setNewCuisine(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold"
                  >
                    {CUISINES_OPTIONS.map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Čas priprave (min)
                  </label>
                  <input
                    type="number"
                    value={newCookTime}
                    onChange={(e) => setNewCookTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Sestavine (ena na vrstico, npr. "Krompir, 1, kg")
                </label>
                <textarea
                  rows={4}
                  placeholder="Piščančji file, 500, g&#10;Riž, 300, g&#10;Sojina omaka, 2, žlici"
                  value={newIngredientsText}
                  onChange={(e) => setNewIngredientsText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Navodila za pripravo (ena vrstica na korak)
                </label>
                <textarea
                  rows={3}
                  placeholder="1. Meso narežemo in popečemo.&#10;2. Dodamo riž in vodo ter kuhamo 15 min."
                  value={newInstructionsText}
                  onChange={(e) => setNewInstructionsText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-sans focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRecipeOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Prekliči
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs"
                >
                  Shrani recept
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
