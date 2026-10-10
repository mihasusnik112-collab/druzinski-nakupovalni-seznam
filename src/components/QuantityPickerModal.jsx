import React, { useState, useEffect, useMemo } from 'react';
import { Minus, Plus, X, ShoppingCart, Tag, Check, Sparkles } from 'lucide-react';
import StoreBadge from './StoreBadge';
import { 
  getQuickQuantityPresets, 
  calculateTotalItemPrice, 
  normalizeUnit 
} from '../utils/quantityHelper';

export default function QuantityPickerModal({
  isOpen,
  onClose,
  itemData,
  onConfirm
}) {
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('kom');

  useEffect(() => {
    if (itemData) {
      const initialQty = typeof itemData.quantity === 'number' && itemData.quantity > 0 
        ? itemData.quantity 
        : 1;
      setQuantity(initialQty);
      setUnit(itemData.unit || 'kom');
    }
  }, [itemData]);

  const presets = useMemo(() => {
    if (!itemData) return [];
    return getQuickQuantityPresets(itemData.category, itemData.title);
  }, [itemData]);

  if (!isOpen || !itemData) return null;

  const unitPrice = typeof itemData.price === 'number' && itemData.price > 0 ? itemData.price : null;
  const totalPrice = unitPrice ? calculateTotalItemPrice(unitPrice, quantity) : null;
  const isDecimal = unit === 'kg' || unit === 'l';
  const step = isDecimal ? 0.5 : 1;

  const handleDecrement = () => {
    setQuantity((prev) => {
      const next = prev - step;
      return next <= 0.5 ? (isDecimal ? 0.5 : 1) : (isDecimal ? Number(next.toFixed(1)) : Math.round(next));
    });
  };

  const handleIncrement = () => {
    setQuantity((prev) => {
      const next = prev + step;
      return isDecimal ? Number(next.toFixed(1)) : Math.round(next);
    });
  };

  const handleSelectPreset = (preset) => {
    setQuantity(preset.qty);
    setUnit(preset.unit);
  };

  const handleConfirm = () => {
    const finalQuantity = Number(quantity) || 1;
    const finalUnit = normalizeUnit(unit, itemData.category, itemData.title);
    const displayQuantity = `${finalQuantity} ${finalUnit}`;
    const calculatedTotal = unitPrice ? calculateTotalItemPrice(unitPrice, finalQuantity) : null;

    onConfirm({
      ...itemData,
      quantity: finalQuantity,
      unit: finalUnit,
      displayQuantity,
      totalItemPrice: calculatedTotal
    });

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glava modala */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1">
              Izbira količine
            </span>
            <h3 className="text-base font-bold text-slate-900 leading-snug truncate" title={itemData.title}>
              {itemData.title}
            </h3>

            {/* Trgovec & cena na enoto */}
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-500">
              {itemData.store && (
                <div className="inline-flex items-center gap-1 font-semibold text-slate-700">
                  <StoreBadge storeName={itemData.store} size="xs" />
                  <span>{itemData.store}</span>
                </div>
              )}
              {unitPrice && (
                <span className="font-bold text-emerald-700">
                  • {unitPrice.toFixed(2).replace('.', ',')} € / {unit}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* GLAVNI ŠTEVEC KOLIČINE [-] [ X ] [+] */}
        {/* ======================================================== */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-600">Količina:</span>
            
            {/* Enota (kom / kg / l) */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-200 text-xs">
              {['kom', 'kg', 'l', 'plato'].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                    unit === u 
                      ? 'bg-slate-900 text-white shadow-2xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 py-1">
            <button
              type="button"
              onClick={handleDecrement}
              className="w-12 h-12 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 active:scale-95 text-slate-700 flex items-center justify-center font-bold text-lg shadow-2xs transition cursor-pointer"
              title="Zmanjšaj količino"
            >
              <Minus className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="min-w-[100px] text-center px-4 py-2 bg-white rounded-2xl border border-emerald-300 shadow-xs">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {quantity}
              </span>
              <span className="text-xs font-bold text-slate-500 ml-1.5">
                {unit}
              </span>
            </div>

            <button
              type="button"
              onClick={handleIncrement}
              className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/20 transition cursor-pointer"
              title="Povečaj količino"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* HITRE BLIŽNJICE GLEDE NA TIP ARTIKLA */}
        {/* ======================================================== */}
        {presets.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 block px-0.5">
              Hitre izbire:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((preset) => {
                const isSelected = quantity === preset.qty && unit === preset.unit;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`py-2 px-1.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center truncate ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* GUMB ZA POTRDITEV Z ZNESKOM */}
        {/* ======================================================== */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 active:scale-[0.99] transition cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Dodaj na seznam</span>
            </div>

            <div className="text-right">
              {totalPrice ? (
                <span className="font-black text-sm bg-white/20 px-2 py-0.5 rounded-lg">
                  {totalPrice.toFixed(2).replace('.', ',')} €
                </span>
              ) : (
                <span className="font-semibold text-xs opacity-90">
                  ({quantity} {unit})
                </span>
              )}
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
