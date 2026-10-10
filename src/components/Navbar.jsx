import React from 'react';
import { ShoppingBag, Settings, Cloud, HardDrive, ChevronDown, Crown } from 'lucide-react';
import { isFirebaseConfigured } from '../firebase';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentMember, 
  activeFamily,
  isAdmin = false,
  onOpenUserManager,
  onOpenFamilyManager,
  onOpenSettings
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-2xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          
          {/* Logo & Naslov & Izbira Družine */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenFamilyManager}
                  className="inline-flex items-center gap-1 text-base font-bold text-slate-900 tracking-tight leading-tight hover:text-emerald-700 transition cursor-pointer group truncate"
                  title="Klikni za menjavo družine"
                >
                  <span className="truncate">{activeFamily?.familyName || 'Družinski Seznam'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform shrink-0" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                  {activeFamily?.familyId || 'Koda'}
                </span>
                {isFirebaseConfigured ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium text-[10px] truncate">
                    <Cloud className="w-3 h-3 text-emerald-500 animate-pulse shrink-0" /> Sinhronizirano
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-500 text-[10px] truncate">
                    <HardDrive className="w-3 h-3 text-slate-400 shrink-0" /> Lokalno
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Desna orodna vrstica: Profil, Admin (za skrbnika) & Nastavitve */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Preklopnik profila z enim dotikom */}
            <button
              onClick={onOpenUserManager}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition active:scale-95 border border-slate-200/90 shadow-2xs cursor-pointer ring-1 ring-slate-900/5"
              title="Preklopi družinskega člana"
            >
              <div 
                className="w-6 h-6 rounded-xl flex items-center justify-center text-sm shadow-2xs shrink-0"
                style={{ backgroundColor: currentMember?.color ? `${currentMember.color}25` : '#ecfdf5' }}
              >
                {currentMember?.avatar || '🧑'}
              </div>
              <span className="font-extrabold text-slate-900 text-xs max-w-[70px] truncate">
                {currentMember?.name || 'Profil'}
              </span>
            </button>

            {/* Skrbniški gumb samo za skrbnika (Družina Sušnik) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`p-2 rounded-xl transition active:scale-95 cursor-pointer border ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
                title="Skrbniška nadzorna plošča"
              >
                <Crown className="w-4 h-4" />
              </button>
            )}

            {/* Gumb za nastavitve */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95 border border-transparent hover:border-slate-200 cursor-pointer"
              title="Nastavitve & Koda družine"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
