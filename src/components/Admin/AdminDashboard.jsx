import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  ShoppingBag, 
  Key, 
  ExternalLink, 
  Check, 
  RefreshCw, 
  Crown,
  ChevronRight,
  Database,
  Lock
} from 'lucide-react';
import { 
  getLocalFamilies, 
  updateFamilyPin, 
  setActiveFamily, 
  getLocalItems,
  getLocalRecipes,
  saveLocalFamilies
} from '../../services/shoppingService';

export default function AdminDashboard({
  activeFamily,
  onSwitchFamily,
  onClose
}) {
  const [families, setFamilies] = useState(getLocalFamilies);
  const [editingPinFamilyId, setEditingPinFamilyId] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Osveži podatke
  const reloadData = () => {
    setFamilies(getLocalFamilies());
  };

  // Shrani novi PIN
  const handleSavePin = (familyId) => {
    if (newPin.length !== 4 || isNaN(Number(newPin))) {
      alert('PIN mora vsebovati natanko 4 številke!');
      return;
    }
    updateFamilyPin(familyId, newPin);
    setEditingPinFamilyId(null);
    setNewPin('');
    reloadData();
    setFeedbackMsg(`PIN za družino je bil uspešno posodobljen na ${newPin}.`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Preklopi na pogled te družine
  const handleInspectFamily = (familyId) => {
    onSwitchFamily?.(familyId);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Glava administratorske plošče */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 rounded-3xl p-5 text-white shadow-xl shadow-amber-900/15 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner shrink-0">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded-full text-amber-200">
                Skrbniški dostop (Admin)
              </span>
              <span className="text-xs text-amber-100 font-bold">
                {activeFamily?.familyName || 'Sušnik'}
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight mt-0.5">
              Nadzorna plošča za upravljanje družin
            </h2>
            <p className="text-xs text-amber-100/90 font-medium">
              Pregled vseh registriranih družin, števila artiklov in upravljanje PIN kod
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={reloadData}
          className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition cursor-pointer text-white"
          title="Osveži podatke"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Seznam vseh družin v sistemu */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span>Registrirane družine v sistemu ({families.length})</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Izolirane baze podatkov
          </span>
        </div>

        <div className="space-y-2.5">
          {families.map((fam) => {
            const isCurrentlyActive = activeFamily?.familyId === fam.familyId;
            const famItems = getLocalItems(fam.familyId);
            const activeItemsCount = famItems.filter(i => !i.completed).length;
            const completedItemsCount = famItems.filter(i => i.completed).length;
            const isEditingThis = editingPinFamilyId === fam.familyId;

            return (
              <div
                key={fam.familyId}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrentlyActive
                    ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Podatki o družini */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900">
                        {fam.familyName}
                      </span>
                      {fam.isAdmin && (
                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 font-black text-[10px] rounded-md">
                          👑 Skrbnik
                        </span>
                      )}
                      {isCurrentlyActive && (
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-md">
                          ✓ Trenutno odprta
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">
                        (ID: {fam.familyId})
                      </span>
                    </div>

                    {/* Člani & Število artiklov */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{fam.members?.length || 0} članov:</span>
                        <strong className="text-slate-700">
                          {fam.members?.map(m => m.name).join(', ') || 'Brez članov'}
                        </strong>
                      </span>

                      <span className="flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                        <span>Artikli:</span>
                        <strong className="text-slate-800">{activeItemsCount} potrebnih</strong>
                        <span>/</span>
                        <span className="text-emerald-700">{completedItemsCount} kupljenih</span>
                      </span>
                    </div>
                  </div>

                  {/* Upravljanje PIN kode in preklop */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isEditingThis ? (
                      <div className="flex items-center gap-1.5 animate-in fade-in">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          placeholder="Nov PIN"
                          className="w-20 px-2 py-1.5 rounded-xl border border-amber-400 text-xs font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSavePin(fam.familyId)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Shrani
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPinFamilyId(null)}
                          className="px-2 py-1.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>PIN: {fam.pin || '1234'}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingPinFamilyId(fam.familyId);
                            setNewPin(fam.pin || '1234');
                          }}
                          className="px-2 py-1.5 rounded-xl text-[11px] font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                          title="Spremeni PIN kodo"
                        >
                          Spremeni PIN
                        </button>
                      </div>
                    )}

                    {/* Gumb za vpogled / preklop */}
                    {!isCurrentlyActive && (
                      <button
                        type="button"
                        onClick={() => handleInspectFamily(fam.familyId)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
                      >
                        <span>Preklopi</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
