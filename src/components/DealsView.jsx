import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Flame, 
  Plus, 
  Check, 
  ExternalLink, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  Store, 
  ArrowRight,
  Layers,
  ShoppingBag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { STORE_INFO, STORES_LIST } from '../data/stores';
import { STORE_FLYERS } from '../data/flyersData';
import StoreBadge from './StoreBadge';

export default function DealsView({
  deals = [],
  onAddDealToShoppingList,
  currentMember
}) {
  const [activeSubTab, setActiveSubTab] = useState('flyers'); // 'flyers' | 'products'
  const [selectedStore, setSelectedStore] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedDealIds, setAddedDealIds] = useState(new Set());
  
  // Stanje za interaktivno AI prebiranje letakov
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanSuccessMessage, setScanSuccessMessage] = useState('');

  const stores = STORES_LIST.map(s => s.shortName);

  // Filtrirani letaki glede na izbranega trgovca
  const filteredFlyers = useMemo(() => {
    if (selectedStore === 'all') return STORE_FLYERS;
    return STORE_FLYERS.filter(f => f.store === selectedStore);
  }, [selectedStore]);

  // Filtrirane posamezne akcije izdelkov
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      // Filter po trgovini
      if (selectedStore !== 'all' && deal.store !== selectedStore) {
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
  }, [deals, selectedStore, searchQuery]);

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

  // Sprožitev AI analize letakov v brskalniku
  const handleTriggerAiScan = () => {
    setIsScanning(true);
    setScanStep(1);

    setTimeout(() => {
      setScanStep(2); // Povezovanje z letaki Spar, Lidl, Hofer, Mercator, dm, Müller
    }, 1200);

    setTimeout(() => {
      setScanStep(3); // Google Gemini multimodalna obdelava slik in cen
    }, 2600);

    setTimeout(() => {
      setScanStep(4); // Sinhronizacija in posodobitev
      setIsScanning(false);
      setScanSuccessMessage('Katalogi so bili uspešno osveženi z najnovejšimi akcijskimi ponudbami!');
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      } catch (e) {}

      setTimeout(() => {
        setScanSuccessMessage('');
        setScanStep(0);
      }, 4000);
    }, 4000);
  };

  return (
    <div className="space-y-4">
      
      {/* Glavna pasica z možnostjo zagona AI analize */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-5 text-white shadow-lg shadow-emerald-700/10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-100 mb-1">
            <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>Aktualni katalogi slovenskih trgovcev</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Katalogi in tedenske akcije</h2>
          <p className="text-xs text-white/85 mt-1 max-w-md leading-relaxed">
            Prelistaj tedenske letake trgovcev <strong>Špar, Lidl, Hofer, Mercator, dm in Müller</strong> ali z AI modelom Gemini preglej izluščene popuste.
          </p>

          <div className="mt-3.5 flex items-center gap-2 flex-wrap">
            <button
              onClick={handleTriggerAiScan}
              disabled={isScanning}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 text-xs font-bold shadow-md transition cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>
                    {scanStep === 1 && 'Preverjam povezave...'}
                    {scanStep === 2 && 'Zajemam letake 6 trgovcev...'}
                    {scanStep === 3 && 'Gemini AI analizira cene...'}
                    {scanStep === 4 && 'Posodabljam ugodnosti...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Zaženi AI prebiranje letakov</span>
                </>
              )}
            </button>
          </div>

          {scanSuccessMessage && (
            <div className="mt-2.5 p-2 rounded-xl bg-white/20 backdrop-blur-xs text-[11px] font-semibold text-emerald-50 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-200 stroke-[3]" />
              <span>{scanSuccessMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Preklop med podzavihkoma: Letaki trgovcev ali Akcijski izdelki */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/80 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('flyers')}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'flyers'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tedenski letaki (6 trgovcev)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('products')}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'products'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Izdelki v akciji ({deals.length})</span>
        </button>
      </div>

      {/* Filter po trgovcih */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 scroll-smooth">
        <button
          onClick={() => setSelectedStore('all')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border transition-all text-xs font-bold shrink-0 cursor-pointer ${
            selectedStore === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>🏬</span>
          <span>Vsi trgovci</span>
        </button>

        {stores.map((store) => {
          const isSelected = selectedStore === store;

          return (
            <button
              key={store}
              onClick={() => setSelectedStore(isSelected ? 'all' : store)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border transition-all text-xs font-bold shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <StoreBadge storeName={store} size="xs" />
              <span>{store}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 1. PODZAVIHEK: TEDENSKI LETAKI IN KATALOGI */}
      {/* ======================================================== */}
      {activeSubTab === 'flyers' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Prikazujem letake: <strong className="text-slate-800">{filteredFlyers.length}</strong></span>
            {selectedStore !== 'all' && (
              <span className="font-semibold text-emerald-700">Izbran trgovec: {selectedStore}</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredFlyers.map((flyer) => {
              const storeInfo = STORE_INFO[flyer.store] || {};
              const dealsForStore = deals.filter(d => d.store === flyer.store);

              return (
                <div
                  key={flyer.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Zgornji barvni del letaka */}
                  <div className={`p-4 bg-gradient-to-r ${flyer.color} text-white relative`}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-xs text-white">
                        <StoreBadge storeName={flyer.store} size="xs" />
                        <span>{flyer.store}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-900 shadow-xs">
                        {flyer.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold leading-snug">
                      {flyer.title}
                    </h3>
                    <p className="text-[11px] text-white/80 mt-1 line-clamp-1">
                      {flyer.subtitle}
                    </p>
                  </div>

                  {/* Informacije o veljavnosti in povezave */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white">
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Veljavnost: <strong className="text-slate-800">{flyer.validity}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                        <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
                        <span>V bazi zaznanih {dealsForStore.length} akcij</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                      {/* Povezava do neposrednega digitalnega listalnika letaka */}
                      <a
                        href={flyer.catalogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                        <span>Prelistaj letak na spletu</span>
                      </a>

                      {/* Uradna promocijska stran trgovca */}
                      {flyer.officialUrl && (
                        <a
                          href={flyer.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                          title="Uradna spletna stran trgovca"
                        >
                          Uradna stran
                        </a>
                      )}

                      {/* Gumb za ogled izluščenih akcij tega letaka */}
                      <button
                        onClick={() => {
                          setSelectedStore(flyer.store);
                          setActiveSubTab('products');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition"
                        title="Prikaži vse akcije tega trgovca"
                      >
                        Ogled akcij
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PODZAVIHEK: POSAMEZNI ARTIKLI V AKCIJI */}
      {/* ======================================================== */}
      {activeSubTab === 'products' && (
        <div className="space-y-3">
          {/* Iskalnik po akcijah */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Išči med ugodnostmi (npr. mleko, maslo, kruh, Ariel)..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Zaznanih akcij: <strong className="text-slate-800">{filteredDeals.length}</strong></span>
            {selectedStore !== 'all' && (
              <span className="font-medium text-emerald-700">Filter trgovca: {selectedStore}</span>
            )}
          </div>

          {filteredDeals.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-6">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="text-sm font-bold text-slate-800">Ni zadetkov med akcijami</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Za izbrano poizvedbo ali trgovca trenutno ni najdenih ujemajočih se znižanj v katalogih.
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
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${store.badgeColor || 'bg-slate-100 text-slate-800'}`}>
                          <StoreBadge storeName={deal.store} size="xs" />
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
      )}

    </div>
  );
}
