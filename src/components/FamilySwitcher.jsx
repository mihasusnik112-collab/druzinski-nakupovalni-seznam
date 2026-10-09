import React, { useState } from 'react';
import { 
  X, 
  Home, 
  Plus, 
  Key, 
  Check, 
  Copy, 
  Sliders, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { getLocalFamilies } from '../services/shoppingService';

export default function FamilySwitcher({
  isOpen,
  onClose,
  activeFamily,
  onSwitchFamily,
  onCreateNewFamily,
  onJoinFamily,
  onOpenOnboarding
}) {
  const [families, setFamilies] = useState(() => getLocalFamilies());
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (code) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    const res = onJoinFamily(joinCodeInput.trim());
    if (res?.success) {
      setFamilies(getLocalFamilies());
      setJoinCodeInput('');
      setJoinError('');
      onClose();
    } else {
      setJoinError(res?.message || 'Neveljavna koda družine!');
    }
  };

  const handleSwitch = (familyId) => {
    onSwitchFamily(familyId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 px-6 py-5 text-white shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-2xl">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                Družinski profil & Košarice
              </h3>
              <p className="text-xs text-emerald-100">
                Preklapljaj med družinami ali povabi člane s kodo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vsebina */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Trenutna aktivna družina */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Aktivna družinska skupina
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                Povezano
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {activeFamily?.familyName}
                </h4>
                <p className="text-xs text-slate-500">
                  {activeFamily?.members?.length || 0} članov • {activeFamily?.preferences?.favoriteStores?.length || 0} trgovin
                </p>
              </div>

              {/* Koda družine z gumbom za kopiranje */}
              <button
                type="button"
                onClick={() => handleCopy(activeFamily?.familyId || '')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-xs font-mono font-bold text-emerald-900 hover:bg-emerald-100/50 transition cursor-pointer shadow-2xs"
                title="Kopiraj kodo za povabilo družinskih članov"
              >
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                <span>{activeFamily?.familyId}</span>
                <Copy className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>
            </div>

            {copiedCode && (
              <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Koda je kopirana! Pošljite jo družinskim članom.
              </p>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenOnboarding();
              }}
              className="w-full mt-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5" /> Uredi profil, člane in trgovine
            </button>
          </div>

          {/* Menjava med shranjenimi družinami */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Družine na tej napravi ({families.length})
            </label>
            <div className="space-y-2">
              {families.map(fam => {
                const isActive = fam.familyId === activeFamily?.familyId;
                return (
                  <button
                    key={fam.familyId}
                    type="button"
                    onClick={() => handleSwitch(fam.familyId)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition cursor-pointer ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-400'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        🏠
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {fam.familyName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {fam.members?.length || 0} članov • Koda: {fam.familyId}
                        </span>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4 stroke-[3]" /> Aktivno
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        Preklopi <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pridružitev obstoječi družini s kodo */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pridruži se z družinsko kodo
            </label>
            <form onSubmit={handleJoinSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Vnesi kodo (npr. Susnik-4102 ali 4102)"
                value={joinCodeInput}
                onChange={(e) => {
                  setJoinCodeInput(e.target.value);
                  setJoinError('');
                }}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-emerald-500 uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1"
              >
                Poveži <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
            {joinError && (
              <p className="text-[11px] text-rose-500 font-bold mt-1">
                {joinError}
              </p>
            )}
          </div>

          {/* Ustvari novo družino */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onCreateNewFamily();
              }}
              className="w-full py-2.5 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 text-xs font-bold text-slate-700 hover:text-emerald-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Ustvari novo družino (Vprašalnik)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
