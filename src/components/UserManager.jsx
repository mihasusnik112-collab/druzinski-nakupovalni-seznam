import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Check, 
  Shield, 
  Sparkles,
  Sliders,
  ChevronRight,
  Save,
  CheckCircle2
} from 'lucide-react';
import { AVAILABLE_AVATARS, PREFERENCE_LABELS } from '../data/commonItems';

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

export default function UserManager({
  isOpen,
  onClose,
  users = [],
  activeUser,
  onSelectUser,
  onSaveUsers,
  initialTab = 'switch' // 'switch' | 'manage'
}) {
  const [tab, setTab] = useState(initialTab);
  
  // Stanje za urejanje
  const [editingUserId, setEditingUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('🧑');
  const [editColor, setEditColor] = useState('#10b981');
  const [editRole, setEditRole] = useState('member');
  const [editPreference, setEditPreference] = useState('best_value');

  // Stanje za dodajanje novega člana
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('🧑');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [newRole, setNewRole] = useState('member');
  const [newPreference, setNewPreference] = useState('best_value');

  if (!isOpen) return null;

  const handleStartEdit = (user) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditAvatar(user.avatar || '🧑');
    setEditColor(user.color || '#10b981');
    setEditRole(user.role || 'member');
    setEditPreference(user.preference || 'best_value');
  };

  const handleSaveEdit = (userId) => {
    if (!editName.trim()) {
      alert('Ime uporabnika ne sme biti prazno!');
      return;
    }

    const updated = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          name: editName.trim(),
          avatar: editAvatar,
          color: editColor,
          role: editRole,
          preference: editPreference
        };
      }
      return u;
    });

    onSaveUsers(updated);
    
    // Če smo urejali trenutno aktivnega
    if (activeUser?.id === userId) {
      const activeUpdated = updated.find(u => u.id === userId);
      if (activeUpdated) onSelectUser(activeUpdated);
    }

    setEditingUserId(null);
  };

  const handleDeleteUser = (user) => {
    if (users.length <= 1) {
      alert('V družini mora ostati vsaj en član!');
      return;
    }

    if (confirm(`Ali res želite odstraniti profil "${user.name}"?`)) {
      const updated = users.filter(u => u.id !== user.id);
      onSaveUsers(updated);

      if (activeUser?.id === user.id) {
        onSelectUser(updated[0]);
      }
    }
  };

  const handleAddNewUser = (e) => {
    e?.preventDefault();
    if (!newName.trim()) {
      alert('Vnesite ime družinskega člana!');
      return;
    }

    const newUser = {
      id: 'user-' + Date.now().toString(36),
      name: newName.trim(),
      avatar: newAvatar,
      color: newColor,
      role: newRole,
      preference: newPreference
    };

    const updated = [...users, newUser];
    onSaveUsers(updated);

    setNewName('');
    setShowAddForm(false);
  };

  const handleQuickSelect = (user) => {
    onSelectUser(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Glava */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Družinski profili</h2>
              <p className="text-[11px] text-slate-400">Izberi ali uredi člane družine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zavihka: Hiter preklop / Urejanje */}
        <div className="px-5 pt-3 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2">
          <button
            onClick={() => setTab('switch')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              tab === 'switch'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚡ Hiter preklop
          </button>
          <button
            onClick={() => setTab('manage')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              tab === 'manage'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚙️ Upravljanje profilov ({users.length})
          </button>
        </div>

        {/* Vsebinski del */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4 flex-1">
          
          {/* ZAVIHEK 1: HITER PREKLOP Z ENIM DOTIKOM */}
          {tab === 'switch' && (
            <div className="space-y-2.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                Kdo trenutno nakupuje ali dodaja?
              </div>

              <div className="grid grid-cols-1 gap-2">
                {users.map((user) => {
                  const isActive = activeUser?.id === user.id;
                  const pref = PREFERENCE_LABELS[user.preference || 'best_value'];

                  return (
                    <button
                      key={user.id}
                      onClick={() => handleQuickSelect(user)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition active:scale-[0.98] ${
                        isActive
                          ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-1 ring-emerald-500'
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0"
                          style={{ backgroundColor: user.color ? `${user.color}20` : '#f1f5f9' }}
                        >
                          {user.avatar || '🧑'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{user.name}</span>
                            {user.role === 'admin' && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Skrbnik
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span>Preferenca:</span>
                            <span className="font-semibold text-slate-700">{pref?.label || 'Best Value'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setTab('manage');
                    setShowAddForm(true);
                  }}
                  className="w-full py-2.5 rounded-2xl border border-dashed border-slate-300 text-slate-600 hover:text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50/30 text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Dodaj novega družinskega člana</span>
                </button>
              </div>
            </div>
          )}

          {/* ZAVIHEK 2: UPRAVLJANJE PROFILOV (Dodajanje, Urejanje, Brisanje) */}
          {tab === 'manage' && (
            <div className="space-y-3">
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Dodaj novega družinskega člana</span>
                </button>
              )}

              {/* Obrazec za dodajanje novega člana */}
              {showAddForm && (
                <form onSubmit={handleAddNewUser} className="p-4 rounded-3xl bg-emerald-50/60 border border-emerald-200 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Nov družinski član</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Ime (npr. Veronika, Domen, Luka, Mark...):
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ime člana..."
                      autoFocus
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Izbira avatarja */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Izberi avatar:
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
                      Barva značke:
                    </label>
                    <div className="flex items-center gap-2">
                      {MEMBER_COLORS.map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setNewColor(c)}
                          className={`w-6 h-6 rounded-full transition ${
                            newColor === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Vloga in preferenca kakovosti */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Vloga:
                      </label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="member">Član</option>
                        <option value="admin">Skrbnik (Admin)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Preferenca cen:
                      </label>
                      <select
                        value={newPreference}
                        onChange={(e) => setNewPreference(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="cheapest">🟢 Najceneje (Diskont)</option>
                        <option value="best_value">🟡 Znamka (Best Value)</option>
                        <option value="premium_local">🌿 Lokalno / Eko</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold"
                    >
                      Prekliči
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                    >
                      Shrani člana
                    </button>
                  </div>
                </form>
              )}

              {/* Seznam profilov z možnostjo urejanja */}
              <div className="space-y-2">
                {users.map((user) => {
                  const isEditing = editingUserId === user.id;
                  const pref = PREFERENCE_LABELS[user.preference || 'best_value'];

                  if (isEditing) {
                    return (
                      <div
                        key={user.id}
                        className="p-3.5 rounded-3xl bg-slate-50 border-2 border-emerald-500 space-y-3 animate-in fade-in duration-150"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">Urejanje profila</span>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                            placeholder="Ime"
                          />
                        </div>

                        {/* Izbira avatarja */}
                        <div>
                          <span className="text-[10px] font-semibold text-slate-500 block mb-1">Avatar:</span>
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

                        {/* Barva */}
                        <div>
                          <span className="text-[10px] font-semibold text-slate-500 block mb-1">Barva značke:</span>
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

                        {/* Vloga in preferenca */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 block mb-1">Vloga:</span>
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                            >
                              <option value="member">Član</option>
                              <option value="admin">Skrbnik</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 block mb-1">Preferenca:</span>
                            <select
                              value={editPreference}
                              onChange={(e) => setEditPreference(e.target.value)}
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                            >
                              <option value="cheapest">🟢 Najceneje</option>
                              <option value="best_value">🟡 Znamka</option>
                              <option value="premium_local">🌿 Lokalno/Eko</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={() => setEditingUserId(null)}
                            className="px-2.5 py-1 text-slate-600 text-xs font-semibold"
                          >
                            Prekliči
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(user.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Shrani</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                          style={{ backgroundColor: user.color ? `${user.color}20` : '#f1f5f9' }}
                        >
                          {user.avatar || '🧑'}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{user.name}</span>
                            {user.role === 'admin' && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Admin
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {pref?.label || 'Best Value'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(user)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Uredi profil"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Odstrani profil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
