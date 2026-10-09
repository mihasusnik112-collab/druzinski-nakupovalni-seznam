import React, { useState } from 'react';
import { X, CheckCircle, Store, ShoppingBag, Receipt, Sparkles } from 'lucide-react';
import { STORE_INFO, STORES_LIST } from '../data/stores';
import StoreBadge from './StoreBadge';

const STORES = ['Splošno', ...STORES_LIST.map(s => s.shortName)];

export default function CheckoutModal({
  isOpen,
  onClose,
  completedItems = [],
  totalAmount = 0,
  totalSavings = 0,
  currentStore = 'Splošno',
  onUpdateStore,
  activeUser,
  onConfirmCheckout
}) {
  const [selectedStore, setSelectedStore] = useState(currentStore);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirmCheckout?.(selectedStore);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg">
              🛒
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Zaključek nakupa
              </h3>
              <p className="text-[11px] text-slate-500">
                Pregled košarice pred shranjevanjem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vsebina modala */}
        <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-1">
          
          {/* Povzetek zneska */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-md">
            <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 mb-1">
              Skupni obračun nakupa
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black tracking-tight text-white">
                {totalAmount.toFixed(2)} €
              </span>
              {totalSavings > 0 && (
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Prihranek z akcijami:</div>
                  <div className="text-sm font-black text-emerald-400">
                    -{totalSavings.toFixed(2)} €
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/80 text-[11px] text-slate-300">
              <span>Kupec:</span>
              <span className="font-bold text-white flex items-center gap-1">
                <span>{activeUser?.avatar || '🧑'}</span>
                <span>{activeUser?.name || 'Družinski član'}</span>
              </span>
              <span className="text-slate-500">•</span>
              <span>{completedItems.length} artiklov</span>
            </div>
          </div>

          {/* Izbira trgovine */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              V kateri trgovini ste opravili nakup?
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {STORES.map((st) => {
                const isSelected = selectedStore === st;
                return (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setSelectedStore(st)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 truncate ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <StoreBadge storeName={st} size="xs" />
                    <span className="truncate">{st}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seznam kupljenih artiklov */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">
              Kupljeni artikli v košarici ({completedItems.length}):
            </span>
            <div className="max-h-44 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/50 p-1">
              {completedItems.map((item) => {
                const itemPrice = Number(item.price) || 0;
                return (
                  <div key={item.id} className="py-2 px-2.5 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-slate-800 truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.quantity || '1 kos'}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-900">
                        {itemPrice > 0 ? `${itemPrice.toFixed(2)} €` : 'Brez cene'}
                      </span>
                      {item.savings > 0 && (
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          -{Number(item.savings).toFixed(2)} €
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer gumbi */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/60 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-white transition cursor-pointer"
          >
            Nazaj v nakupovanje
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Potrdi in shrani nakup</span>
          </button>
        </div>

      </div>
    </div>
  );
}
