import React from 'react';
import { Plus } from 'lucide-react';
import SearchBar from './SearchBar';
import SmartShortcuts from './SmartShortcuts';
import CouponOptimizer from './CouponOptimizer';
import PersonalizedDeals from './PersonalizedDeals';
import FamilyRecommendations from './FamilyRecommendations';
import ShoppingList from './ShoppingList';

export default function PlanningView({
  // Seznam in iskanje
  items = [],
  filteredItems = [],
  deals = [],
  recipes = [],
  frequencies = [],
  itemDealsMap = new Map(),
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categoryCounts = {},
  totalPotentialSavings = 0,
  activeFamily,
  currentMember,
  // Akcije
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onClearCompleted,
  onOpenAddItem,
  onOpenDealComparison,
  onSelectTier,
  onUpdateItemPrice,
  onApplyCoupon,
  onOpenDealsTab,
  onOpenRecipe
}) {
  return (
    <div className="space-y-4">
      
      {/* 1. Pametni iskalnik z znamkami in hitrimi predlogi */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenAddModal={onOpenAddItem}
        categoryCounts={categoryCounts}
        catalogDeals={deals}
        onAddDirectItem={onAddItem}
      />

      {/* 2. Samodejne bližnjice & Priljubljeno (hitro dodajanje z enim dotikom) */}
      <SmartShortcuts
        frequencies={frequencies}
        deals={deals}
        activeItems={items}
        onAddShortcutItem={onAddItem}
      />

      {/* 3. Pametni kuponi in tedenski popusti (-25% Spar Joker, Lidl Plus, ...) */}
      <CouponOptimizer
        items={items}
        onApplyCouponToItem={onApplyCoupon}
      />

      {/* 4. Aktualne akcije in personalizirani popusti za družino */}
      <PersonalizedDeals
        activeFamily={activeFamily}
        deals={deals}
        currentItems={items}
        onAddItem={onAddItem}
        onOpenDealsTab={onOpenDealsTab}
      />

      {/* 5. Kosilo dneva in družinska priporočila */}
      <FamilyRecommendations
        activeFamily={activeFamily}
        deals={deals}
        recipes={recipes}
        currentItems={items}
        onAddItem={onAddItem}
        onOpenRecipe={onOpenRecipe}
      />

      {/* 6. Značka ocenjenega prihranka */}
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

      {/* 7. Glavni pregled nakupovalnega seznama */}
      <ShoppingList
        items={filteredItems}
        itemDealsMap={itemDealsMap}
        onToggleItem={onToggleItem}
        onDeleteItem={onDeleteItem}
        onClearCompleted={onClearCompleted}
        onOpenAddItem={onOpenAddItem}
        onOpenDealComparison={onOpenDealComparison}
        onSelectTier={onSelectTier}
        onUpdateItemPrice={onUpdateItemPrice}
      />

    </div>
  );
}
