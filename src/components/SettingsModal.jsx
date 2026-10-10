import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Key, 
  Database, 
  RefreshCw, 
  Check, 
  Smartphone, 
  HardDrive,
  Users,
  UserPlus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  Shield,
  Palette
} from 'lucide-react';
import { isFirebaseConfigured, saveFirebaseConfig } from '../firebase';
import { seedDealsToFirestore } from '../services/shoppingService';
import { AVAILABLE_AVATARS } from '../data/commonItems';

const MEMBER_COLORS = [
  '#10b981', // smaragdna
  '#3b82f6', // modra
  '#ec4899', // roza
  '#f59e0b', // jantarna
  '#8b5cf6', // vijolična
  '#06b6d4', // cian
  '#ef4444', // rdeča
  '#64748b'  // siva
];

export default function SettingsModal({
  isOpen,
  onClose,
  familyMembers = [],
  onUpdateFamilyMembers,
  currentMember,
  onSelectCurrentMember,
  activeFamily = null,
  onOpenOnboarding = null,
  onOpenFamilyManager = null,
  onLogoutFamily = null
}) {
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('nakupki_gemini_key') || '');
  const [rawConfigJson, setRawConfigJson] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Stanje za urejanje uporabnikov
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('👩');
  const [editColor, setEditColor] = useState('#10b981');

  // Stanje za dodajanje novega uporabnika
  const [showAddMember, setShowAddMember] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('🧑');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [showPwaTroubleshoot, setShowPwaTroubleshoot] = useState(false);

  if (!isOpen) return null;

  // --- UPRAVLJANJE UPORABNIKOV ---
  const handleStartEdit = (member) => {
    setEditingMemberId(member.id);
    setEditName(member.name);
    setEditAvatar(member.avatar || '🧑');
    setEditColor(member.color || '#10b981');
  };

  const handleSaveEdit = (memberId) => {
    if (!editName.trim()) {
      alert('Ime uporabnika ne sme biti prazno!');
      return;
    }

    const updated = familyMembers.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          name: editName.trim(),
          avatar: editAvatar,
          color: editColor
        };
      }
      return m;
    });

    onUpdateFamilyMembers(updated);
    
    // Če smo urejali trenutno izbranega člana, posodobi tudi njegovo stanje
    if (currentMember?.id === memberId || currentMember?.name === editName) {
      const updatedCurrent = updated.find(m => m.id === memberId);
      if (updatedCurrent) onSelectCurrentMember(updatedCurrent);
    }

    setEditingMemberId(null);
  };

  const handleDeleteMember = (member) => {
    if (familyMembers.length <= 1) {
      alert('V aplikaciji mora ostati vsaj en družinski član!');
      return;
    }

    if (confirm(`Ali ste prepričani, da želite izbrisati uporabnika "${member.name}"?`)) {
      const updated = familyMembers.filter(m => m.id !== member.id);
      onUpdateFamilyMembers(updated);

      // Če je bil izbrisan trenutno aktiven član, preklopi na prvega
      if (currentMember?.id === member.id) {
        onSelectCurrentMember(updated[0]);
      }
    }
  };

  const handleAddNewMember = (e) => {
    e?.preventDefault();
    if (!newName.trim()) {
      alert('Vnesite ime novega uporabnika!');
      return;
    }

    const newMember = {
      id: 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: newName.trim(),
      avatar: newAvatar,
      color: newColor
    };

    const updated = [...familyMembers, newMember];
    onUpdateFamilyMembers(updated);
    
    setNewName('');
    setShowAddMember(false);
  };

  // --- FIREBASE IN OSTALE NASTAVITVE ---
  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    if (rawConfigJson.trim()) {
      try {
        const parsed = JSON.parse(rawConfigJson);
        saveFirebaseConfig(parsed);
        return;
      } catch (err) {
        alert('Neveljaven JSON format Firebase konfiguracije!');
        return;
      }
    }

    if (apiKey.trim() && projectId.trim()) {
      saveFirebaseConfig({
        apiKey: apiKey.trim(),
        projectId: projectId.trim(),
        authDomain: `${projectId.trim()}.firebaseapp.com`,
        storageBucket: `${projectId.trim()}.appspot.com`,
      });
    } else {
      alert('Vnesite vsaj API ključ in Project ID ali prilepite celoten Firebase config JSON.');
    }
  };

  const handleSaveGeminiKey = () => {
    if (geminiKey.trim()) {
      localStorage.setItem('nakupki_gemini_key', geminiKey.trim());
      alert('Gemini API ključ je shranjen!');
    } else {
      localStorage.removeItem('nakupki_gemini_key');
    }
  };

  const handleResetToLocal = () => {
    if (confirm('Ali želite odstraniti Firebase konfiguracijo in preklopiti na lokalni način?')) {
      saveFirebaseConfig(null);
    }
  };

  const handleSeedDeals = async () => {
    setIsSeeding(true);
    const ok = await seedDealsToFirestore();
    setIsSeeding(false);
    if (ok) {
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } else {
      alert('Za nalaganje v bazo morate najprej uspešno povezati Firebase!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              ⚙️
            </div>
            <h2 className="text-base font-bold text-slate-900">Nastavitve aplikacije</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">

          {/* ======================================================== */}
          {/* SEKCIJA 0: DRUŽINSKI PROFIL & MULTI-TENANCY */}
          {/* ======================================================== */}
          {activeFamily && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                    🏠
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Družinski profil & Koda
                    </h3>
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      {activeFamily.familyName}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 font-mono text-xs font-bold text-emerald-900">
                  {activeFamily.familyId}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {onOpenOnboarding && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenOnboarding();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <span>✨ Zaženi spoznavni vprašalnik</span>
                  </button>
                )}
                {onOpenFamilyManager && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenFamilyManager();
                    }}
                    className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Preklopi družino</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SEKCIJA 1: DRUŽINSKI ČLANI & UPORABNIKI */}
          {/* ======================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Družinski člani & Uporabniki
                </h3>
              </div>
              
              {!showAddMember && (
                <button
                  type="button"
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition border border-emerald-200"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Dodaj člana</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              Urejajte imena, spreminjajte ikone (emojije), dodajajte nove družinske člane ali odstranite tiste, ki jih ne potrebujete.
            </p>

            {/* Obrazec za dodajanje novega člana */}
            {showAddMember && (
              <form onSubmit={handleAddNewMember} className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nov družinski član</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddMember(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Ime člana:
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="npr. Luka, Teta Vesna, Matic..."
                    autoFocus
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Izbira avatarja */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Izberi avatar ikono:
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {AVAILABLE_AVATARS.map((av) => (
                      <button
                        type="button"
                        key={av}
                        onClick={() => setNewAvatar(av)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 transition border ${
                          newAvatar === av 
                            ? 'bg-white border-emerald-600 ring-2 ring-emerald-500 shadow-xs' 
                            : 'bg-white/80 border-slate-200 hover:bg-white'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Izbira barve */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Ozadje značke:
                  </label>
                  <div className="flex items-center gap-2">
                    {MEMBER_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setNewColor(c)}
                        className={`w-6 h-6 rounded-full transition ${
                          newColor === c ? 'ring-2 ring-offset-2 ring-slate-700 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddMember(false)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
                  >
                    Prekliči
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    Shrani člana
                  </button>
                </div>
              </form>
            )}

            {/* Seznam trenutnih članov */}
            <div className="space-y-2">
              {familyMembers.map((member) => {
                const isCurrent = currentMember?.id === member.id || currentMember?.name === member.name;
                const isEditing = editingMemberId === member.id;

                if (isEditing) {
                  return (
                    <div 
                      key={member.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border-2 border-emerald-500 shadow-sm space-y-3 animate-in fade-in duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Urejanje člana</span>
                        <button
                          onClick={() => setEditingMemberId(null)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          placeholder="Ime člana"
                        />
                      </div>

                      {/* Izbira avatarja pri urejanju */}
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 block mb-1">Avatar ikona:</span>
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                          {AVAILABLE_AVATARS.map((av) => (
                            <button
                              type="button"
                              key={av}
                              onClick={() => setEditAvatar(av)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 border ${
                                editAvatar === av 
                                  ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-400' 
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              {av}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Izbira barve pri urejanju */}
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 block mb-1">Barva:</span>
                        <div className="flex items-center gap-2">
                          {MEMBER_COLORS.map((c) => (
                            <button
                              type="button"
                              key={c}
                              onClick={() => setEditColor(c)}
                              className={`w-5 h-5 rounded-full transition ${
                                editColor === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => setEditingMemberId(null)}
                          className="px-2.5 py-1.5 rounded-lg text-slate-600 text-xs font-semibold hover:bg-slate-200/60"
                        >
                          Prekliči
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(member.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Shrani spremembe</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div 
                        className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg shadow-xs shrink-0"
                        style={{ backgroundColor: member.color ? `${member.color}20` : '#f1f5f9' }}
                      >
                        {member.avatar || '🧑'}
                      </div>
                      
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {member.name}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                              Aktivno
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Gumb: Nastavi kot aktivnega */}
                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => onSelectCurrentMember(member)}
                          className="px-2 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition"
                          title="Izberi tega člana za vnos"
                        >
                          Izberi
                        </button>
                      )}

                      {/* Gumb: Uredi */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(member)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                        title="Uredi ime in avatar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Gumb: Izbriši */}
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(member)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Izbriši uporabnika"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SEKCIJA 2: POVEZAVA IN SINHRONIZACIJA (FIREBASE) */}
          {/* ======================================================== */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-600" />
              <span>Sinhronizacija med napravami</span>
            </h3>

            {/* Trenutno stanje */}
            <div className={`p-3.5 rounded-2xl border ${
              isFirebaseConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                {isFirebaseConfigured ? (
                  <Cloud className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <HardDrive className="w-5 h-5 text-slate-500 shrink-0" />
                )}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {isFirebaseConfigured ? 'Povezano z bazo Firestore' : 'Lokalni način (Brez strežnika)'}
                  </h4>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {isFirebaseConfigured 
                      ? 'Posodobitve se v živo prenašajo na telefone vseh družinskih članov.'
                      : 'Podatki se shranjujejo lokalno v brskalniku. Za povezavo telefonov lahko kadarkoli vnesete Firebase.'}
                  </p>
                </div>
              </div>

              {isFirebaseConfigured && (
                <button
                  onClick={handleResetToLocal}
                  className="mt-2 text-[11px] font-semibold text-rose-600 hover:underline"
                >
                  Odstrani Firebase in preklopi nazaj na lokalni način
                </button>
              )}
            </div>

            {/* Obrazec za Firebase konfiguracijo */}
            <div>
              <form onSubmit={handleSaveFirebaseConfig} className="space-y-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Prilepite Firebase Config JSON:
                  </label>
                  <textarea
                    rows="2"
                    value={rawConfigJson}
                    onChange={(e) => setRawConfigJson(e.target.value)}
                    placeholder='{ "apiKey": "AIzaSy...", "projectId": "moja-druzina-123", ... }'
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                >
                  Shrani Firebase povezavo
                </button>
              </form>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SEKCIJA 3: GOOGLE GEMINI AI ZA KATALOGE */}
          {/* ======================================================== */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-600" />
              <span>Google Gemini API Ključ</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-2">
              Za avtomatsko branje tedenskih letakov s skripto <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">npm run ingest</code>.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <button
                onClick={handleSaveGeminiKey}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition"
              >
                Shrani
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SEKCIJA 4: NAMESTITEV NA TELEFON (PWA) */}
          {/* ======================================================== */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Namestitev na telefon (PWA)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPwaTroubleshoot(!showPwaTroubleshoot)}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 underline cursor-pointer"
              >
                {showPwaTroubleshoot ? 'Zapri navodila' : 'Telefon javi: "Že nameščeno"?'}
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Aplikacijo lahko namestite na telefon brez brskalniške vrstice in z ikono na domačem zaslonu.
            </p>

            {showPwaTroubleshoot && (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2 text-emerald-950 animate-in fade-in duration-150">
                <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  💡 Zakaj telefon napiše &quot;Ta aplikacija je že nameščena&quot;?
                </h4>
                <p className="text-[11px] leading-relaxed">
                  Android sistemi (Chrome in Samsung Internet) v ozadju ustvarijo paket aplikacije (WebAPK). Če aplikacije ne vidite na začetnem zaslonu:
                </p>
                <ol className="list-decimal pl-4 text-[11px] space-y-1.5 font-medium">
                  <li>
                    <strong>Poiščite jo v predalu z vsemi aplikacijami:</strong> Na domačem zaslonu telefona s prstom podrsajte navzgor in poiščite ikono <strong>&quot;Nakupi&quot;</strong>. Pridržite jo in povlecite na začetni zaslon.
                  </li>
                  <li>
                    <strong>Če je bila ikona odstranjena le z namizja:</strong> V Androidu gumb &quot;Odstrani z namizja&quot; odstrani le bližnjico. Pojdite v <em>Nastavitve telefona &rarr; Aplikacije &rarr; Nakupi</em> ter izberite <strong>Odstrani (Uninstall)</strong>. Nato se vrnite v Chrome in ponovno kliknite <em>Namesti</em>.
                  </li>
                  <li>
                    <strong>Počistite spletno mesto v Chrome:</strong> V Chromu tapnite ikono nastavitev poleg naslova URL &rarr; <em>Nastavitve spletnega mesta &rarr; Počisti in ponastavi</em>.
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* SEKCIJA 5: ODJAVA DRUŽINE (PIN ZAŠČITA) */}
          {/* ======================================================== */}
          {onLogoutFamily && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Odjava trenutne družine</h4>
                <p className="text-[11px] text-slate-500">
                  Preklop na vstopni zaslon za menjavo profila ali naprave.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Ali se želite odjaviti iz trenutne družine?')) {
                    onLogoutFamily();
                    onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs cursor-pointer transition shrink-0"
              >
                Odjava družine
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
