import React, { useState, useMemo } from 'react';
import { Search, Flame, Plus, Check, ExternalLink, Calendar, Store, Filter } from 'lucide-react';
import { STORE_INFO, INITIAL_CATEGORIES } from '../data/initialCategories';

export default function DealsView({
  deals = [],
  onAddDealToShoppingList,
  currentMember
}) {
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedDealIds, setAddedDealIds] = useState(new Set());

  const stores = ['Spar', 'Lidl', 'Hofer', 'Mercator', 'dm', 'Müller'];

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      // Filter po trgovini
      if (selectedStore !== 'all' && deal.store !== selectedStore) {
        return false;
      }
      // Filter po kategoriji
      if (selectedCategory !== 'all' && deal.category !== selectedCategory) {
        return false;
      }
      // Iskalni filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = deal.productName?.toLowerCase().includes(query);
        const keywordMatch = deal.normalizedKeyword?.toLowerCase().includes(query);
        const storeMatch = deal.store?.toLowerCase().includes(query);
        if (!nameMatch && !keywordMatch && !storeMatch) {
          return false;
        }
      }
      return true;
    });
  }, [deals, selectedStore, selectedCategory, searchQuery]);

  const handleAdd = (deal) => {
    onAddDealToShoppingList({
      title: deal.productName,
      category: deal.category || 'ostalo',
      quantity: deal.unit || '1 kos',
      addedBy: currentMember?.name || 'Mami',
      matchedDealId: deal.id
    });

    setAddedDealIds(prev => new Set([...prev, deal.id]));

    setTimeout(() => {
      setAddedDealIds(prev => {
        const next = new Set(prev);
        next.delete(deal.id);
        return next;
      });
    }, 2500);
  };

  return (
    <div className="space-y-4">
      {/* Glava zavihka akcij */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-5 text-white shadow-lg shadow-emerald-700/10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-100 mb-1">
          <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
          <span>Pametna analiza letakov</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight">Aktualne akcije trgovcev</h2>
        <p className="text-xs text-white/80 mt-1 max-w-md">
          Preglej znižanja v Šparu, Lidlu, Hoferju, Mercatorju, dm in Müllerju ter jih z enim klikom dodaj na družinski seznam!
        </p>
      </div>

      {/* Kartice trgovcev (Filter po trgovcih z logotipi) */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <button
          onClick={() => setSelectedStore('all')}
          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-xs font-semibold ${
            selectedStore === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-lg mb-1">🏬</span>
          <span>Vsi trgovci</span>
        </button>

        {stores.map((store) => {
          const info = STORE_INFO[store] || {};
          const isSelected = selectedStore === store;

          return (
            <button
              key={store}
              onClick={() => setSelectedStore(isSelected ? 'all' : store)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-xs font-semibold ${
                isSelected
                  ? `${info.color} text-white border-transparent shadow-md ring-2 ring-offset-1 ring-slate-400`
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg mb-1">{info.logo || '🛒'}</span>
              <span>{store}</span>
            </button>
          );
        })}
      </div>

      {/* Iskalnik po akcijah */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Išči po akcijah (npr. mleko, maslo, pivo, Ariel)..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition"
        />
      </div>

      {/* Seznam kartic akcij */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Najdenih akcij: <strong className="text-slate-800">{filteredDeals.length}</strong></span>
          {selectedStore !== 'all' && (
            <span className="font-medium text-emerald-700">Trgovec: {selectedStore}</span>
          )}
        </div>

        {filteredDeals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-6">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="text-sm font-bold text-slate-800">Ni zadetkov med akcijami</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Za izbrano poizvedbo ali trgovca trenutno ni najdenih ujemajočih se znižanj v katalogu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredDeals.map((deal) => {
              const isAdded = addedDealIds.has(deal.id);
              const store = STORE_INFO[deal.store] || {};

              return (
                <div
                  key={deal.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Zgornja vrstica kartice akcije */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${store.badgeColor || 'bg-slate-100 text-slate-800'}`}>
                        <span>{store.logo || '🛒'}</span>
                        <span>{deal.store}</span>
                      </span>

                      {deal.discountPercentage && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500 text-white text-[11px] font-bold shadow-xs">
                          <Flame className="w-3 h-3 fill-white" />
                          <span>{deal.discountPercentage}</span>
                        </span>
                      )}
                    </div>

                    {/* Naziv izdelka */}
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {deal.productName}
                    </h3>

                    {deal.highlight && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {deal.highlight}
                      </span>
                    )}
                  </div>

                  {/* Spodnji del kartice: cene in gumb za dodajanje na seznam */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-lg font-black text-emerald-600 leading-tight">
                        {deal.discountPrice?.toFixed(2)} €
                        <span className="text-[11px] font-normal text-slate-500 ml-1">/{deal.unit}</span>
                      </div>
                      {deal.regularPrice && (
                        <div className="text-[11px] text-slate-400 line-through">
                          Redna: {deal.regularPrice?.toFixed(2)} €
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleAdd(deal)}
                      disabled={isAdded}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
                        isAdded
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Dodano!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Dodaj na seznam</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
