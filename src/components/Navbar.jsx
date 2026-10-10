import React from 'react';
import { ShoppingBag, ShoppingCart, Tag, Settings, Cloud, HardDrive, Receipt, UtensilsCrossed, Home, ChevronDown } from 'lucide-react';
import { isFirebaseConfigured } from '../firebase';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentMember, 
  activeFamily,
  onOpenUserManager,
  onOpenFamilyManager,
  onOpenSettings,
  activeCount = 0,
  cartCount = 0,
  dealsCount = 0,
  recipesCount = 0,
  historyCount = 0
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-2xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          
          {/* Logo & Naslov & Izbira Družine */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenFamilyManager}
                  className="inline-flex items-center gap-1 text-base font-bold text-slate-900 tracking-tight leading-tight hover:text-emerald-700 transition cursor-pointer group"
                  title="Klikni za menjavo družine"
                >
                  <span>{activeFamily?.familyName || 'Družinski Seznam'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                  {activeFamily?.familyId || 'Koda'}
                </span>
                {isFirebaseConfigured ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium text-[10px]">
                    <Cloud className="w-3 h-3 text-emerald-500 animate-pulse" /> Sinhronizirano
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-500 text-[10px]">
                    <HardDrive className="w-3 h-3 text-slate-400" /> Lokalno
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Desna orodna vrstica: Izbira družinskega člana & Nastavitve */}
          <div className="flex items-center gap-2">
            
            {/* Preklopnik profila z enim dotikom */}
            <button
              onClick={onOpenUserManager}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold transition active:scale-95 border border-slate-200 shadow-2xs cursor-pointer"
              title="Preklopi družinskega člana"
            >
              <span className="text-base leading-none">{currentMember?.avatar || '🧑'}</span>
              <span className="font-bold text-slate-900">{currentMember?.name || 'Profil'}</span>
            </button>

            {/* Gumb za nastavitve */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95 border border-transparent hover:border-slate-200 cursor-pointer"
              title="Nastavitve & Koda družine"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Glavna navigacija med zavihki: Načrtovanje, Košarica v trgovini, Akcije, Recepti, Zgodovina */}
        <div className="grid grid-cols-5 gap-1 mt-2.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('planning')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
              activeTab === 'planning'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Načrtovanje</span>
            {activeCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                activeTab === 'planning' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {activeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
              activeTab === 'cart'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-emerald-700'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Košarica</span>
            {cartCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black shrink-0 ${
                activeTab === 'cart' ? 'bg-amber-300 text-slate-950' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('deals')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer truncate ${
              activeTab === 'deals'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">Akcije</span>
            {dealsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                activeTab === 'deals' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
              }`}>
                {dealsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer truncate ${
              activeTab === 'recipes'
                ? 'bg-white text-amber-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Recepti</span>
            {recipesCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                activeTab === 'recipes' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {recipesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer truncate ${
              activeTab === 'history'
                ? 'bg-white text-cyan-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            <span className="truncate">Zgodovina</span>
            {historyCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                activeTab === 'history' ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
