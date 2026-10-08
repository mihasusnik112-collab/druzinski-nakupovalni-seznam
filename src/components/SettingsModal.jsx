import React, { useState } from 'react';
import { X, Cloud, Key, Database, RefreshCw, Check, Smartphone, Info, HardDrive } from 'lucide-react';
import { isFirebaseConfigured, saveFirebaseConfig } from '../firebase';
import { seedDealsToFirestore } from '../services/shoppingService';

export default function SettingsModal({
  isOpen,
  onClose
}) {
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('nakupki_gemini_key') || '');
  const [rawConfigJson, setRawConfigJson] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              ⚙️
            </div>
            <h2 className="text-base font-bold text-slate-900">Nastavitve & Sinhronizacija</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          
          {/* Trenutno stanje povezave */}
          <div className={`p-4 rounded-2xl border ${
            isFirebaseConfigured
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-2.5">
              {isFirebaseConfigured ? (
                <Cloud className="w-5 h-5 text-emerald-600" />
              ) : (
                <HardDrive className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {isFirebaseConfigured ? 'Povezano z bazo Firestore' : 'Lokalni način (Brez povezave)'}
                </h4>
                <p className="text-xs opacity-80 mt-0.5">
                  {isFirebaseConfigured 
                    ? 'Sinhronizacija med vsemi družinskimi člani poteka v realnem času preko oblaka.'
                    : 'Aplikacija deluje lokalno v brskalniku. Za skupno sinhronizacijo na več telefonih vnesite Firebase podatke spodaj.'}
                </p>
              </div>
            </div>

            {isFirebaseConfigured && (
              <button
                onClick={handleResetToLocal}
                className="mt-3 text-xs font-semibold text-rose-600 hover:underline"
              >
                Odstrani Firebase in preklopi nazaj na lokalni način
              </button>
            )}
          </div>

          {/* Obrazec za Firebase povezavo */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-600" />
              <span>Firebase konfiguracija (Družinska sinhronizacija)</span>
            </h3>

            <p className="text-xs text-slate-500 mb-3">
              Kopirajte vašo konfiguracijo iz Google Firebase konzole (Project Settings → Your apps → SDK setup/config):
            </p>

            <form onSubmit={handleSaveFirebaseConfig} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Prilepite Firebase Config JSON:
                </label>
                <textarea
                  rows="3"
                  value={rawConfigJson}
                  onChange={(e) => setRawConfigJson(e.target.value)}
                  placeholder='{ "apiKey": "AIzaSy...", "projectId": "moja-druzina-123", ... }'
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs"
              >
                Shrani Firebase povezavo
              </button>
            </form>
          </div>

          {/* Google Gemini API Ključ za AI branje katalogov */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-600" />
              <span>Google Gemini API Ključ (Zaledna AI obdelava)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-2">
              Uporablja se v skripti <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">scripts/catalog-ingest.js</code> za prebiranje tedenskih PDF katalogov trgovcev.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <button
                onClick={handleSaveGeminiKey}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition"
              >
                Shrani
              </button>
            </div>
          </div>

          {/* Baza akcij v Firestore */}
          {isFirebaseConfigured && (
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Naloži vzorčne akcije v Firestore</span>
              </h3>
              <p className="text-xs text-slate-500 mb-2">
                Če je vaša zbirka <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">catalog_deals</code> prazna, lahko z enim klikom naložite aktualne vzorce za Spar, Lidl, Hofer, Mercator, dm in Müller.
              </p>
              <button
                onClick={handleSeedDeals}
                disabled={isSeeding}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition"
              >
                {isSeeding ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : seedSuccess ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Database className="w-3.5 h-3.5" />
                )}
                <span>{seedSuccess ? 'Uspešno naloženo v Firestore!' : 'Naloži testne akcije v bazo'}</span>
              </button>
            </div>
          )}

          {/* Navodila za namestitev na mobilni telefon (PWA) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900">
            <div className="flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold">Uporaba kot mobilna aplikacija (PWA)</h4>
                <p className="text-[11px] text-amber-800/90 mt-1 leading-relaxed">
                  Za najboljšo izkušnjo v brskalniku na telefonu izberite:
                  <br />• <strong>iOS Safari:</strong> Delite (Share) → <em>Dodaj na domaci zaslon (Add to Home Screen)</em>
                  <br />• <strong>Android Chrome:</strong> Tri pikice (Meni) → <em>Namesti aplikacijo (Install App)</em>
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
