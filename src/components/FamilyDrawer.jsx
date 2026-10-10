import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Check, 
  ChevronRight, 
  Users, 
  Sparkles,
  Calendar,
  HeartHandshake
} from 'lucide-react';
import { AVAILABLE_AVATARS, PREFERENCE_LABELS } from '../data/commonItems';

const MEMBER_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ec4899', // pink
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ef4444', // red
  '#64748b'  // slate
];

const BIRTH_YEAR_OPTIONS = [
  { label: 'Odrasli (1985-2005)', year: 1990 },
  { label: 'Mladostnik (2006-2012)', year: 2010 },
  { label: 'Otrok (2013-2020)', year: 2017 },
  { label: 'Malček / Dojenček (2021-2026)', year: 2023 }
];

export default function FamilyDrawer({
  isOpen,
  onClose,
  users = [],
  activeUser,
  onSelectUser,
  onSaveUsers,
  activeFamily
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formBirthYear, setFormBirthYear] = useState(1990);
  const [formAvatar, setFormAvatar] = useState('👨');
  const [formColor, setFormColor] = useState('#10b981');
  const [formRole, setFormRole] = useState('member');
  const [formPreference, setFormPreference] = useState('best_value');

  if (!isOpen) return null;

  const handleSelectAndClose = (user) => {
    onSelectUser?.(user);
    onClose?.();
  };

  const handleStartAdd = () => {
    setEditingUserId(null);
    setFormName('');
    setFormBirthYear(1995);
    setFormAvatar('👦');
    setFormColor(MEMBER_COLORS[users.length % MEMBER_COLORS.length]);
    setFormRole('member');
    setFormPreference('best_value');
    setShowAddForm(true);
  };

  const handleStartEdit = (user, e) => {
    e?.stopPropagation();
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormBirthYear(user.birthYear || 1990);
    setFormAvatar(user.avatar || '🧑');
    setFormColor(user.color || '#10b981');
    setFormRole(user.role || 'member');
    setFormPreference(user.preference || 'best_value');
    setShowAddForm(true);
  };

  const handleSaveMember = (e) => {
    e?.preventDefault();
    if (!formName.trim()) {
      alert('Vnesite ime člana družine!');
      return;
    }

    if (editingUserId) {
      // Posodobitev obstoječega
      const updated = users.map(u => {
        if (u.id === editingUserId) {
          return {
            ...u,
            name: formName.trim(),
            birthYear: Number(formBirthYear) || 1990,
            avatar: formAvatar,
            color: formColor,
            role: formRole,
            preference: formPreference
          };
        }
        return u;
      });

      onSaveUsers?.(updated);
      if (activeUser?.id === editingUserId) {
        const found = updated.find(u => u.id === editingUserId);
        if (found) onSelectUser?.(found);
      }
    } else {
      // Dodajanje novega člana
      const newMember = {
        id: 'mem_' + Date.now(),
        name: formName.trim(),
        birthYear: Number(formBirthYear) || 1995,
        avatar: formAvatar,
        color: formColor,
        role: formRole,
        preference: formPreference
      };

      const updated = [...users, newMember];
      onSaveUsers?.(updated);
      // Samodejno izberi novega člana
      onSelectUser?.(newMember);
    }

    setShowAddForm(false);
    setEditingUserId(null);
  };

  const handleDeleteMember = (userId, e) => {
    e?.stopPropagation();
    if (users.length <= 1) {
      alert('V družini mora ostati vsaj en član!');
      return;
    }
    const memberToDelete = users.find(u => u.id === userId);
    if (confirm(`Ali ste prepričani, da želite odstraniti člana "${memberToDelete?.name}"?`)) {
      const updated = users.filter(u => u.id !== userId);
      onSaveUsers?.(updated);
      if (activeUser?.id === userId) {
        onSelectUser?.(updated[0]);
      }
      setShowAddForm(false);
      setEditingUserId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      
      {/* Ozadje klik za zaprtje */}
      <div className="flex-1" onClick={onClose} />

      {/* Spodnji list (Bottom Sheet) */}
      <div 
        className="w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ročka za poteg (Drag pill) */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-1" />

        {/* Glava predala */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg shadow-2xs">
              👨‍👩‍👧‍👦
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                {activeFamily?.familyName || 'Družinski člani'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Izberite kdo trenutno drži telefon ali dodajte novega člana
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vsebina drsnega menija */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
          
          {/* Obrazec za dodajanje ali urejanje člana */}
          {showAddForm ? (
            <form onSubmit={handleSaveMember} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  {editingUserId ? 'Uredi družinskega člana' : 'Nov družinski član'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Prekliči
                </button>
              </div>

              {/* Ime */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Ime člana:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="npr. Mark, Luka, Veronika..."
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Izbira Avatarja */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Izberite Avatar:</label>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {AVAILABLE_AVATARS.map((av) => (
                    <button
                      type="button"
                      key={av}
                      onClick={() => setFormAvatar(av)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center shrink-0 border cursor-pointer transition ${
                        formAvatar === av
                          ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-500/30 scale-105'
                          : 'bg-white border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Starostna skupina / Letnica rojstva */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Starostna skupina:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {BIRTH_YEAR_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.year}
                      onClick={() => setFormBirthYear(opt.year)}
                      className={`p-2 rounded-xl text-left border text-xs font-bold transition cursor-pointer ${
                        formBirthYear === opt.year
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Barva profila */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Barva profila:</label>
                <div className="flex items-center gap-2">
                  {MEMBER_COLORS.map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setFormColor(col)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        formColor === col ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Gumbi za potrditev in izbris */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer"
                >
                  {editingUserId ? 'Shrani spremembe' : 'Dodaj člana v družino'}
                </button>

                {editingUserId && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteMember(editingUserId, e)}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                    title="Odstrani člana"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          ) : (
            <>
              {/* Vodoravni hitri trak avatarjev za en-dotični preklop */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Hiter preklop z enim dotikom:
                </div>
                
                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                  {users.map((user) => {
                    const isSelected = activeUser?.id === user.id;
                    return (
                      <button
                        type="button"
                        key={user.id}
                        onClick={() => handleSelectAndClose(user)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all cursor-pointer min-w-[70px] shrink-0 active:scale-95 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/25 shadow-xs'
                            : 'bg-white border-slate-200/90 hover:bg-slate-50'
                        }`}
                      >
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-2xs relative"
                          style={{ backgroundColor: user.color ? `${user.color}25` : '#f1f5f9' }}
                        >
                          {user.avatar || '🧑'}
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-bold truncate max-w-[65px] ${
                          isSelected ? 'text-emerald-900' : 'text-slate-700'
                        }`}>
                          {user.name}
                        </span>
                      </button>
                    );
                  })}

                  {/* Dodaj novega člana hitri gumb v traku */}
                  <button
                    type="button"
                    onClick={handleStartAdd}
                    className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/60 transition cursor-pointer min-w-[70px] shrink-0 active:scale-95"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center text-xl shadow-2xs">
                      <UserPlus className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-[11px] font-extrabold text-emerald-700">
                      + Dodaj
                    </span>
                  </button>
                </div>
              </div>

              {/* Podroben seznam članov z možnostjo urejanja */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Vsi člani družine ({users.length}):</span>
                  <span>Uredi profil</span>
                </div>

                <div className="space-y-1.5">
                  {users.map((user) => {
                    const isSelected = activeUser?.id === user.id;
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleSelectAndClose(user)}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition cursor-pointer active:scale-[0.99] ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                            style={{ backgroundColor: user.color ? `${user.color}20` : '#f1f5f9' }}
                          >
                            {user.avatar || '🧑'}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-sm">{user.name}</span>
                              {user.role === 'admin' && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                                  Skrbnik
                                </span>
                              )}
                              {isSelected && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                                  Aktiven
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Preferenca: {PREFERENCE_LABELS[user.preference || 'best_value']?.label || 'Best Value'}
                            </span>
                          </div>
                        </div>

                        {/* Gumb za urejanje */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleStartEdit(user, e)}
                            className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                            title="Uredi profil"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
