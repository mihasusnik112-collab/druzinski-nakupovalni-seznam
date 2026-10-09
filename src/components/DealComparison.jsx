import React from 'react';
import { 
  X, 
  Flame, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Tag, 
  Leaf, 
  Coins, 
  Award,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { STORE_INFO } from '../data/initialCategories';
import StoreBadge from './StoreBadge';

export default function DealComparison({
  isOpen,
  onClose,
  item,
  tieredDeals = {},
  selectedTier,
  onSelectTier
}) {
  if (!isOpen || !item) return null;

  const tiersConfig = [
    {
      key: 'budget',
      title: 'Najceneje (Diskont)',
      icon: '🟢',
      accent: 'emerald',
      bgCard: 'bg-emerald-50/50 border-emerald-200',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'Lastne blagovne znamke (Pilos, S-Budget, Milfina...)'
    },
    {
      key: 'brand',
      title: 'Priznana znamka (Best Value)',
      icon: '🟡',
      accent: 'amber',
      bgCard: 'bg-amber-50/50 border-amber-200',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      description: 'Preverjene znamke v akciji (Alpsko mleko, Barcaffè, Ariel...)'
    },
    {
      key: 'premium_local',
      title: 'Lokalno & Eko (Certificirano)',
      icon: '🌿',
      accent: 'teal',
      bgCard: 'bg-teal-50/50 border-teal-200',
      badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
      description: 'Slovensko poreklo, EKO certifikat, Izbrana kakovost Slovenija'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Glava */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-1">
            <Sparkles className="w-4 h-4 fill-emerald-300" />
            <span>Pametna primerjava po kakovosti in ceni</span>
          </div>

          <h3 className="text-lg font-bold">
            {item.title}
          </h3>

          <p className="text-xs text-white/70 mt-0.5">
            Izberi želeni kakovostni razred za ta izdelek
          </p>
        </div>

        {/* Primerjava 3 kakovostnih razredov */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-3.5 flex-1 bg-slate-50/40">
          {tiersConfig.map((tierCfg) => {
            const deal = tieredDeals[tierCfg.key];
            const isSelected = selectedTier === tierCfg.key || (!selectedTier && tierCfg.key === 'budget');
            const store = deal ? (STORE_INFO[deal.store] || {}) : null;

            return (
              <div
                key={tierCfg.key}
                className={`p-4 rounded-3xl border transition-all ${
                  isSelected
                    ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tierCfg.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {tierCfg.title}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {tierCfg.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Izbrana opcija</span>
                    </span>
                  )}
                </div>

                {deal ? (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${store.badgeColor || 'bg-slate-100'}`}>
                          <StoreBadge storeName={deal.store} size="xs" />
                          <span>{deal.store}</span>
                        </span>
                        
                        {deal.origin && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {deal.origin}
                          </span>
                        )}

                        {deal.discountPercentage && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-rose-500 text-white text-[10px] font-bold">
                            <Flame className="w-2.5 h-2.5 fill-white" />
                            {deal.discountPercentage}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-slate-800 mt-1 truncate">
                        {deal.productName}
                      </div>

                      <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                        {deal.unitPriceFormatted || `${deal.discountPrice} € / ${deal.unit}`}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-slate-900">
                        {deal.discountPrice?.toFixed(2)} €
                      </div>
                      {deal.regularPrice && (
                        <div className="text-[10px] text-slate-400 line-through">
                          Redna: {deal.regularPrice?.toFixed(2)} €
                        </div>
                      )}

                      <button
                        onClick={() => {
                          onSelectTier(item.id, tierCfg.key, deal);
                          onClose();
                        }}
                        className={`mt-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        {isSelected ? 'Potrjeno' : 'Izberi to'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
                    Za ta artikel v aktualnem letaku ni specifične ponudbe v tej kategoriji.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Noga */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Primerjava cen na enoto: €/kg, €/l, €/kos
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
          >
            Zapri
          </button>
        </div>

      </div>
    </div>
  );
}
