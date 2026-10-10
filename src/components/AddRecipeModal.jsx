import React, { useState } from 'react';
import {
  X,
  ChefHat,
  Sparkles,
  Search,
  Clock,
  Users,
  Check,
  CheckCircle2,
  ShoppingBag,
  Flame,
  UtensilsCrossed,
  RotateCcw,
  Edit3
} from 'lucide-react';
import StoreBadge from './StoreBadge';
import { CUISINES_OPTIONS } from '../data/defaultFamilies';
import { 
  searchOrGenerateRecipeWithAi, 
  optimizeRecipeIngredientsWithDeals 
} from '../services/recipeAiService';

export default function AddRecipeModal({
  isOpen,
  onClose,
  onAddRecipe,
  onImportIngredients,
  deals = [],
  currentItems = [],
  activeFamily = null
}) {
  // Izbira zavihka: 'ai' | 'manual'
  const [activeTab, setActiveTab] = useState('ai');

  // --- STANJE ZA ROČNI VNOS ---
  const [manualTitle, setManualTitle] = useState('');
  const [manualSubtitle, setManualSubtitle] = useState('');
  const [manualCuisine, setManualCuisine] = useState('slovenska');
  const [manualCookTime, setManualCookTime] = useState('30');
  const [manualServings, setManualServings] = useState('4');
  const [manualEmoji, setManualEmoji] = useState('🍲');
  const [manualIngredientsText, setManualIngredientsText] = useState('');
  const [manualInstructionsText, setManualInstructionsText] = useState('');

  // --- STANJE ZA AI ISKANJE ---
  const [aiQuery, setAiQuery] = useState('');
  const [aiServings, setAiServings] = useState(4);
  const [aiMaxTime, setAiMaxTime] = useState(null); // null | 30 | 45
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState('');
  
  // Generiran recept in analiza sestavin
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [selectedIngredientNames, setSelectedIngredientNames] = useState([]);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [isImportSuccess, setIsImportSuccess] = useState(false);

  // Ključ za Gemini
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('nakupki_gemini_key') || '';
  });
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Hitre ideje za AI iskanje
  const QUICK_IDEAS = [
    { label: '🍛 Piščančji curry', query: 'Kremni piščančji curry z rižem' },
    { label: '🍕 Domača pica', query: 'Domača hrustljava pica' },
    { label: '🍲 Gobova juha', query: 'Bogata gobova juha s krompirjem' },
    { label: '🍝 Špageti bolognese', query: 'Testenine Bolognese z mletim mesom' },
    { label: '🥞 Palačinke', query: 'Mehke domače palačinke' },
    { label: '🥗 Solata s tuno', query: 'Hrustljava solata s tuno in jajcem' }
  ];

  // 1. IZVEDBA AI ISKANJA
  const handleAiSearch = async (queryToUse = null) => {
    const q = queryToUse || aiQuery;
    if (!q || !q.trim()) {
      setAiError('Vpišite ime jedi ali izberite idejo spodaj.');
      return;
    }

    setAiError('');
    setIsLoadingAi(true);
    setGeneratedRecipe(null);
    setIsSavedSuccess(false);
    setIsImportSuccess(false);

    try {
      const recipe = await searchOrGenerateRecipeWithAi({
        query: q,
        servings: aiServings,
        maxTime: aiMaxTime
      });

      setGeneratedRecipe(recipe);
      // Privzeto so označene vse sestavine za uvoz
      setSelectedIngredientNames(recipe.ingredients.map(i => i.name));
    } catch (err) {
      console.error('Napaka pri generiranju recepta:', err);
      setAiError(err.message || 'Prišlo je do napake pri iskanju recepta.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Optimizacija trgovin za generirani recept
  const optimizationData = React.useMemo(() => {
    if (!generatedRecipe) return null;
    return optimizeRecipeIngredientsWithDeals(generatedRecipe.ingredients, deals);
  }, [generatedRecipe, deals]);

  // Preklop izbire sestavine
  const toggleIngredientSelection = (name) => {
    if (selectedIngredientNames.includes(name)) {
      setSelectedIngredientNames(selectedIngredientNames.filter(n => n !== name));
    } else {
      setSelectedIngredientNames([...selectedIngredientNames, name]);
    }
  };

  // Shrani ključ v localStorage
  const handleSaveApiKey = (keyVal) => {
    setGeminiApiKey(keyVal);
    if (keyVal.trim()) {
      localStorage.setItem('nakupki_gemini_key', keyVal.trim());
    } else {
      localStorage.removeItem('nakupki_gemini_key');
    }
  };

  // 2. SHRANJEVANJE RECEPTA V KUHARICO
  const handleSaveGeneratedRecipe = (e) => {
    if (e) e.preventDefault();
    if (!generatedRecipe) return;

    onAddRecipe(generatedRecipe);
    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
    }, 2000);
  };

  // 3. UVOZ SESTAVIN NA NAKUPOVALNI SEZNAM
  const handleImportIngredientsToList = async () => {
    if (!generatedRecipe || selectedIngredientNames.length === 0) return;

    // Najprej shranimo recept, če še ni bil shranjen
    onAddRecipe(generatedRecipe);

    // Nato uvozimo sestavine
    await onImportIngredients(generatedRecipe, selectedIngredientNames);
    setIsImportSuccess(true);
    setTimeout(() => {
      setIsImportSuccess(false);
      onClose();
    }, 1400);
  };

  // 4. PRENOS GENERIRANEGA RECEPTA V ROČNO UREJANJE
  const handleTransferToManual = () => {
    if (!generatedRecipe) return;
    setManualTitle(generatedRecipe.title);
    setManualSubtitle(generatedRecipe.description || generatedRecipe.subtitle || '');
    setManualCuisine(generatedRecipe.cuisine || 'slovenska');
    setManualCookTime(String(generatedRecipe.cookTime || 30));
    setManualServings(String(generatedRecipe.servings || 4));
    setManualEmoji(generatedRecipe.emoji || '🍲');

    const ingText = generatedRecipe.ingredients
      .map(i => `${i.name}, ${i.amount || `${i.quantity} ${i.unit}`}`)
      .join('\n');
    setManualIngredientsText(ingText);

    const stepsText = (generatedRecipe.steps || generatedRecipe.instructions || []).join('\n');
    setManualInstructionsText(stepsText);

    setActiveTab('manual');
  };

  // 5. ODDAJA ROČNEGA VNOSA
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const parsedIngredients = manualIngredientsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split(',');
        const name = parts[0]?.trim() || '';
        const qty = parts[1]?.trim() || '1';
        const unit = parts[2]?.trim() || 'kos';
        return {
          name,
          amount: parts[1] && parts[2] ? `${qty} ${unit}` : qty,
          quantity: qty,
          unit: unit,
          category: 'ostalo',
          searchKeyword: name.toLowerCase()
        };
      });

    const parsedInstructions = manualInstructionsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const newRecipe = {
      id: `rec-user-${Date.now()}`,
      title: manualTitle.trim(),
      subtitle: manualSubtitle.trim() || 'Domači recept',
      description: manualSubtitle.trim() || '',
      cuisine: manualCuisine,
      cookTime: parseInt(manualCookTime) || 30,
      servings: parseInt(manualServings) || 4,
      emoji: manualEmoji || '🍳',
      ingredients: parsedIngredients.length > 0 
        ? parsedIngredients 
        : [{ name: 'Sestavine po okusu', amount: '1 porcija', quantity: '1', unit: 'porcija', category: 'ostalo' }],
      instructions: parsedInstructions.length > 0 
        ? parsedInstructions 
        : ['Pripravi sestavine in postrezi z veseljem.'],
      steps: parsedInstructions.length > 0 ? parsedInstructions : ['Pripravi in postrezi.'],
      dietaryFlags: []
    };

    onAddRecipe(newRecipe);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* GLAVA MODALA */}
        <div className="bg-slate-900 px-5 sm:px-6 py-4 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs">
                <ChefHat className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Nov družinski recept</h3>
                <p className="text-[11px] text-slate-400">Ustvari ali poišči recept z optimizacijo trgovin</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* DVA GLAVNA ZAVIHKI (TABS) */}
          <div className="mt-4 grid grid-cols-2 p-1 bg-slate-800/90 rounded-2xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>✨ Pametno iskanje z AI</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>✏️ Ročni vnos</span>
            </button>
          </div>
        </div>

        {/* VSEBINA ZAVIHKA */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6">
          
          {/* ======================================================== */}
          {/* ZAVIHEK 1: PAMETNO ISKANJE Z AI (GEMINI) */}
          {/* ======================================================== */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              
              {/* ISKALNO OBMOČJE (ČE ŠE NI RECEPTA ALI ČE IŠČEŠ ZNOVA) */}
              {!generatedRecipe && !isLoadingAi && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Vpiši jed ali idejo za kosilo / večerjo
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                        placeholder="npr. Domača pica, Piščančji curry z rižem, Gobova juha..."
                        className="w-full pl-4 pr-11 py-3 text-sm rounded-2xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleAiSearch()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 shadow-2xs cursor-pointer"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* HITRE IDEJE / PLOŠČKI */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Ali izberi med idejami:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_IDEAS.map((idea, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAiQuery(idea.query);
                            handleAiSearch(idea.query);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-xs font-semibold border border-slate-200/80 transition cursor-pointer"
                        >
                          {idea.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* IZBIRNI FILTRI: ŠTEVILO OSEB IN ČAS PRIPRAVE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    
                    {/* Število oseb */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-500" /> Število oseb
                        </span>
                        <span className="text-xs font-bold text-amber-700">{aiServings} oseb</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[2, 4, 6, 8].map(num => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setAiServings(num)}
                            className={`py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                              aiServings === num
                                ? 'bg-amber-500 text-white shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Čas priprave */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> Čas priprave
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {aiMaxTime ? `< ${aiMaxTime} min` : 'Vseeno'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { val: null, label: 'Vseeno' },
                          { val: 30, label: '⚡ < 30m' },
                          { val: 45, label: '⏱️ < 45m' }
                        ].map(opt => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => setAiMaxTime(opt.val)}
                            className={`py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                              aiMaxTime === opt.val
                                ? 'bg-amber-500 text-white shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* OBVESTILO O GEMINI API KLJUČU */}
                  <div className="pt-2">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${geminiApiKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="font-semibold text-slate-700">
                          {geminiApiKey ? 'Google Gemini 1.5 Flash aktiven' : 'Vgrajeni AI kulinarični asistent'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowKeyInput(!showKeyInput)}
                        className="text-[11px] font-bold text-amber-600 hover:text-amber-800 underline cursor-pointer"
                      >
                        {geminiApiKey ? 'Uredi ključ' : 'Vpiši API ključ'}
                      </button>
                    </div>

                    {showKeyInput && (
                      <div className="mt-2 p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-bold text-amber-900 uppercase">
                          Google Gemini API Ključ
                        </label>
                        <input
                          type="password"
                          value={geminiApiKey}
                          onChange={(e) => handleSaveApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-amber-300 bg-white"
                        />
                        <p className="text-[10px] text-amber-800">
                          Ključ se varno shrani v brskalnik (localStorage). Brez ključa deluje pametni lokalni asistent.
                        </p>
                      </div>
                    )}
                  </div>

                  {aiError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700">
                      {aiError}
                    </div>
                  )}

                  {/* GLAVNI GUMB ZA ZAGON */}
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => handleAiSearch()}
                      disabled={isLoadingAi}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Poišči recept in sestavine</span>
                    </button>
                  </div>
                </div>
              )}

              {/* INDIKATOR NALAGANJA (ANIMACIJA) */}
              {isLoadingAi && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg animate-pulse">
                      <ChefHat className="w-8 h-8" />
                    </div>
                    <Sparkles className="w-6 h-6 text-amber-500 absolute -top-2 -right-2 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Gemini AI pripravlja recept...
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Razčlenjujem sestavine, določam količine in pregledujem kataloge slovenskih trgovin za najboljše akcije.
                    </p>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* REZULTAT: GENERIRAN RECEPT IN OPTIMIZACIJA TRGOVIN */}
              {/* ======================================================== */}
              {generatedRecipe && !isLoadingAi && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  
                  {/* GLAVA GENERIRANEGA RECEPTA */}
                  <div className="p-4 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent rounded-3xl border border-amber-200/80">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl p-2 bg-white rounded-2xl shadow-2xs border border-amber-100">
                          {generatedRecipe.emoji || '🍲'}
                        </span>
                        <div>
                          <h4 className="text-base font-bold text-slate-900 leading-tight">
                            {generatedRecipe.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                            {generatedRecipe.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white text-slate-700 border border-slate-200/60">
                              <Clock className="w-3 h-3 text-amber-500" /> {generatedRecipe.prepTime || `${generatedRecipe.cookTime} min`}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white text-slate-700 border border-slate-200/60">
                              <Users className="w-3 h-3 text-amber-500" /> {generatedRecipe.servings} porcij
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white text-slate-700 border border-slate-200/60 capitalize">
                              {generatedRecipe.cuisine}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setGeneratedRecipe(null)}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white rounded-xl border border-slate-200/80 shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Išči znova
                      </button>
                    </div>
                  </div>

                  {/* KARTICA: OPTIMIZACIJA NAKUPA PO TRGOVINAH */}
                  {optimizationData && (
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-3xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                            <Flame className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                            Optimizacija nakupa po trgovinah
                          </span>
                        </div>
                        {optimizationData.topStore && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
                            <StoreBadge storeName={optimizationData.topStore} size="xs" />
                            <span>Največ akcij: {optimizationData.topStore}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-emerald-900 font-semibold">
                          Akcije v katalogih: <strong>{optimizationData.dealsMatchedCount}</strong> od {generatedRecipe.ingredients.length} sestavin
                        </span>
                        {optimizationData.totalSavings > 0 && (
                          <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-extrabold">
                            Prihranek ~{optimizationData.totalSavings.toFixed(2)} €
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* RAZČLENITEV SESTAVIN Z IZBIRO */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-amber-600" /> Razčlenjene sestavine ({generatedRecipe.ingredients.length})
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        Izbrano: {selectedIngredientNames.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(optimizationData?.analyzedIngredients || generatedRecipe.ingredients).map((ing, idx) => {
                        const isSelected = selectedIngredientNames.includes(ing.name);
                        const isAlreadyOnList = currentItems.some(item =>
                          item.title.toLowerCase().includes(ing.name.toLowerCase()) ||
                          ing.name.toLowerCase().includes(item.title.toLowerCase())
                        );

                        return (
                          <div
                            key={idx}
                            onClick={() => toggleIngredientSelection(ing.name)}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-50/40 shadow-2xs'
                                : 'border-slate-200 bg-white opacity-60 hover:opacity-90'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-amber-500 text-white shadow-2xs' : 'border border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <div>
                                <span className={`text-xs font-bold block ${isSelected ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                                  {ing.name}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {ing.amount || `${ing.quantity} ${ing.unit}`}
                                </span>
                              </div>
                            </div>

                            {/* Ujemanje akcije ali status na seznamu */}
                            <div className="flex items-center gap-2">
                              {ing.bestDeal ? (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-2xs">
                                  <StoreBadge storeName={ing.bestDeal.store} size="xs" />
                                  <span>{ing.bestDeal.discountPrice?.toFixed(2)} €</span>
                                  {ing.bestDeal.discountPercentage && (
                                    <span className="text-[10px] text-rose-600 bg-rose-100 px-1 py-0.2 rounded font-extrabold">
                                      {ing.bestDeal.discountPercentage}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-lg bg-slate-100">
                                  Redna ponudba
                                </span>
                              )}

                              {isAlreadyOnList && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                                  Že na seznamu
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* POSTOPEK PRIPRAVE (KORAKI) */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <UtensilsCrossed className="w-4 h-4 text-amber-600" /> Postopek priprave
                    </h5>
                    <div className="space-y-2">
                      {(generatedRecipe.steps || generatedRecipe.instructions || []).map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SPODNJA AKCIJSKA VRSTICA ZA GENERIRAN RECEPT */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleTransferToManual}
                      className="px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Uredi pred shranjevanjem
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveGeneratedRecipe}
                        className={`flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSavedSuccess
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        {isSavedSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Shranjeno!
                          </>
                        ) : (
                          <>
                            <span>💾 Shrani recept</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleImportIngredientsToList}
                        disabled={selectedIngredientNames.length === 0}
                        className={`flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                          isImportSuccess
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white active:scale-95'
                        }`}
                      >
                        {isImportSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Uvoženo v košarico!
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" /> Uvozi sestavine ({selectedIngredientNames.length})
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* ZAVIHEK 2: ROČNI VNOS RECEPTA */}
          {/* ======================================================== */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ime jedi / recepta
                </label>
                <input
                  type="text"
                  required
                  placeholder="npr. Goveji zrezki v naravni omaki"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kratek opis
                </label>
                <input
                  type="text"
                  placeholder="npr. Mehki zrezki z bogato čebulno omako in rižem"
                  value={manualSubtitle}
                  onChange={(e) => setManualSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kuhinja
                  </label>
                  <select
                    value={manualCuisine}
                    onChange={(e) => setManualCuisine(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold"
                  >
                    {CUISINES_OPTIONS.map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Čas (min)
                  </label>
                  <input
                    type="number"
                    value={manualCookTime}
                    onChange={(e) => setManualCookTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Porcije
                  </label>
                  <input
                    type="number"
                    value={manualServings}
                    onChange={(e) => setManualServings(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Sestavine (ena na vrstico, oblika: Ime, Količina, Enota)
                </label>
                <textarea
                  rows={4}
                  placeholder="Goveji zrezki, 600, g&#10;Čebula, 2, kos&#10;Česen, 3, strok"
                  value={manualIngredientsText}
                  onChange={(e) => setManualIngredientsText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Navodila (ena vrstica na korak)
                </label>
                <textarea
                  rows={3}
                  placeholder="1. Zrezke začinimo in na hitro popečemo z obeh strani.&#10;2. Dušimo čebulo in omako zalijemo z vodo."
                  value={manualInstructionsText}
                  onChange={(e) => setManualInstructionsText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-sans focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Prekliči
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Shrani recept
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
