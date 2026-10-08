import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  ShoppingBag, 
  Sparkles, 
  AlertCircle, 
  ChevronDown, 
  CheckCheck,
  TrendingDown,
  Layers,
  ArrowRight
} from 'lucide-react';

import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import ItemCard from './components/ItemCard';
import AddItemModal from './components/AddItemModal';
import DealModal from './components/DealModal';
import DealsView from './components/DealsView';
import SettingsModal from './components/SettingsModal';

import { FAMILY_MEMBERS, DEFAULT_FAMILY_MEMBERS } from './data/commonItems';
import { INITIAL_CATEGORIES } from './data/initialCategories';
import { findBestDeal } from './utils/fuzzyMatch';
import { 
  subscribeShoppingList, 
  subscribeCatalogDeals, 
  addShoppingItem, 
  toggleItemStatus, 
  deleteShoppingItem, 
  clearAllCompletedItems,
  updateShoppingItem,
  getLocalMembers,
  saveFamilyMembers,
  subscribeFamilyMembers
} from './services/shoppingService';

export default function App() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'deals'
  const [items, setItems] = useState([]);
  const [deals, setDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [familyMembers, setFamilyMembers] = useState(getLocalMembers);

  const [currentMember, setCurrentMember] = useState(() => {
    const saved = localStorage.getItem('nakupki_current_member');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const initialMembers = getLocalMembers();
    return initialMembers[0] || DEFAULT_FAMILY_MEMBERS[0];
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dealModalData, setDealModalData] = useState(null);
  const [showCompletedSection, setShowCompletedSection] = useState(true);

  // Shrani izbranega člana
  useEffect(() => {
    localStorage.setItem('nakupki_current_member', JSON.stringify(currentMember));
  }, [currentMember]);

  // Naročnina na družinske člane
  useEffect(() => {
    const unsubMembers = subscribeFamilyMembers((updatedMembers) => {
      setFamilyMembers(updatedMembers);
    });
    return () => {
      if (typeof unsubMembers === 'function') unsubMembers();
    };
  }, []);

  // Naročnina na seznam artiklov in akcij
  useEffect(() => {
    const unsubItems = subscribeShoppingList((fetchedItems) => {
      setItems(fetchedItems);
    });

    const unsubDeals = subscribeCatalogDeals((fetchedDeals) => {
      setDeals(fetchedDeals);
    });

    return () => {
      if (typeof unsubItems === 'function') unsubItems();
      if (typeof unsubDeals === 'function') unsubDeals();
    };
  }, []);

  // Sprožitev konfetov
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }, []);

  // Ujemanje akcij za vse artikle
  const itemDealsMap = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      if (item.matchedDealId) {
        // Če ima artikel specifično izbran deal ID
        const specificDeal = deals.find(d => d.id === item.matchedDealId);
        if (specificDeal) {
          const matchResult = findBestDeal(item.title, deals);
          map.set(item.id, {
            bestDeal: specificDeal,
            matchingDeals: matchResult.matchingDeals.length > 0 ? matchResult.matchingDeals : [specificDeal]
          });
          continue;
        }
      }
      // Samodejno iskanje z fuzzy algoritmom
      const res = findBestDeal(item.title, deals);
      if (res.bestDeal) {
        map.set(item.id, res);
      }
    }
    return map;
  }, [items, deals]);

  // Razdelitev na aktivne in kupljene
  const activeItems = useMemo(() => items.filter(i => !i.completed), [items]);
  const completedItems = useMemo(() => items.filter(i => i.completed), [items]);

  // Štetje artiklov po kategorijah za aktivne
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const item of activeItems) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [activeItems]);

  // Filtrirani artikli glede na iskanje in izbrano kategorijo
  const filteredActiveItems = useMemo(() => {
    return activeItems.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return item.title.toLowerCase().includes(query) || (item.quantity && item.quantity.toLowerCase().includes(query));
      }
      return true;
    });
  }, [activeItems, selectedCategory, searchQuery]);

  const filteredCompletedItems = useMemo(() => {
    return completedItems.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return item.title.toLowerCase().includes(query);
      }
      return true;
    });
  }, [completedItems, selectedCategory, searchQuery]);

  // Izračun skupnega potencialnega prihranka
  const totalPotentialSavings = useMemo(() => {
    let sum = 0;
    for (const item of activeItems) {
      const match = itemDealsMap.get(item.id);
      if (match?.bestDeal?.regularPrice && match.bestDeal.discountPrice) {
        sum += (match.bestDeal.regularPrice - match.bestDeal.discountPrice);
      }
    }
    return sum;
  }, [activeItems, itemDealsMap]);

  // Upravljanje artiklov
  const handleToggle = async (itemId, currentStatus) => {
    const wasCompleted = currentStatus;
    await toggleItemStatus(itemId, currentStatus);

    // Če smo pravkar odkljukali zadnji artikel na seznamu
    if (!wasCompleted && activeItems.length === 1) {
      triggerConfetti();
    }
  };

  const handleDelete = async (itemId) => {
    await deleteShoppingItem(itemId);
  };

  const handleClearCompleted = async () => {
    if (confirm('Ali res želite počistiti vse že kupljene artikle?')) {
      await clearAllCompletedItems();
      triggerConfetti();
    }
  };

  const handleOpenDeal = (deal, item) => {
    const match = itemDealsMap.get(item.id);
    setDealModalData({
      deal,
      item,
      alternativeDeals: match?.matchingDeals || [deal]
    });
  };

  const handleSelectAlternativeDeal = async (newDeal) => {
    if (dealModalData?.item) {
      await updateShoppingItem(dealModalData.item.id, {
        matchedDealId: newDeal.id
      });
      setDealModalData(prev => ({
        ...prev,
        deal: newDeal
      }));
    }
  };

  const handleUpdateFamilyMembers = (updated) => {
    setFamilyMembers(updated);
    saveFamilyMembers(updated);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-24 text-slate-800">
      
      {/* Zgornja navigacija */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentMember={currentMember}
        setCurrentMember={setCurrentMember}
        onOpenSettings={() => setIsSettingsOpen(true)}
        familyMembers={familyMembers}
        activeCount={activeItems.length}
        dealsCount={deals.length}
      />

      {/* Glavni vsebinski del */}
      <main className="max-w-2xl mx-auto px-4 pt-4">
        {activeTab === 'list' ? (
          <div className="space-y-4">
            
            {/* Iskalnik in filter kategorij */}
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              categoryCounts={categoryCounts}
            />

            {/* Prihranek pasica (če so zaznane akcije) */}
            {totalPotentialSavings > 0 && (
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white shadow-md shadow-emerald-600/15 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black">
                    🏷️
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">
                      Pametni AI prihranek
                    </div>
                    <div className="text-xs font-medium">
                      Z izbiro akcij lahko družina prihrani:
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black tracking-tight">
                    ~{totalPotentialSavings.toFixed(2)} €
                  </div>
                </div>
              </div>
            )}

            {/* Aktivni artikli (neodkljukano) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Potrebujemo za kupiti
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">
                    {filteredActiveItems.length}
                  </span>
                </div>
              </div>

              {filteredActiveItems.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
                    🛒
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {searchQuery ? 'Ni najdenih ujemajočih se artiklov' : 'Nakupovalni seznam je prazen!'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    {searchQuery 
                      ? 'Poskusite spremeniti iskalni niz ali počistiti kategorijski filter.' 
                      : 'Vsi artikli so že nakupljeni ali pa še niste dodali nobenega izdelka.'}
                  </p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Dodaj prvi artikel</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredActiveItems.map((item) => {
                    const match = itemDealsMap.get(item.id);
                    return (
                      <ItemCard
                        key={item.id}
                        item={item}
                        deal={match?.bestDeal}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onOpenDeal={(deal) => handleOpenDeal(deal, item)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Kupljeni artikli (prečrtano, sivo ozadje) */}
            {completedItems.length > 0 && (
              <div className="pt-4 border-t border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <button
                    onClick={() => setShowCompletedSection(!showCompletedSection)}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition"
                  >
                    <span>V vozičku / Kupljeno ({filteredCompletedItems.length})</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCompletedSection ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    onClick={handleClearCompleted}
                    className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg transition"
                    title="Počisti vse kupljene"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Počisti kupljeno</span>
                  </button>
                </div>

                {showCompletedSection && (
                  <div className="space-y-2">
                    {filteredCompletedItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        deal={null}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onOpenDeal={() => {}}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          /* Zavihek za pregled vseh akcij slovenskih trgovcev */
          <DealsView
            deals={deals}
            onAddDealToShoppingList={addShoppingItem}
            currentMember={currentMember}
          />
        )}
      </main>

      {/* Plavajoči gumb za hitro dodajanje na mobilnem telefonu (Floating Action Button) */}
      {activeTab === 'list' && (
        <div className="fixed bottom-6 right-6 sm:hidden z-30">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/40 active:scale-95 transition cursor-pointer"
            aria-label="Dodaj nov artikel"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Modal za dodajanje artikla */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addShoppingItem}
        currentMember={currentMember}
        familyMembers={familyMembers}
        deals={deals}
      />

      {/* Modal za podrobnosti akcije in primerjavo */}
      {dealModalData && (
        <DealModal
          isOpen={Boolean(dealModalData)}
          onClose={() => setDealModalData(null)}
          deal={dealModalData.deal}
          item={dealModalData.item}
          alternativeDeals={dealModalData.alternativeDeals}
          onSelectAlternative={handleSelectAlternativeDeal}
        />
      )}

      {/* Modal za nastavitve & Uporabnike & Firebase */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        familyMembers={familyMembers}
        onUpdateFamilyMembers={handleUpdateFamilyMembers}
        currentMember={currentMember}
        onSelectCurrentMember={setCurrentMember}
      />

    </div>
  );
}
