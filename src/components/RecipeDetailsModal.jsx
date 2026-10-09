import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Clock, 
  Users, 
  Check, 
  CheckCircle2, 
  Flame, 
  UtensilsCrossed, 
  ChefHat, 
  Store, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import StoreBadge from './StoreBadge';
import { findBestDeal } from '../utils/fuzzyMatch';

export default function RecipeDetailsModal({
  isOpen,
  onClose,
  recipe,
  deals = [],
  currentItems = [],
  onImportIngredients
}) {
  if (!isOpen || !recipe) return null;

  // Preglej vsako sestavino za akcije in preveri, ali je že na seznamu
  const [selectedIngredients, setSelectedIngredients] = useState(() => {
    // Odkljukaj sestavine, ki jih uporabnik morda že ima (sol, olje, vodo) ali so že na seznamu
    const basicPantry = ['sol', 'poper', 'voda', 'olje za peko', 'olje'];
    return recipe.ingredients
      .filter(ing => {
        const isBasic = basicPantry.some(p => ing.name.toLowerCase() === p);
        const onList = currentItems.some(i => i.title.toLowerCase().includes(ing.name.toLowerCase()));
        return !isBasic && !onList;
      })
      .map(ing => ing.name);
  });

  const [importSuccess, setImportSuccess] = useState(false);

  const toggleIngredient = (name) => {
    if (selectedIngredients.includes(name)) {
      setSelectedIngredients(selectedIngredients.filter(n => n !== name));
    } else {
      setSelectedIngredients([...selectedIngredients, name]);
    }
  };

  const handleImport = async () => {
    if (selectedIngredients.length === 0) return;
    await onImportIngredients(recipe, selectedIngredients);
    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-5 text-white shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl p-2 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xs">
                {recipe.emoji || '🍲'}
              </span>
              <div>
                <h3 className="text-lg font-bold leading-tight">
                  {recipe.title}
                </h3>
                <p className="text-xs text-amber-100 mt-0.5">
                  {recipe.subtitle || `${recipe.cookTime} min • ${recipe.servings} porcije`}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white/20 text-white">
                    <Clock className="w-3 h-3" /> {recipe.cookTime} min
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white/20 text-white">
                    <Users className="w-3 h-3" /> {recipe.servings} porcije
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white/20 text-white capitalize">
                    {recipe.cuisine}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Telo */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Čarovnik za sestavine */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-600" /> Sestavine ({recipe.ingredients.length})
              </h4>
              <span className="text-[11px] text-slate-500">
                Odkljukaj, kar imaš doma
              </span>
            </div>

            <div className="space-y-2">
              {recipe.ingredients.map((ing, idx) => {
                const isSelected = selectedIngredients.includes(ing.name);
                const isAlreadyOnList = currentItems.some(item => 
                  item.title.toLowerCase().includes(ing.name.toLowerCase()) || 
                  ing.name.toLowerCase().includes(item.title.toLowerCase())
                );
                const dealMatch = findBestDeal(ing.name || ing.keyword, deals)?.bestDeal;

                return (
                  <div
                    key={idx}
                    onClick={() => toggleIngredient(ing.name)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50/50 shadow-2xs'
                        : 'border-slate-200 bg-white opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-500 text-white shadow-2xs' : 'border border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${isSelected ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                          {ing.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {ing.quantity} {ing.unit}
                        </span>
                      </div>
                    </div>

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
          {recipe.instructions && (
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4 text-amber-600" /> Postopek priprave
              </h4>
              <div className="space-y-2">
                {recipe.instructions.map((step, idx) => (
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

        {/* Spodnji gumb za prenos v nakupovalni seznam */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs font-medium text-slate-600">
            Za nakup: <strong>{selectedIngredients.length}</strong> sestavin
          </span>

          <button
            type="button"
            onClick={handleImport}
            disabled={selectedIngredients.length === 0}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md cursor-pointer ${
              importSuccess
                ? 'bg-emerald-600 text-white'
                : selectedIngredients.length > 0
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {importSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Dodano na seznam!
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Dodaj sestavine na seznam
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
