export const DEFAULT_RECIPES = [
  {
    id: 'rec-1',
    familyId: 'Susnik-4102',
    title: 'Goveja juha z domačimi rezanci',
    subtitle: 'Kraljica nedeljskega kosila',
    cuisine: 'slovenska',
    emoji: '🍲',
    cookTime: 90,
    prepTime: 15,
    servings: 4,
    difficulty: 'srednje',
    dietaryFlags: ['lokalno_slo'],
    description: 'Bistra goveja juha z jušno zelenjavo in domačimi tankimi jajčnimi rezanci.',
    ingredients: [
      { name: 'Goveje meso za juho', quantity: '500', unit: 'g', category: 'meso', keyword: 'meso' },
      { name: 'Korenje', quantity: '3', unit: 'kos', category: 'sadje-zelenjava', keyword: 'zelenjava' },
      { name: 'Por in zelena', quantity: '1', unit: 'kos', category: 'sadje-zelenjava', keyword: 'zelenjava' },
      { name: 'Čebula', quantity: '1', unit: 'kos', category: 'sadje-zelenjava', keyword: 'čebula' },
      { name: 'Jajčni rezanci', quantity: '250', unit: 'g', category: 'shramba', keyword: 'testenine' },
      { name: 'Sol in poper v zrnu', quantity: '1', unit: 'ščepec', category: 'shramba', keyword: 'sol' }
    ],
    instructions: [
      'Meso operemo in damo v velik lonec z 2 litroma hladne vode.',
      'Počasi zavremo in z žlico odstranimo peno, ki se nabere na površini.',
      'Dodamo očiščeno celo korenje, por, zeleno in razpolovljeno popečeno čebulo.',
      'Kuhamo na nizkem ognju pokrito približno 1,5 do 2 uri.',
      'Juho precedimo, posebej skuhamo rezance in ponudimo s korenjem.'
    ],
    isFavorite: true
  },
  {
    id: 'rec-2',
    familyId: 'Susnik-4102',
    title: 'Pražen krompir z ocvirki & solata',
    subtitle: 'Tradicionalna slovenska priloga ali samostojna jed',
    cuisine: 'slovenska',
    emoji: '🥔',
    cookTime: 35,
    prepTime: 10,
    servings: 4,
    difficulty: 'enostavno',
    dietaryFlags: ['lokalno_slo', 'brez_glutena'],
    description: 'Popoln pražen krompir s karamelizirano čebulo in hrustljavimi ocvirki.',
    ingredients: [
      { name: 'Krompir', quantity: '1', unit: 'kg', category: 'sadje-zelenjava', keyword: 'krompir' },
      { name: 'Čebula', quantity: '2', unit: 'kos', category: 'sadje-zelenjava', keyword: 'čebula' },
      { name: 'Svinjska mast ali maslo', quantity: '50', unit: 'g', category: 'mlecno', keyword: 'maslo' },
      { name: 'Domači ocvirki', quantity: '100', unit: 'g', category: 'meso', keyword: 'meso' },
      { name: 'Solata kristalka', quantity: '1', unit: 'glavica', category: 'sadje-zelenjava', keyword: 'solata' }
    ],
    instructions: [
      'Krompir operemo in skuhamo v lupini v slani vodi do mehkega.',
      'Še toplega olupimo in narežemo na tanke lističe.',
      'V ponvi na masti zarumenimo drobno sesekljano čebulo.',
      'Dodamo kuhan narezan krompir, solimo in med mešanjem pražimo do lepe zlate skorjice.',
      'Na koncu dodamo tople ocvirke in postrežemo z veliko skledo sveže solate.'
    ],
    isFavorite: true
  },
  {
    id: 'rec-3',
    familyId: 'Susnik-4102',
    title: 'Testenine Bolognese (Domača mesna omaka)',
    subtitle: 'Najljubša jed vseh otrok',
    cuisine: 'italijanska',
    emoji: '🍝',
    cookTime: 30,
    prepTime: 10,
    servings: 4,
    difficulty: 'enostavno',
    dietaryFlags: ['hitro_enostavno'],
    description: 'Sočna mesna omaka iz mletega mesa in paradižnika z izbranimi testeninami.',
    ingredients: [
      { name: 'Testenine Barilla špageti ali peresniki', quantity: '500', unit: 'g', category: 'shramba', keyword: 'testenine' },
      { name: 'Mleto mešano meso', quantity: '500', unit: 'g', category: 'meso', keyword: 'meso' },
      { name: 'Paradižnikova polpa / pasiran paradižnik', quantity: '500', unit: 'g', category: 'shramba', keyword: 'paradižnik' },
      { name: 'Čebula', quantity: '1', unit: 'kos', category: 'sadje-zelenjava', keyword: 'čebula' },
      { name: 'Česen', quantity: '2', unit: 'strok', category: 'sadje-zelenjava', keyword: 'česen' },
      { name: 'Sir Parmezan ali Gavda', quantity: '100', unit: 'g', category: 'mlecno', keyword: 'sir' },
      { name: 'Olivno olje', quantity: '2', unit: 'žlica', category: 'shramba', keyword: 'olje' }
    ],
    instructions: [
      'Na olivnem olju popražimo sesekljano čebulo in česen.',
      'Dodamo mleto meso in ga med mešanjem pražimo, da spremeni barvo.',
      'Zalijemo s paradižnikovo polpo, posolimo, popramo in začinimo z origanom.',
      'Kuhamo na zmernem ognju približno 20 minut.',
      'Medtem skuhamo testenine "al dente", jih odcedimo in zmešamo z omako ter potresemo s sirom.'
    ],
    isFavorite: true
  },
  {
    id: 'rec-4',
    familyId: 'Susnik-4102',
    title: 'Hrustljavi piščančji wok z zelenjavo in rižem',
    subtitle: 'Barvit, svež in v 20 minutah na mizi',
    cuisine: 'azijska',
    emoji: '🥢',
    cookTime: 20,
    prepTime: 10,
    servings: 4,
    difficulty: 'enostavno',
    dietaryFlags: ['brez_glutena', 'manj_sladkorja', 'hitro_enostavno'],
    description: 'Nežni koščki piščančjega fileja s hrustljavo papriko, bučkami in sojino omako.',
    ingredients: [
      { name: 'Piščančji file', quantity: '500', unit: 'g', category: 'meso', keyword: 'piščanec' },
      { name: 'Riž Basmati ali dolgozrnat', quantity: '350', unit: 'g', category: 'shramba', keyword: 'riž' },
      { name: 'Paprika (mix rdeča/rumena)', quantity: '2', unit: 'kos', category: 'sadje-zelenjava', keyword: 'zelenjava' },
      { name: 'Bučke', quantity: '1', unit: 'kos', category: 'sadje-zelenjava', keyword: 'zelenjava' },
      { name: 'Sojina omaka', quantity: '3', unit: 'žlica', category: 'shramba', keyword: 'omaka' },
      { name: 'Olje sončnično ali sezamovo', quantity: '2', unit: 'žlica', category: 'shramba', keyword: 'olje' }
    ],
    instructions: [
      'Riž skuhamo v slani vodi po navodilih na embalaži.',
      'Piščančji file narežemo na tanke trakce, zelenjavo na rezance.',
      'V voku na močnem ognju hitro popečemo meso (cca 4 minute) in ga odstavimo.',
      'V isti ponvi 3 minute pražimo zelenjavo, da ostane prijetno hrustljava.',
      'Vrnemo meso, zalijemo s sojino omako, premešamo in postrežemo z rižem.'
    ],
    isFavorite: false
  },
  {
    id: 'rec-5',
    familyId: 'Susnik-4102',
    title: 'Kremna bučna juha s praženimi semeni',
    subtitle: 'Topla, žametna in polna vitaminov',
    cuisine: 'mediteranska',
    emoji: '🎃',
    cookTime: 25,
    prepTime: 10,
    servings: 4,
    difficulty: 'enostavno',
    dietaryFlags: ['vegetarijansko', 'brez_glutena', 'bio_eko'],
    description: 'Jesenska klasika iz hokaido buče s kančkom smetane in bučnim oljem.',
    ingredients: [
      { name: 'Buča Hokaido ali muškatna', quantity: '1', unit: 'kg', category: 'sadje-zelenjava', keyword: 'zelenjava' },
      { name: 'Krompir', quantity: '2', unit: 'kos', category: 'sadje-zelenjava', keyword: 'krompir' },
      { name: 'Čebula', quantity: '1', unit: 'kos', category: 'sadje-zelenjava', keyword: 'čebula' },
      { name: 'Sladka ali kisla smetana', quantity: '180', unit: 'ml', category: 'mlecno', keyword: 'smetana' },
      { name: 'Maslo', quantity: '30', unit: 'g', category: 'mlecno', keyword: 'maslo' },
      { name: 'Bučna semena & bučno olje', quantity: '50', unit: 'g', category: 'shramba', keyword: 'olje' }
    ],
    instructions: [
      'Na stopljenem maslu prepražimo čebulo.',
      'Dodamo na kocke narezano bučo in krompir ter na hitro popražimo.',
      'Zalijemo z 800 ml vode ali jušne osnove in kuhamo 20 minut do mehkega.',
      'S paličnim mešalnikom spasiramo v svilnato gladko kremo.',
      'Vmešamo smetano, solimo, popramo in okrasimo s praženimi semeni ter kapljicami bučnega olja.'
    ],
    isFavorite: false
  },
  {
    id: 'rec-6',
    familyId: 'Susnik-4102',
    title: 'Domače puhaste palačinke z nadevom',
    subtitle: 'Sobotni družinski zajtrk ali večerja',
    cuisine: 'slovenska',
    emoji: '🥞',
    cookTime: 20,
    prepTime: 5,
    servings: 4,
    difficulty: 'enostavno',
    dietaryFlags: ['vegetarijansko'],
    description: 'Puhaste zlate palačinke po preizkušenem babičinem receptu.',
    ingredients: [
      { name: 'Mleko 3.5%', quantity: '500', unit: 'ml', category: 'mlecno', keyword: 'mleko' },
      { name: 'Moka pšenična bela', quantity: '250', unit: 'g', category: 'shramba', keyword: 'moka' },
      { name: 'Jajca domača', quantity: '2', unit: 'kos', category: 'mlecno', keyword: 'jajca' },
      { name: 'Olje za peko', quantity: '50', unit: 'ml', category: 'shramba', keyword: 'olje' },
      { name: 'Marmelada ali čokoladni namaz', quantity: '1', unit: 'kozarček', category: 'shramba', keyword: 'čokolada' }
    ],
    instructions: [
      'V skledi z metlico zmešamo jajca, mleko in ščepec soli.',
      'Postopoma dodajamo moko in mešamo, da dobimo gladko tekoče testo brez grudic.',
      'Pustimo počivati 10 minut.',
      'Ponev rahlo namastimo in na obeh straneh zlato zapečemo tanke palačinke.',
      'Namažemo z domačo marmelado ali čokoladnim namazom in zvijemo.'
    ],
    isFavorite: true
  },
  {
    id: 'rec-7',
    familyId: 'Susnik-4102',
    title: 'Pečen losos z bučkami in limono',
    subtitle: 'Lahka in zdrava mediteranska večerja',
    cuisine: 'mediteranska',
    emoji: '🐟',
    cookTime: 20,
    prepTime: 5,
    servings: 3,
    difficulty: 'enostavno',
    dietaryFlags: ['brez_glutena', 'manj_sladkorja', 'hitro_enostavno'],
    description: 'Sočen file lososa, pečen v pečici z začimbami, bučkami in deviškim olivnim oljem.',
    ingredients: [
      { name: 'Lososov file', quantity: '400', unit: 'g', category: 'meso', keyword: 'ribe' },
      { name: 'Bučke zelene', quantity: '2', unit: 'kos', category: 'sadje-zelenjava', keyword: 'zelenjava' },
      { name: 'Limona', quantity: '1', unit: 'kos', category: 'sadje-zelenjava', keyword: 'sadje' },
      { name: 'Olivno olje', quantity: '2', unit: 'žlica', category: 'shramba', keyword: 'olje' },
      { name: 'Česen in rožmarin', quantity: '1', unit: 'ščepec', category: 'sadje-zelenjava', keyword: 'česen' }
    ],
    instructions: [
      'Pečico ogrejemo na 200°C.',
      'Pekač obložimo s papirjem za peko in nanj položimo začinjenega lososa.',
      'Okoli razporedimo na kolesca narezane bučke.',
      'Vse pokapamo z olivnim oljem, limoninim sokom in potresemo z rožmarinom.',
      'Pečemo 15 do 18 minut do popolne sočnosti.'
    ],
    isFavorite: false
  }
];
