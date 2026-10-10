import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Lock, 
  ArrowRight, 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  Delete,
  CheckCircle2,
  Smartphone,
  X,
  Info
} from 'lucide-react';
import { loginFamilyByPin } from '../../services/shoppingService';

export default function FamilyLogin({
  onLoginSuccess,
  onOpenCreateNewFamily,
  savedSurname = 'Sušnik'
}) {
  const [surname, setSurname] = useState(savedSurname);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch (e) {
        console.warn('Install prompt error:', e);
        setShowInstallHelp(true);
      }
    } else {
      setShowInstallHelp(true);
    }
  };

  const handleHardResetPwa = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
    } catch (e) {
      console.warn('Reset error:', e);
    }
    window.location.reload(true);
  };

  // Vnos številke preko PIN številčnice
  const handlePinDigit = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');

      // Samodejno preveri ko so vnesene 4 številke
      if (nextPin.length === 4) {
        attemptLogin(surname, nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClearPin = () => {
    setPin('');
    setError('');
  };

  const attemptLogin = (inputSurname, inputPin) => {
    if (!inputSurname.trim()) {
      setError('Vnesite priimek družine (npr. Sušnik ali Novak).');
      return;
    }
    if (inputPin.length !== 4) {
      setError('Vnesite 4-mestno PIN kodo.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = loginFamilyByPin(inputSurname, inputPin);
      setIsLoading(false);
      if (result.success) {
        onLoginSuccess?.(result.family, result.isAdmin);
      } else {
        setError(result.message || 'Napačen priimek ali PIN!');
        setPin('');
      }
    }, 150);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    attemptLogin(surname, pin);
  };

  // Predlogi hitrih družin
  const quickSuggestions = [
    { name: 'Sušnik', badge: 'Skrbnik (Admin)', pin: '1234' },
    { name: 'Novak', badge: 'Član', pin: '1234' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 flex flex-col justify-center items-center px-4 py-8 select-none">
      
      {/* Glavna prijavna kartica */}
      <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/40 space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Logotip & Naslov */}
        <div className="text-center space-y-1.5">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30 text-3xl">
            🛒
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Družinski Seznam
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Vnesite priimek in 4-mestni družinski PIN
          </p>
        </div>

        {/* Hitri predlogi priimkov */}
        <div className="flex items-center justify-center gap-2">
          {quickSuggestions.map(q => (
            <button
              key={q.name}
              type="button"
              onClick={() => {
                setSurname(q.name);
                setPin('');
                setError('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                surname.toLowerCase() === q.name.toLowerCase()
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>👨‍👩‍👧‍👦 {q.name}</span>
              <span className="text-[10px] text-slate-400 font-normal">({q.badge})</span>
            </button>
          ))}
        </div>

        {/* Obrazec za vnos priimka */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Priimek družine:
            </label>
            <div className="relative">
              <input
                type="text"
                value={surname}
                onChange={(e) => {
                  setSurname(e.target.value);
                  setError('');
                }}
                placeholder="npr. Sušnik"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              <Users className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* Vizualni prikaz 4 kroglic za PIN */}
          <div className="space-y-1.5 text-center">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Vnesite 4-mestni PIN:
            </label>
            
            <div className="flex items-center justify-center gap-3 py-1">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    pin.length > idx
                      ? 'bg-emerald-600 border-emerald-600 scale-110 shadow-sm'
                      : 'border-slate-300 bg-slate-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Opozorilo o napaki */}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Virtualna številčnica (Keypad) za enostaven vnos na telefonu */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handlePinDigit(digit.toString())}
                className="h-12 rounded-2xl bg-slate-100/90 hover:bg-emerald-50 active:scale-95 text-slate-800 hover:text-emerald-800 font-extrabold text-lg border border-slate-200 transition cursor-pointer flex items-center justify-center shadow-2xs"
              >
                {digit}
              </button>
            ))}
            
            {/* Spodnja vrstica številčnice */}
            <button
              type="button"
              onClick={handleClearPin}
              className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-500 font-bold text-xs border border-slate-200 transition cursor-pointer flex items-center justify-center"
            >
              Počisti
            </button>

            <button
              type="button"
              onClick={() => handlePinDigit('0')}
              className="h-12 rounded-2xl bg-slate-100/90 hover:bg-emerald-50 active:scale-95 text-slate-800 hover:text-emerald-800 font-extrabold text-lg border border-slate-200 transition cursor-pointer flex items-center justify-center shadow-2xs"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-2xl bg-slate-50 hover:bg-rose-50 active:scale-95 text-slate-600 hover:text-rose-600 font-bold text-sm border border-slate-200 transition cursor-pointer flex items-center justify-center"
              title="Izbriši zadnjo številko"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Glavni gumb Vstopi */}
          <button
            type="submit"
            disabled={isLoading || pin.length !== 4}
            className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer ${
              pin.length === 4
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>{isLoading ? 'Preverjanje...' : 'Vstopi v družinsko košarico'}</span>
          </button>
        </form>

        {/* Ločilnik in gumb za ustvarjanje nove družine */}
        <div className="pt-2 border-t border-slate-100 text-center space-y-2">
          <p className="text-[11px] text-slate-400">
            Še nimate nastavljene svoje družine?
          </p>
          <button
            type="button"
            onClick={onOpenCreateNewFamily}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Ustvari novo družino (Onboarding)</span>
          </button>
        </div>

      </div>

      {/* Spodnji gumb za namestitev aplikacije */}
      <div className="mt-5 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleInstallApp}
          className="px-4 py-2.5 bg-white/20 hover:bg-white/30 active:scale-95 backdrop-blur-md rounded-2xl text-white text-xs font-bold border border-white/30 transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-emerald-300" />
          <span>📲 Dodaj aplikacijo na začetni zaslon</span>
        </button>

        <p className="text-[10px] text-emerald-200/70">
          Privzeti skrbniški PIN: <strong>1234</strong>
        </p>
      </div>

      {/* POPUP Z NAVODILI ZA NAMESTITEV */}
      {showInstallHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-800">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold">Kako dodati na zaslon</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallHelp(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1.5">
                <div className="font-bold text-emerald-900 flex items-center gap-1">
                  👉 V brskalniku izberite:
                </div>
                <p className="text-[11px]">
                  Ko telefon odpre meni <em>&quot;Namesti in ustvari bližnjico&quot;</em>, vedno kliknite na <strong>drugo možnost</strong>:
                </p>
                <div className="p-2 bg-white rounded-xl border border-emerald-300 font-bold text-center text-xs text-emerald-800 shadow-2xs">
                  ✅ &quot;Ustvari bližnjico&quot; (Bližnjice v Chromu)
                </div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <p className="font-bold text-slate-800">Če se meni ne odpre samodejno:</p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                  <li>V brskalniku Chrome kliknite <strong>tri pikice (⋮)</strong> zgoraj desno.</li>
                  <li>Izberite <strong>&quot;Dodaj na začetni zaslon&quot;</strong> ali <strong>&quot;Namesti aplikacijo&quot;</strong>.</li>
                  <li>Potrdite klik na <strong>Dodaj</strong>.</li>
                </ol>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleHardResetPwa}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🔄 Počisti predpomnilnik in ponovno naloži</span>
              </button>
              <button
                type="button"
                onClick={() => setShowInstallHelp(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Razumem, zapri
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
