import React, { useState } from 'react';
import { ShoppingBag, Tag, Users, Settings, Cloud, HardDrive, Sparkles, CheckCircle2 } from 'lucide-react';
import { FAMILY_MEMBERS } from '../data/commonItems';
import { isFirebaseConfigured } from '../firebase';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentMember, 
  setCurrentMember, 
  onOpenSettings,
  activeCount = 0,
  dealsCount = 0
}) {
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-2xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          
          {/* Logo & Naslov */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                  Družinski Seznam
                </h1>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  AI Akcije
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                {isFirebaseConfigured ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Cloud className="w-3 h-3 text-emerald-500 animate-pulse" /> Firestore sinhronizacija
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-500">
                    <HardDrive className="w-3 h-3 text-slate-400" /> Lokalna shramba
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Desna orodna vrstica: Izbira družinskega člana & Nastavitve */}
          <div className="flex items-center gap-2">
            
            {/* Izbira člana */}
            <div className="relative">
              <button
                onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium transition active:scale-95 border border-slate-200"
                title="Izberi kdo dodaja artikle"
              >
                <span className="text-sm">{currentMember.avatar}</span>
                <span className="hidden sm:inline font-semibold">{currentMember.name}</span>
              </button>

              {showMemberDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setShowMemberDropdown(false)}
                >
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Kdo dodaja danes?
                  </div>
                  {FAMILY_MEMBERS.map((member) => (
                    <button
                      key={member.name}
                      onClick={() => setCurrentMember(member)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition ${
                        currentMember.name === member.name 
                          ? 'bg-emerald-50 text-emerald-800 font-semibold' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{member.avatar}</span>
                        {member.name}
                      </span>
                      {currentMember.name === member.name && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Gumb za nastavitve */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95 border border-transparent hover:border-slate-200"
              title="Nastavitve & Firebase"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Glavna navigacija med zavihkoma: Seznam & Akcije */}
        <div className="grid grid-cols-2 gap-1 mt-2.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'list'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Nakupovalni seznam</span>
            {activeCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'list' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {activeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('deals')}
            className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'deals'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-rose-500" />
            <span>Katalogi & Akcije</span>
            {dealsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'deals' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
              }`}>
                {dealsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
