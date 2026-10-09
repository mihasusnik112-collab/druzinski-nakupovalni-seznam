import React from 'react';
import { STORES_LIST } from '../data/stores';
import StoreBadge from './StoreBadge';

export default function StoreFilterBar({
  selectedStore = 'all',
  onSelectStore,
  storeCounts = {},
  className = ''
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Filter po trgovinah:
        </span>
        {selectedStore !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectStore('all')}
            className="text-[10px] font-semibold text-emerald-600 hover:underline cursor-pointer"
          >
            Pokaži vse trgovine
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 scroll-smooth">
        {/* Vse trgovine */}
        <button
          type="button"
          onClick={() => onSelectStore('all')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
            selectedStore === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>🏪</span>
          <span>Vse trgovine</span>
        </button>

        {/* Posamezne trgovine */}
        {STORES_LIST.map((store) => {
          const isSelected = selectedStore.toLowerCase() === store.shortName.toLowerCase();
          const count = storeCounts[store.shortName] || 0;

          return (
            <button
              type="button"
              key={store.id}
              onClick={() => onSelectStore(isSelected ? 'all' : store.shortName)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border shrink-0 ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <StoreBadge storeName={store.shortName} size="xs" />
              <span>{store.shortName}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
