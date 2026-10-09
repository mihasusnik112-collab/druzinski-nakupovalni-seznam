import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Store, 
  UtensilsCrossed, 
  ShoppingBag, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Plus, 
  Trash2, 
  Heart, 
  ShieldCheck,
  CheckCircle2,
  Copy,
  Baby,
  Smile,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import StoreBadge from './StoreBadge';
import { STORES_LIST } from '../data/stores';
import { CUISINES_OPTIONS, STAPLE_CANDIDATES, getAgeGroup } from '../data/defaultFamilies';
import { AVAILABLE_AVATARS } from '../data/commonItems';

export default function OnboardingWizard({
  isOpen,
  onClose,
  initialFamily = null,
  onComplete
}) {
  const [step, setStep] = useState(1); // 1: Poimenovanje, 2: Člani & Starostne skupine, 3: Trgovine & Kulinarika, 4: Osnovni artikli & Bližnjice

  // 1. Korak – Poimenovanje
  const [lastName, setLastName] = useState(() => {
    if (initialFamily?.familyName) {
      return initialFamily.familyName.replace(/^Družina\s+/i, '');
    }
    return 'Sušnik';
  });

  // 2. Korak – Člani družine z letnico rojstva in starostnimi skupinami
  const currentYear = new Date().getFullYear();
  const [members, setMembers] = useState(() => {
    if (initialFamily?.members && initialFamily.members.length > 0) {
      return initialFamily.members;
    }
    return [
      { id: 'user-1', name: 'Miha', birthYear: 1988, avatar: '👨', role: 'admin', preference: 'best_value', color: '#10b981' },
      { id: 'user-2', name: 'Veronika', birthYear: 1990, avatar: '👩', role: 'member', preference: 'premium_local', color: '#ec4899' },
      { id: 'user-3', name: 'Domen', birthYear: 2015, avatar: '👦', role: 'member', preference: 'cheapest', color: '#3b82f6' }
    ];
  });

  // Vnos novega člana
  const [memberName, setMemberName] = useState('');
  const [memberBirthYear, setMemberBirthYear] = useState('2018');
  const [memberAvatar, setMemberAvatar] = useState('👦');

  // 3. Korak – Trgovine in Kulinarika (6 kartic: Slovenska, Azijska, Italijanska, Indijska, Ameriška, Mehiška)
  const [selectedStores, setSelectedStores] = useState(() => {
    return initialFamily?.preferences?.favoriteStores || ['spar', 'lidl', 'hofer', 'mercator'];
  });
  const [selectedCuisines, setSelectedCuisines] = useState(() => {
    return initialFamily?.preferences?.cuisines || ['slovenska', 'azijska', 'italijanska'];
  });

  // 4. Korak – Začetni osnovni artikli (staples & shortcuts)
  const [selectedStaples, setSelectedStaples] = useState(() => {
    return initialFamily?.preferences?.stapleItems || ['Mleko', 'Kruh', 'Jajca', 'Maslo', 'Banane', 'Kava Barcaffè', 'Testenine Barilla'];
  });
  const [addToShortcuts, setAddToShortcuts] = useState(true);
  const [addToList, setAddToList] = useState(true);

  if (!isOpen) return null;

  // Izračun starostnih skupin
  const ageGroupCounts = members.reduce((acc, m) => {
    const info = getAgeGroup(m.birthYear);
    acc[info.group] = (acc[info.group] || 0) + 1;
    return acc;
  }, { otroci: 0, mladostniki: 0, odrasli: 0 });

  const handleAddMember = (e) => {
    e?.preventDefault();
    if (!memberName.trim()) return;

    const bYear = parseInt(memberBirthYear) || (currentYear - 20);
    const newM = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: memberName.trim(),
      birthYear: bYear,
      avatar: memberAvatar,
      role: members.length === 0 ? 'admin' : 'member',
      preference: 'best_value',
      color: '#3b82f6'
    };

    setMembers([...members, newM]);
    setMemberName('');
    setMemberBirthYear('2018');
  };

  const handleRemoveMember = (id) => {
    if (members.length <= 1) {
      alert('V družini mora ostati vsaj en član!');
      return;
    }
    setMembers(members.filter(m => m.id !== id));
  };

  const toggleStore = (storeId) => {
    if (selectedStores.includes(storeId)) {
      if (selectedStores.length === 1) return;
      setSelectedStores(selectedStores.filter(s => s !== storeId));
    } else {
      setSelectedStores([...selectedStores, storeId]);
    }
  };

  const toggleCuisine = (cuisineId) => {
    if (selectedCuisines.includes(cuisineId)) {
      if (selectedCuisines.length === 1) return;
      setSelectedCuisines(selectedCuisines.filter(c => c !== cuisineId));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisineId]);
    }
  };

  const toggleStaple = (title) => {
    if (selectedStaples.includes(title)) {
      setSelectedStaples(selectedStaples.filter(s => s !== title));
    } else {
      setSelectedStaples([...selectedStaples, title]);
    }
  };

  const handleFinish = () => {
    try {
      confetti({ particleCount: 110, spread: 80, origin: { y: 0.5 } });
    } catch {}

    const familyNameFull = `Družina ${lastName.trim() || 'Sušnik'}`;

    const completedFamily = {
      familyName: familyNameFull,
      members,
      preferences: {
        favoriteStores: selectedStores,
        cuisines: selectedCuisines,
        stapleItems: selectedStaples,
        dietaryFlags: initialFamily?.preferences?.dietaryFlags || ['lokalno_slo']
      },
      onboardingCompleted: true
    };

    onComplete(completedFamily, {
      importStaples: addToList,
      addToShortcuts,
      staples: selectedStaples
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header z napredkom */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 pt-5 pb-4 text-white shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-white/20 backdrop-blur-md text-white">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold leading-tight">
                  Spoznavni vprašalnik družine
                </h2>
                <p className="text-xs text-emerald-100">
                  Prilagojen nakupovalni načrt, cene in pametna kuharica
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper (4 koraki) */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { num: 1, label: '1. Poimenovanje' },
              { num: 2, label: '2. Člani družine' },
              { num: 3, label: '3. Trgovine & Jedi' },
              { num: 4, label: '4. Osnovni artikli' }
            ].map(s => {
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <div 
                  key={s.num} 
                  onClick={() => setStep(s.num)}
                  className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    isActive ? 'opacity-100 font-bold' : isDone ? 'opacity-90' : 'opacity-40'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-transform ${
                    isActive ? 'bg-white text-emerald-700 shadow-md scale-110' : isDone ? 'bg-emerald-400 text-emerald-950' : 'bg-white/20 text-white'
                  }`}>
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <span className="text-[10px] text-center leading-tight truncate w-full hidden sm:block">
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vsebina */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* 1. KORAK – POIMENOVANJE */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl mx-auto mb-2 shadow-2xs">
                  🏠
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Kako je priimek vaše družine?
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Po priimku bo poimenovana vaša skupna nakupovalna košarica in ustvarjena koda za povezavo družinskih naprav.
                </p>
              </div>

              <div className="max-w-md mx-auto pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Priimek družine
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold shrink-0">
                    Družina
                  </span>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="npr. Sušnik ali Novak"
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Skupna košarica: <strong>Družina {lastName.trim() || '...'}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. KORAK – ČLANI DRUŽINE IN STAROSTNE SKUPINE */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                  Družinski člani & Starostne skupine
                </h3>
                <p className="text-xs text-slate-500">
                  Z letnico rojstva sistem prilagodi količine in prehranske potrebe za otroke, mladostnike in odrasle.
                </p>
              </div>

              {/* Kazalnik starostnih skupin */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <div className="p-1.5 bg-white rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Otroci (&lt;13 let)</div>
                  <div className="text-sm font-black text-emerald-600">{ageGroupCounts.otroci}</div>
                </div>
                <div className="p-1.5 bg-white rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Mladostniki (13-18)</div>
                  <div className="text-sm font-black text-blue-600">{ageGroupCounts.mladostniki}</div>
                </div>
                <div className="p-1.5 bg-white rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Odrasli (18+)</div>
                  <div className="text-sm font-black text-slate-800">{ageGroupCounts.odrasli}</div>
                </div>
              </div>

              {/* Seznam trenutnih članov */}
              <div className="space-y-2">
                {members.map(m => {
                  const ageInfo = getAgeGroup(m.birthYear);
                  return (
                    <div 
                      key={m.id}
                      className="flex items-center justify-between p-2.5 px-3 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-300 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{m.avatar || '🧑'}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{m.name}</span>
                            <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                              ageInfo.group === 'otroci' ? 'bg-emerald-100 text-emerald-800' :
                              ageInfo.group === 'mladostniki' ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {ageInfo.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">Roj. {m.birthYear || '—'}</span>
                        </div>
                      </div>

                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Obrazec za dodajanje člana */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2.5">
                <span className="text-xs font-bold text-emerald-950 block">Dodaj družinskega člana:</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Ime (npr. Luka)"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                  />
                  <input
                    type="number"
                    placeholder="Leto rojstva (npr. 2017)"
                    value={memberBirthYear}
                    onChange={(e) => setMemberBirthYear(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap gap-1">
                    {AVAILABLE_AVATARS.slice(0, 8).map(av => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setMemberAvatar(av)}
                        className={`w-6 h-6 rounded-lg text-sm flex items-center justify-center cursor-pointer transition ${
                          memberAvatar === av ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-slate-100'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition cursor-pointer shrink-0 shadow-2xs"
                  >
                    + Dodaj
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. KORAK – TRGOVINE IN KULINARIKA */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Trgovine */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Najpogostejše trgovine ({selectedStores.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STORES_LIST.filter(s => s.id !== 'splosno').map(store => {
                    const isSelected = selectedStores.includes(store.id);
                    return (
                      <button
                        key={store.id}
                        type="button"
                        onClick={() => toggleStore(store.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-400 shadow-2xs'
                            : 'border-slate-200 bg-white opacity-70 hover:opacity-100'
                        }`}
                      >
                        <StoreBadge storeName={store.name} size="sm" />
                        <span className="text-xs font-bold text-slate-900 truncate flex-1">{store.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6 Kulinaričnih kartic */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Priljubljene svetovne in domače kuhinje
                </h3>
                <p className="text-[11px] text-slate-500 mb-2">
                  Izberite kuhinje, ki jih vaša družina najraje kuha za prilagoditev receptov:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CUISINES_OPTIONS.map(c => {
                    const isSelected = selectedCuisines.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCuisine(c.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-400 shadow-2xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl p-1 bg-white rounded-xl shadow-2xs">{c.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-900 block">{c.label}</span>
                          <span className="text-[10px] text-slate-500 block truncate">{c.desc}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 4. KORAK – ZAČETNI OSNOVNI ARTIKLI */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                  Začetni osnovni artikli družine
                </h3>
                <p className="text-xs text-slate-500">
                  Potrdite artikle, ki jih družina vedno rabi doma. Samodejno bodo dodani med vaše priljubljene bližnjice.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STAPLE_CANDIDATES.map(item => {
                  const isSelected = selectedStaples.includes(item.title);
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => toggleStaple(item.title)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-400'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-xs truncate flex-1">{item.title}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              {/* Nastavitve uvoza */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="addToList"
                    checked={addToList}
                    onChange={(e) => setAddToList(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="addToList" className="text-xs font-semibold text-emerald-950 cursor-pointer">
                    Takoj dodaj izbrana živila na nakupovalni seznam
                  </label>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-teal-50/70 border border-teal-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="addToShortcuts"
                    checked={addToShortcuts}
                    onChange={(e) => setAddToShortcuts(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                  />
                  <label htmlFor="addToShortcuts" className="text-xs font-semibold text-teal-950 cursor-pointer">
                    Dodaj izbrana živila med stalne bližnjice na vrhu seznama
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Spodnji gumbi za navigacijo med koraki */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Nazaj
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1 px-5 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              Naprej <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/25 transition cursor-pointer scale-105 active:scale-100"
            >
              <CheckCircle2 className="w-4 h-4" /> Potrdi & Začni nakupovati
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
