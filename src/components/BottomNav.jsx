import React from 'react';
import { 
  ClipboardList, 
  ShoppingCart, 
  Tag, 
  BookOpen, 
  Receipt 
} from 'lucide-react';

export default function BottomNav({
  activeTab,
  setActiveTab,
  activeCount = 0,
  cartCount = 0,
  dealsCount = 0,
  recipesCount = 0,
  historyCount = 0
}) {
  const tabs = [
    {
      id: 'planning',
      label: 'Seznam',
      icon: ClipboardList,
      count: activeCount,
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 'cart',
      label: 'Košarica',
      icon: ShoppingCart,
      count: cartCount,
      badgeColor: 'bg-amber-500 text-slate-950 font-black'
    },
    {
      id: 'deals',
      label: 'Akcije',
      icon: Tag,
      count: dealsCount,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'recipes',
      label: 'Recepti',
      icon: BookOpen,
      count: recipesCount,
      badgeColor: 'bg-amber-600 text-white'
    },
    {
      id: 'history',
      label: 'Zgodovina',
      icon: Receipt,
      count: historyCount,
      badgeColor: 'bg-cyan-600 text-white'
    }
  ];

  return (
    <nav 
      aria-label="Glavna navigacija"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-[max(env(safe-area-inset-bottom,0px),4px)]"
    >
      <div className="max-w-md md:max-w-2xl mx-auto px-1.5 pt-1.5 pb-1 flex items-center justify-around select-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-2xl transition-all cursor-pointer active:scale-95 ${
                isActive 
                  ? 'text-emerald-700 font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800 font-semibold'
              }`}
            >
              {/* Ozadje aktivnega zavihka */}
              {isActive && (
                <span className="absolute inset-x-1 inset-y-0.5 bg-emerald-50/90 border border-emerald-200/60 rounded-xl -z-10 animate-in fade-in zoom-in-95 duration-150" />
              )}

              {/* Ikona z obvestilnim števcem */}
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.8]'}`} />

                {tab.count > 0 && (
                  <span 
                    className={`absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center shadow-xs ring-1 ring-white ${tab.badgeColor}`}
                  >
                    {tab.count > 99 ? '99+' : tab.count}
                  </span>
                )}
              </div>

              {/* Polno ime zavihka */}
              <span className={`text-[11px] leading-tight mt-1 tracking-tight truncate max-w-full ${
                isActive ? 'text-emerald-700 font-black' : 'text-slate-600'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
