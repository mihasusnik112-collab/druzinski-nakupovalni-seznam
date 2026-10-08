import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Sparkles, Flame, Check, Tag } from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/initialCategories';
import { COMMON_ITEMS, FAMILY_MEMBERS } from '../data/commonItems';
import { findBestDeal } from '../utils/fuzzyMatch';

export default function AddItemModal({
  isOpen,
  onClose,
  onAdd,
  currentMember,
  deals = []
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('mlecno');
  const [quantity, setQuantity] = useState('1 kos');
  const [addedBy, setAddedBy] = useState(currentMember?.name || 'Mami');

  useEffect(() => {
    if (currentMember?.name) {
      setAddedBy(currentMember.name);
    }
  }, [currentMember]);

  // Pametno zaznavanje akcije v živo med tipkanjem
  const liveDealResult = useMemo(() => {
    if (!title.trim() || title.trim().length < 2) return null;
    return findBestDeal(title, deals);
  }, [title, deals]);

  // Filtrirani predlogi pogostih artiklov glede na vnos
  const filteredSuggestions = useMemo(() => {
    if (!title.trim()) {
      return COMMON_ITEMS.slice(0, 8);
    }
    const clean = title.toLowerCase().trim();
    return COMMON_ITEMS.filter(item => 
      item.title.toLowerCase().includes(clean)
    ).slice(0, 6);
  }, [title]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      category,
      quantity: quantity.trim() || '1 kos',
      addedBy,
      matchedDealId: liveDealResult?.bestDeal?.id || null
    });

    setTitle('');
    setQuantity('1 kos');
    onClose();
  };

  const handleSelectSuggestion = (item) => {
    setTitle(item.title);
    setCategory(item.category);
    if (item.unit) {
      setQuantity(item.unit);
    }
  };

  const quantityShortcuts = ['1 kos', '2 kosa', '500 g', '1 kg', '1 l', '1 pak'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-200"
      >
        {/* Header z ročajem za poteg */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 pt-3 pb-3 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="sm:hidden w-12 h-1 bg-slate-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Nov artikel na seznam</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition mt-2 sm:mt-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Naziv artikla */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Ime artikla ali živila
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="npr. Mleko, Maslo, Banane..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition shadow-xs"
            />

            {/* Zaznana akcija v živo */}
            {liveDealResult?.bestDeal && (
              <div className="mt-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-300 flex items-center justify-between text-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800">
                      Najdena akcija pri {liveDealResult.bestDeal.store}:
                    </span>
                    <span className="ml-1 text-slate-600 truncate">
                      {liveDealResult.bestDeal.productName}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-emerald-700 text-sm">
                    {liveDealResult.bestDeal.discountPrice?.toFixed(2)} €
                  </span>
                  {liveDealResult.bestDeal.discountPercentage && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-md bg-rose-500 text-white font-bold text-[10px]">
                      {liveDealResult.bestDeal.discountPercentage}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pogosti predlogi (hitri dotik) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-500">Hitri predlogi:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filteredSuggestions.map((item) => (
                <button
                  type="button"
                  key={item.title}
                  onClick={() => handleSelectSuggestion(item)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition ${
                    title.toLowerCase() === item.title.toLowerCase()
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-100/80 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Količina z bližnjicami */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Količina / Opomba
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="npr. 1 kos, 500 g, za peko..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition"
              />
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mt-2">
              {quantityShortcuts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setQuantity(q)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    quantity === q
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Mrežni prikaz kategorij (Touch-friendly grid) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Izbira kategorije
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto no-scrollbar p-0.5">
              {INITIAL_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl shrink-0">{cat.emoji}</span>
                    <span className={`text-xs font-semibold truncate ${isSelected ? 'text-emerald-950 font-bold' : 'text-slate-700'}`}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kdo dodaja */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Družinski član (kdo dodaja)
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {FAMILY_MEMBERS.map((m) => (
                <button
                  type="button"
                  key={m.name}
                  onClick={() => setAddedBy(m.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                    addedBy === m.name
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{m.avatar}</span>
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gumbi na dnu */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition"
            >
              Prekliči
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Dodaj na seznam</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
