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
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import StoreBadge from './StoreBadge';
import { STORES_LIST } from '../data/stores';
import { CUISINES_OPTIONS, DIETARY_OPTIONS, STAPLE_CANDIDATES } from '../data/defaultFamilies';
import { AVAILABLE_AVATARS, PREFERENCE_LABELS } from '../data/commonItems';

export default function OnboardingModal({
  isOpen,
  onClose,
  initialFamily = null,
  onComplete
}) {
  const [step, setStep] = useState(1); // 1: Člani, 2: Trgovine, 3: Kuhinja & diete, 4: Staples & Zaključek

  // 1. Podatki o družini
  const [familyName, setFamilyName] = useState(() => initialFamily?.familyName || 'Družina Sušnik');
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

  // Za dodajanje novega člana v koraku 1
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberBirthYear, setNewMemberBirthYear] = useState('2018');
  const [newMemberAvatar, setNewMemberAvatar] = useState('👦');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [showAddMember, setShowAddMember] = useState(false);

  // 2. Priljubljene trgovine
  const [selectedStores, setSelectedStores] = useState(() => {
    return initialFamily?.preferences?.favoriteStores || ['spar', 'lidl', 'hofer', 'mercator'];
  });

  // 3. Kuhinje & diete
  const [selectedCuisines, setSelectedCuisines] = useState(() => {
    return initialFamily?.preferences?.cuisines || ['slovenska', 'italijanska', 'mediteranska'];
  });
  const [selectedDietary, setSelectedDietary] = useState(() => {
    return initialFamily?.preferences?.dietaryFlags || ['lokalno_slo', 'manj_sladkorja'];
  });

  // 4. Osnovna živila (Staples)
  const [selectedStaples, setSelectedStaples] = useState(() => {
    return initialFamily?.preferences?.stapleItems || ['Mleko', 'Kruh', 'Jajca', 'Maslo', 'Banane'];
  });
  const [importStaplesToList, setImportStaplesToList] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();

  // Dodajanje člana
  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const newM = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: newMemberName.trim(),
      birthYear: parseInt(newMemberBirthYear) || (currentYear - 10),
      avatar: newMemberAvatar,
      role: newMemberRole,
      preference: 'best_value',
      color: '#3b82f6'
    };
    setMembers([...members, newM]);
    setNewMemberName('');
    setShowAddMember(false);
  };

  const handleRemoveMember = (id) => {
    if (members.length <= 1) {
      alert('V družini mora ostati vsaj en član!');
      return;
    }
    setMembers(members.filter(m => m.id !== id));
  };

  // Preklop trgovine
  const toggleStore = (storeId) => {
    if (selectedStores.includes(storeId)) {
      if (selectedStores.length === 1) return; // Vsaj 1 trgovina
      setSelectedStores(selectedStores.filter(s => s !== storeId));
    } else {
      setSelectedStores([...selectedStores, storeId]);
    }
  };

  // Preklop kuhinje
  const toggleCuisine = (cuisineId) => {
    if (selectedCuisines.includes(cuisineId)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== cuisineId));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisineId]);
    }
  };

  // Preklop diete
  const toggleDietary = (dietId) => {
    if (selectedDietary.includes(dietId)) {
      setSelectedDietary(selectedDietary.filter(d => d !== dietId));
    } else {
      setSelectedDietary([...selectedDietary, dietId]);
    }
  };

  // Preklop osnovnih živil
  const toggleStaple = (itemTitle) => {
    if (selectedStaples.includes(itemTitle)) {
      setSelectedStaples(selectedStaples.filter(s => s !== itemTitle));
    } else {
      setSelectedStaples([...selectedStaples, itemTitle]);
    }
  };

  const handleFinish = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch {}

    const completedFamily = {
      familyName: familyName.trim() || 'Družina',
      members,
      preferences: {
        favoriteStores: selectedStores,
        cuisines: selectedCuisines,
        dietaryFlags: selectedDietary,
        stapleItems: selectedStaples
      },
      onboardingCompleted: true
    };

    onComplete(completedFamily, {
      importStaples: importStaplesToList,
      staples: selectedStaples
    });
  };

  const copyJoinCode = (code) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header s trakom napredka */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 pt-5 pb-4 text-white shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-white/20 backdrop-blur-md text-white">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold leading-tight">
                  Spoznavni vprašalnik družine
                </h2>
                <p className="text-xs text-emerald-100">
                  Prilagoditev ponudb, pametne kuharice in cen za vaš dom
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
              { num: 1, label: 'Družina & Člani', icon: Users },
              { num: 2, label: 'Trgovine', icon: Store },
              { num: 3, label: 'Kuhinja & Diete', icon: UtensilsCrossed },
              { num: 4, label: 'Živila & Koda', icon: ShoppingBag }
            ].map(s => {
              const isActive = step === s.num;
              const isDone = step > s.num;
              const IconComp = s.icon;
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

        {/* Telo vprašalnika */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* KORAK 1: DRUŽINA IN ČLANI */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Priimek ali ime družine
                </label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="npr. Družina Sušnik"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Družinski člani ({members.length})
                  </label>
                  {!showAddMember && (
                    <button
                      type="button"
                      onClick={() => setShowAddMember(true)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Dodaj člana
                    </button>
                  )}
                </div>

                {/* Seznam obstoječih članov */}
                <div className="space-y-2">
                  {members.map(member => {
                    const age = member.birthYear ? (currentYear - member.birthYear) : null;
                    return (
                      <div 
                        key={member.id} 
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{member.avatar || '🧑'}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-slate-900">{member.name}</span>
                              {member.role === 'admin' && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  Skrbnik
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500">
                              {age !== null ? `${age} let` : 'Član'} • {PREFERENCE_LABELS[member.preference || 'best_value']?.badge || 'Uravnoteženo'}
                            </span>
                          </div>
                        </div>

                        {members.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                            title="Odstrani člana"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Obrazec za dodajanje člana */}
                {showAddMember && (
                  <div className="mt-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                    <div className="text-xs font-bold text-emerald-900">Nov družinski član:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Ime (npr. Luka)"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                      />
                      <input
                        type="number"
                        placeholder="Leto rojstva (npr. 2016)"
                        value={newMemberBirthYear}
                        onChange={(e) => setNewMemberBirthYear(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-600 mb-1">Izberi avatar:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_AVATARS.slice(0, 12).map(av => (
                          <button
                            key={av}
                            type="button"
                            onClick={() => setNewMemberAvatar(av)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition cursor-pointer ${
                              newMemberAvatar === av ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100'
                            }`}
                          >
                            {av}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddMember(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                      >
                        Prekliči
                      </button>
                      <button
                        type="button"
                        onClick={handleAddMember}
                        className="px-3 py-1.5 text-xs bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 cursor-pointer"
                      >
                        Dodaj člana
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KORAK 2: PRILJUBLJENE TRGOVINE */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Kje vaša družina najpogosteje nakupuje?
                </h3>
                <p className="text-xs text-slate-500">
                  Aplikacija bo prednostno iskala popuste, letake in najugodnejše cene v izbranih trgovinah.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {STORES_LIST.filter(s => s.id !== 'splosno').map(store => {
                  const isSelected = selectedStores.includes(store.id);
                  return (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => toggleStore(store.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-400' 
                          : 'border-slate-200 bg-white hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <StoreBadge storeName={store.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {store.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {store.types?.includes('beauty') ? 'Drogerija' : 'Živila'}
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* KORAK 3: KUHINJE IN PREHRANSKE DIETE */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Kulinarični okusi družine
                </h3>
                <p className="text-xs text-slate-500 mb-2.5">
                  Kuharica bo prilagodila recepte in predloge za kosila vašim najljubšim kuhinjam.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CUISINES_OPTIONS.map(cuisine => {
                    const isSelected = selectedCuisines.includes(cuisine.id);
                    return (
                      <button
                        key={cuisine.id}
                        type="button"
                        onClick={() => toggleCuisine(cuisine.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                          isSelected 
                            ? 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-400' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl">{cuisine.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-900 block">
                            {cuisine.label}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {cuisine.desc}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[2.5]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Prehranske posebnosti & Diete
                </h3>
                <p className="text-xs text-slate-500 mb-2.5">
                  Označite morebitne alergije, diete ali posebne prehranske zahteve članov:
                </p>

                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map(diet => {
                    const isSelected = selectedDietary.includes(diet.id);
                    return (
                      <button
                        key={diet.id}
                        type="button"
                        onClick={() => toggleDietary(diet.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span>{diet.emoji}</span>
                        <span>{diet.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-0.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* KORAK 4: OSNOVNA TEDENSKA ŽIVILA & ZAKLJUČEK */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Osnovna živila družine (Tedenski Staples)
                </h3>
                <p className="text-xs text-slate-500 mb-2.5">
                  Izberite artikle, ki jih vaša družina redno kupuje. Za njih bomo samodejno spremljali akcije.
                </p>

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

                <div className="mt-3 flex items-center gap-2.5 p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <input
                    type="checkbox"
                    id="importStaples"
                    checked={importStaplesToList}
                    onChange={(e) => setImportStaplesToList(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="importStaples" className="text-xs font-semibold text-emerald-950 cursor-pointer">
                    Takoj uvozi izbrana osnovna živila na nakupovalni seznam družine
                  </label>
                </div>
              </div>

              {/* Informacija o kodi družine */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" /> Koda za pridružitev članov
                  </div>
                  <span className="text-xs text-slate-400">Za druge telefone</span>
                </div>
                <div className="flex items-center justify-between bg-white/10 px-3.5 py-2 rounded-xl">
                  <span className="font-mono text-base font-bold tracking-widest text-white">
                    {initialFamily?.familyId || `${familyName.replace(/[^a-zA-Z]/g, '').slice(0, 6) || 'Susnik'}-4102`}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyJoinCode(initialFamily?.familyId || 'Susnik-4102')}
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition cursor-pointer text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedCode ? 'Kopirano!' : 'Kopiraj'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Drugi družinski člani lahko v nastavitvah vpišejo to kodo in takoj dostopajo do skupnega seznama, kuharice in zgodovine!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Spodnja navigacijska vrstica */}
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
              <CheckCircle2 className="w-4 h-4" /> Zaključi & Shrani profil
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
