import React, { useState } from 'react';
import { 
  Users, 
  Lock, 
  ArrowRight, 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  Delete,
  CheckCircle2
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

      {/* Spodnji PWA podatek */}
      <div className="mt-6 text-center text-emerald-200/80 text-[11px] space-y-0.5">
        <p className="font-semibold">📱 PWA Aplikacija • Popolna podpora brez povezave</p>
        <p className="text-[10px] text-emerald-300/60">Privzeti PIN za testiranje: <strong>1234</strong></p>
      </div>

    </div>
  );
}
