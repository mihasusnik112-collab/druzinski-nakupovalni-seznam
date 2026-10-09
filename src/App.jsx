import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  ShoppingBag, 
  Sparkles, 
  ChevronDown, 
  Layers
} from 'lucide-react';

import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import ShoppingList from './components/ShoppingList';
import DealsView from './components/DealsView';
import AddItemModal from './components/AddItemModal';
import DealComparison from './components/DealComparison';
import UserManager from './components/UserManager';
import SettingsModal from './components/SettingsModal';
import LiveShoppingBar from './components/LiveShoppingBar';
import CheckoutModal from './components/CheckoutModal';
import PurchaseHistory from './components/PurchaseHistory';
import SmartShortcuts from './components/SmartShortcuts';
import RecipeBook from './components/RecipeBook';
import RecipeDetailsModal from './components/RecipeDetailsModal';
import OnboardingWizard from './components/OnboardingWizard';
import FamilySwitcher from './components/FamilySwitcher';
import PersonalizedDeals from './components/PersonalizedDeals';
import FamilyRecommendations from './components/FamilyRecommendations';

import { DEFAULT_FAMILY_MEMBERS } from './data/commonItems';
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
  subscribeFamilyMembers,
  getLocalActiveUser,
  saveLocalActiveUser,
  getLocalActiveSession,
  saveLocalActiveSession,
  clearLocalActiveSession,
  getLocalPurchaseHistory,
  archiveShoppingSession,
  subscribePurchaseHistory,
  deletePurchaseHistoryItem,
  clearAllPurchaseHistory,
  getLocalFrequencies,
  subscribeFrequencies,
  getActiveFamily,
  subscribeActiveFamily,
  setActiveFamily,
  updateActiveFamily,
  createFamily,
  joinFamilyByCode,
  getLocalRecipes,
  subscribeRecipes,
  addRecipe,
  deleteRecipe,
  importRecipeIngredientsToShoppingList
} from './services/shoppingService';

export default function App() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'deals' | 'recipes' | 'history'
  const [items, setItems] = useState([]);
  const [deals, setDeals] = useState([]);
  const [recipes, setRecipes] = useState(getLocalRecipes);
  const [history, setHistory] = useState(getLocalPurchaseHistory);
  const [frequencies, setFrequencies] = useState(getLocalFrequencies);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Multi-družinska podpora
  const [activeFamily, setActiveFamilyState] = useState(getActiveFamily);

  // Družinski uporabniki in aktivni uporabnik
  const [familyMembers, setFamilyMembers] = useState(getLocalMembers);
  const [currentMember, setCurrentMember] = useState(getLocalActiveUser);

  // Nakupovalna seja v živo (Active Session)
  const [activeSession, setActiveSession] = useState(getLocalActiveSession);
  const [currentStore, setCurrentStore] = useState(() => activeSession?.storeName || 'Splošno');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Modali
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [userManagerMode, setUserManagerMode] = useState('switch'); // 'switch' | 'manage'
  const [isDealComparisonOpen, setIsDealComparisonOpen] = useState(false);
  const [comparisonItem, setComparisonItem] = useState(null);
  const [comparisonTiers, setComparisonTiers] = useState({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Spoznavni vprašalnik (Onboarding) & Upravljanje družin
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingInitialData, setOnboardingInitialData] = useState(null);
  const [isFamilyManagerOpen, setIsFamilyManagerOpen] = useState(false);

  // Shrani aktivnega uporabnika
  useEffect(() => {
    saveLocalActiveUser(currentMember);
  }, [currentMember]);

  // Naročnina na aktivno družino
  useEffect(() => {
    const unsubFamily = subscribeActiveFamily((fam) => {
      setActiveFamilyState(fam);
      if (fam?.members && fam.members.length > 0) {
        setFamilyMembers(fam.members);
        if (!fam.members.some(m => m.id === currentMember?.id)) {
          setCurrentMember(fam.members[0]);
        }
      }
    });
    return () => {
      if (typeof unsubFamily === 'function') unsubFamily();
    };
  }, [currentMember]);

  // Naročnina na družinske člane
  useEffect(() => {
    const unsubMembers = subscribeFamilyMembers((updatedMembers) => {
      setFamilyMembers(updatedMembers);
      if (!updatedMembers.some(m => m.id === currentMember?.id)) {
        setCurrentMember(updatedMembers[0] || DEFAULT_FAMILY_MEMBERS[0]);
      }
    });
    return () => {
      if (typeof unsubMembers === 'function') unsubMembers();
    };
  }, [currentMember]);

  // Naročnina na recepte
  useEffect(() => {
    const unsubRecipes = subscribeRecipes((fetchedRecipes) => {
      setRecipes(fetchedRecipes);
    });
    return () => {
      if (typeof unsubRecipes === 'function') unsubRecipes();
    };
  }, []);

  // Naročnina na seznam artiklov, akcije, zgodovino nakupov in pogostosti
  useEffect(() => {
    const unsubItems = subscribeShoppingList((fetchedItems) => {
      setItems(fetchedItems);
    });

    const unsubDeals = subscribeCatalogDeals((fetchedDeals) => {
      setDeals(fetchedDeals);
    });

    const unsubHistory = subscribePurchaseHistory((fetchedHistory) => {
      setHistory(fetchedHistory);
    });

    const unsubFreqs = subscribeFrequencies((fetchedFreqs) => {
      setFrequencies(fetchedFreqs);
    });

    return () => {
      if (typeof unsubItems === 'function') unsubItems();
      if (typeof unsubDeals === 'function') unsubDeals();
      if (typeof unsubHistory === 'function') unsubHistory();
      if (typeof unsubFreqs === 'function') unsubFreqs();
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

  // Izračun ujemanj po 3 kakovostnih razredih za vsak artikel
  const itemDealsMap = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      const matchResult = findBestDeal(item.title, deals, currentMember?.preference || 'best_value');
      
      if (item.matchedDealId) {
        const specificDeal = deals.find(d => d.id === item.matchedDealId);
        if (specificDeal) {
          map.set(item.id, {
            ...matchResult,
            bestDeal: specificDeal
          });
          continue;
        }
      }

      map.set(item.id, matchResult);
    }
    return map;
  }, [items, deals, currentMember]);

  // Artikli v košarici
  const completedItems = useMemo(() => items.filter(i => i.completed), [items]);

  // Tekoči seštevek zneska in prihrankov v košarici
  const { sessionTotalAmount, sessionTotalSavings } = useMemo(() => {
    let amount = 0;
    let savings = 0;
    for (const item of completedItems) {
      const price = Number(item.price) || 0;
      const sav = Number(item.savings) || 0;
      amount += price;
      savings += sav;
    }
    return {
      sessionTotalAmount: amount,
      sessionTotalSavings: savings
    };
  }, [completedItems]);

  // Upravljanje seje in časovnika (Timer + 30 min nedejavnosti)
  useEffect(() => {
    if (completedItems.length > 0) {
      if (!activeSession) {
        const newSession = {
          sessionId: 'sess_' + Date.now(),
          userId: currentMember?.id || 'user-1',
          userName: currentMember?.name || 'Miha',
          userAvatar: currentMember?.avatar || '👨',
          storeName: currentStore || 'Splošno',
          startedAt: Date.now(),
          lastActivityAt: Date.now()
        };
        setActiveSession(newSession);
        saveLocalActiveSession(newSession);
        setElapsedSeconds(0);
      }
    } else {
      if (activeSession) {
        clearLocalActiveSession();
        setActiveSession(null);
        setElapsedSeconds(0);
      }
    }
  }, [completedItems.length, currentMember, currentStore]);

  // Časovnik seje & samodejni zaključek po 30 min nedejavnosti
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - (activeSession.startedAt || now)) / 1000);
      setElapsedSeconds(elapsed);

      // Preveri 30 minut nedejavnosti
      const lastAct = activeSession.lastActivityAt || activeSession.startedAt || now;
      const inactivityMinutes = (now - lastAct) / (1000 * 60);

      if (inactivityMinutes >= 30) {
        clearInterval(interval);
        archiveShoppingSession({
          session: activeSession,
          completedItems,
          user: currentMember,
          storeName: currentStore,
          totalSpent: sessionTotalAmount,
          totalSaved: sessionTotalSavings
        }).then(() => {
          setActiveSession(null);
          clearLocalActiveSession();
          alert('Nakupovalna seja je bila samodejno zaključena zaradi 30 minut nedejavnosti.');
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, completedItems, currentMember, currentStore, sessionTotalAmount, sessionTotalSavings]);

  // Posodobi zadnjo aktivnost ob klikih
  const touchActivity = useCallback(() => {
    if (activeSession) {
      const updated = { ...activeSession, lastActivityAt: Date.now() };
      setActiveSession(updated);
      saveLocalActiveSession(updated);
    }
  }, [activeSession]);

  // Označi artikel (kupljeno / v košarico)
  const handleToggleItem = async (itemId, currentStatus) => {
    touchActivity();
    await toggleItemStatus(itemId, currentStatus);
    if (!currentStatus) {
      triggerConfetti();
    }
  };

  // Posodobi ceno artikla
  const handleUpdateItemPrice = async (itemId, price) => {
    touchActivity();
    await updateShoppingItem(itemId, { price: Number(price) || 0 });
  };

  // Izbira kakovostnega razreda za artikel
  const handleSelectTier = async (itemId, tierKey, deal) => {
    touchActivity();
    if (!deal) return;
    const savings = deal.regularPrice ? (deal.regularPrice - deal.discountPrice) : 0;
    await updateShoppingItem(itemId, {
      selectedTier: tierKey,
      matchedDealId: deal.id,
      price: deal.discountPrice,
      savings: Number(savings.toFixed(2)),
      store: deal.store
    });
  };

  // Odpri modal za primerjavo cen in kakovosti
  const handleOpenDealComparison = (item, tiers) => {
    setComparisonItem(item);
    setComparisonTiers(tiers);
    setIsDealComparisonOpen(true);
  };

  // Izbris artikla
  const handleDeleteItem = async (itemId) => {
    touchActivity();
    await deleteShoppingItem(itemId);
  };

  // Počisti vse kupljeno
  const handleClearCompleted = async () => {
    touchActivity();
    await clearAllCompletedItems();
  };

  // Zaključi nakup iz modala
  const handleConfirmCheckout = async ({ storeName, totalSpent, totalSaved }) => {
    await archiveShoppingSession({
      session: activeSession,
      completedItems,
      user: currentMember,
      storeName,
      totalSpent,
      totalSaved
    });
    setIsCheckoutModalOpen(false);
    triggerConfetti();
  };

  // Upravljanje družin
  const handleSwitchFamily = (familyId) => {
    setActiveFamily(familyId);
    triggerConfetti();
  };

  const handleCreateNewFamily = () => {
    setOnboardingInitialData({
      familyName: '',
      members: [
        { id: 'user_1', name: '', birthYear: 1988, avatar: '👨', role: 'admin', preference: 'best_value', color: '#10b981' }
      ],
      preferences: {
        favoriteStores: ['spar', 'lidl', 'hofer'],
        cuisines: ['slovenska', 'italijanska'],
        dietaryFlags: ['lokalno_slo'],
        stapleItems: ['Mleko', 'Kruh', 'Jajca']
      }
    });
    setIsOnboardingOpen(true);
  };

  const handleJoinFamily = (code) => {
    const res = joinFamilyByCode(code);
    if (res.success) {
      triggerConfetti();
    }
    return res;
  };

  const handleOnboardingComplete = async (familyData, options) => {
    let saved;
    if (onboardingInitialData?.familyName === '') {
      // Ustvarjanje nove družine
      saved = createFamily(familyData);
    } else {
      // Posodobitev obstoječe
      saved = updateActiveFamily(familyData);
    }

    // Če je uporabnik izbral takojšen uvoz osnovnih živil (Staples)
    if (options?.importStaples && Array.isArray(options?.staples)) {
      for (const stapleName of options.staples) {
        await addShoppingItem({
          title: stapleName,
          category: 'ostalo',
          quantity: '1 kos'
        });
      }
    }

    setIsOnboardingOpen(false);
    setOnboardingInitialData(null);
    triggerConfetti();
  };

  // Uvoz sestavin recepta
  const handleImportRecipeIngredients = async (recipe, selectedIngs) => {
    await importRecipeIngredientsToShoppingList({
      recipe,
      selectedIngredients: selectedIngs
    });
    triggerConfetti();
  };

  // Filtriranje seznama po kategoriji in iskanju
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  // Štetje artiklov po kategorijah
  const categoryCounts = useMemo(() => {
    const counts = {};
    items.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [items]);

  // Seštevek vseh potencialnih prihrankov
  const totalPotentialSavings = useMemo(() => {
    let total = 0;
    for (const item of items) {
      if (item.savings && !item.completed) {
        total += Number(item.savings);
      }
    }
    return total;
  }, [items]);

  const activeCount = useMemo(() => items.filter(i => !i.completed).length, [items]);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 pb-36">
      
      {/* Glavna navigacijska vrstica */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentMember={currentMember}
        activeFamily={activeFamily}
        onOpenUserManager={() => {
          setUserManagerMode('switch');
          setIsUserManagerOpen(true);
        }}
        onOpenFamilyManager={() => setIsFamilyManagerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeCount={activeCount}
        dealsCount={deals.length}
        recipesCount={recipes.length}
        historyCount={history.length}
      />

      {/* Glavno območje z vsebino */}
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-12 space-y-4">
        
        {/* ZAVIHEK: SEZNAM ARTIKLOV */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            
            {/* Iskalnik in horizontalni filter kategorij */}
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              categoryCounts={categoryCounts}
              catalogDeals={deals}
              onAddDirectItem={addShoppingItem}
            />

            {/* Samodejne bližnjice in priljubljeni artikli */}
            <SmartShortcuts
              frequencies={frequencies}
              deals={deals}
              activeItems={items}
              onAddShortcutItem={addShoppingItem}
            />

            {/* Personaliziran prikaz akcij na domačem zaslonu */}
            <PersonalizedDeals
              activeFamily={activeFamily}
              deals={deals}
              currentItems={items}
              onAddItem={addShoppingItem}
              onOpenDealsTab={() => setActiveTab('deals')}
            />

            {/* Personalizirana priporočila za aktivno družino (Kosilo dneva) */}
            <FamilyRecommendations
              activeFamily={activeFamily}
              deals={deals}
              recipes={recipes}
              currentItems={items}
              onAddItem={addShoppingItem}
              onOpenRecipe={(rec) => setActiveTab('recipes')}
            />

            {/* Značka potencialnega prihranka */}
            {totalPotentialSavings > 0 && (
              <div className="p-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl text-white shadow-md shadow-emerald-700/15 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black">
                    🏷️
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">
                      Primerjava cen & akcij
                    </div>
                    <div className="text-xs font-medium">
                      Ocenjeni družinski prihranek na seznamu:
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black tracking-tight text-amber-300">
                    ~{totalPotentialSavings.toFixed(2)} €
                  </div>
                </div>
              </div>
            )}

            {/* Nakupovalni seznam */}
            <ShoppingList
              items={filteredItems}
              itemDealsMap={itemDealsMap}
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onClearCompleted={handleClearCompleted}
              onOpenAddItem={() => setIsAddModalOpen(true)}
              onOpenDealComparison={handleOpenDealComparison}
              onSelectTier={handleSelectTier}
              onUpdateItemPrice={handleUpdateItemPrice}
            />

          </div>
        )}

        {/* ZAVIHEK: KATALOGI & AKCIJE */}
        {activeTab === 'deals' && (
          <DealsView
            deals={deals}
            onAddDealToShoppingList={addShoppingItem}
            currentMember={currentMember}
          />
        )}

        {/* ZAVIHEK: PAMETNA KNJIGA RECEPTOV (RECIPES & MEAL PLANNER) */}
        {activeTab === 'recipes' && (
          <RecipeBook
            recipes={recipes}
            deals={deals}
            currentItems={items}
            activeFamily={activeFamily}
            onImportIngredients={handleImportRecipeIngredients}
            onAddRecipe={addRecipe}
            onDeleteRecipe={deleteRecipe}
          />
        )}

        {/* ZAVIHEK: ZGODOVINA NAKUPOV */}
        {activeTab === 'history' && (
          <PurchaseHistory
            history={history}
            onDeleteHistoryItem={deletePurchaseHistoryItem}
            onClearHistory={clearAllPurchaseHistory}
          />
        )}
      </main>

      {/* Mobilni plavajoči gumb (FAB) za dodajanje artikla */}
      {activeTab === 'list' && (
        <div className={`fixed right-6 z-30 transition-all ${
          completedItems.length > 0 ? 'bottom-28' : 'bottom-6'
        }`}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/40 active:scale-95 transition cursor-pointer"
            aria-label="Dodaj nov artikel"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Nakupovalni način v živo: Spodnja lebdeča vrstica */}
      {activeTab === 'list' && (
        <LiveShoppingBar
          completedCount={completedItems.length}
          totalAmount={sessionTotalAmount}
          totalSavings={sessionTotalSavings}
          elapsedSeconds={elapsedSeconds}
          currentStore={currentStore}
          onSelectStore={(st) => {
            setCurrentStore(st);
            if (activeSession) {
              const updated = { ...activeSession, storeName: st };
              setActiveSession(updated);
              saveLocalActiveSession(updated);
            }
          }}
          onCheckout={() => setIsCheckoutModalOpen(true)}
        />
      )}

      {/* Modal za potrditev zaključka nakupa */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        completedItems={completedItems}
        totalAmount={sessionTotalAmount}
        totalSavings={sessionTotalSavings}
        currentStore={currentStore}
        activeUser={currentMember}
        onConfirmCheckout={handleConfirmCheckout}
      />

      {/* Modal za dodajanje artikla s tier zaznavanjem */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addShoppingItem}
        currentMember={currentMember}
        familyMembers={familyMembers}
        deals={deals}
      />

      {/* Modal za pametno primerjavo cen po kakovosti (DealComparison) */}
      <DealComparison
        isOpen={isDealComparisonOpen}
        onClose={() => setIsDealComparisonOpen(false)}
        item={comparisonItem}
        tieredDeals={comparisonTiers}
        selectedTier={comparisonItem?.selectedTier}
        onSelectTier={handleSelectTier}
      />

      {/* Modal za hitri preklop ali urejanje profilov (UserManager) */}
      <UserManager
        isOpen={isUserManagerOpen}
        onClose={() => setIsUserManagerOpen(false)}
        users={familyMembers}
        activeUser={currentMember}
        onSelectUser={setCurrentMember}
        onSaveUsers={saveFamilyMembers}
        initialTab={userManagerMode}
      />

      {/* Multi-družinski preklopnik (FamilySwitcher) */}
      <FamilySwitcher
        isOpen={isFamilyManagerOpen}
        onClose={() => setIsFamilyManagerOpen(false)}
        activeFamily={activeFamily}
        onSwitchFamily={handleSwitchFamily}
        onCreateNewFamily={handleCreateNewFamily}
        onJoinFamily={handleJoinFamily}
        onOpenOnboarding={() => {
          setOnboardingInitialData(activeFamily);
          setIsOnboardingOpen(true);
        }}
      />

      {/* Spoznavni vprašalnik (Onboarding Wizard) */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialFamily={onboardingInitialData || activeFamily}
        onComplete={handleOnboardingComplete}
      />

      {/* Nastavitve & Sinhronizacija */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        familyMembers={familyMembers}
        onUpdateFamilyMembers={saveFamilyMembers}
        currentMember={currentMember}
        onSelectCurrentMember={setCurrentMember}
        activeFamily={activeFamily}
        onOpenOnboarding={() => {
          setOnboardingInitialData(activeFamily);
          setIsOnboardingOpen(true);
        }}
        onOpenFamilyManager={() => setIsFamilyManagerOpen(true)}
      />

    </div>
  );
}
