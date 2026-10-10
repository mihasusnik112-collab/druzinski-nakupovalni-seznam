import React from 'react';
import { X, Calendar, Flame, ExternalLink, ArrowRight, Check, Store } from 'lucide-react';
import { STORE_INFO } from '../data/initialCategories';
import StoreBadge from './StoreBadge';

export default function DealModal({
  isOpen,
  onClose,
  deal,
  item,
  alternativeDeals = [],
  onSelectAlternative
}) {
  if (!isOpen || !deal) return null;

  const storeInfo = STORE_INFO[deal.store] || {
    name: deal.store,
    color: 'bg-emerald-600',
    textColor: 'text-emerald-700',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    logo: '🛒'
  };

  const savings = deal.regularPrice && deal.discountPrice 
    ? (deal.regularPrice - deal.discountPrice).toFixed(2)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header kartice z barvo trgovca */}
        <div className={`p-5 text-white ${storeInfo.color} relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <StoreBadge storeName={deal.store} size="md" />
            <span className="text-sm font-semibold tracking-wide uppercase opacity-90">
              {deal.store} • Aktualni letak
            </span>
          </div>

          <h3 className="text-lg font-bold leading-tight">
            {deal.productName}
          </h3>

          {item && (
            <p className="text-xs text-white/80 mt-1">
              Ujemanje za artikel: <span className="font-semibold underline">{item.title}</span>
            </p>
          )}
        </div>

        {/* Podrobnosti o ceni in prihranku */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Akcijska cena:</div>
              <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                {deal.discountPrice?.toFixed(2)} €
                <span className="text-xs font-medium text-slate-500 ml-1">/{deal.unit || 'kos'}</span>
              </div>
            </div>

            <div className="text-right">
              {deal.regularPrice && (
                <div className="text-xs text-slate-400 line-through">
                  Redna: {deal.regularPrice?.toFixed(2)} €
                </div>
              )}
              {deal.discountPercentage && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-xs mt-1">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  <span>{deal.discountPercentage}</span>
                </div>
              )}
              {savings && (
                <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                  Prihranek: {savings} €
                </div>
              )}
            </div>
          </div>

          {/* Veljavnost akcije */}
          <div className="flex items-center gap-2.5 text-xs text-slate-600 px-1">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Velja: <strong className="text-slate-800">{deal.validFrom || 'Ta teden'}</strong> do <strong className="text-slate-800">{deal.validTo || 'do razprodaje zalog'}</strong>
            </span>
          </div>

          {/* Spletna povezava do kataloga */}
          {deal.sourceCatalogUrl && (
            <a
              href={deal.sourceCatalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold transition"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                Odpri spletni katalog {deal.store}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </a>
          )}

          {/* Primerjava akcij pri ostalih trgovcih */}
          {alternativeDeals.length > 1 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                <span>Primerjava z drugimi trgovci:</span>
                <span className="text-[11px] font-normal text-slate-500">{alternativeDeals.length} akcij</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                {alternativeDeals.map((alt) => {
                  const isCurrent = alt.id === deal.id;
                  const altStore = STORE_INFO[alt.store] || {};

                  return (
                    <div
                      key={alt.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                        isCurrent
                          ? 'bg-emerald-50/60 border-emerald-300 font-semibold'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <StoreBadge storeName={alt.store} size="xs" />
                        <div className="truncate">
                          <span className="font-bold text-slate-800">{alt.store}: </span>
                          <span className="text-slate-600">{alt.productName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-emerald-700">
                          {alt.discountPrice?.toFixed(2)} €
                        </span>
                        {!isCurrent && onSelectAlternative && (
                          <button
                            onClick={() => onSelectAlternative(alt)}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                          >
                            Izberi
                          </button>
                        )}
                        {isCurrent && (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gumb za zaprtje */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
            >
              Zapri podrobnosti
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
