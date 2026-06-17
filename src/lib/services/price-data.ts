// Curated MSRP dataset for popular car models (2024-2025 base prices, USD).
// Used as Tier A (most accurate) of the price-estimation engine.
//
// Values are approximate starting MSRPs sourced from public manufacturer pricing
// (2024-2025 model years, US/global market). They should be refreshed annually.
// All prices are the *base* trim before options/destination unless a premiumTrims
// override is present.

export interface ModelPrice {
  base: number;
  // Optional trim-specific price overrides. Keys are lowercased substrings
  // matched against the model name (e.g. "sport", "plaid", "amg").
  premiumTrims?: Record<string, number>;
}

// Keyed by normalized "brand|model" (both lowercased, brand as commonly stored).
// Brand is matched case-insensitively with includes() fallback in the engine.
export const MODEL_PRICES: Record<string, ModelPrice> = {
  // ───────────────────────── TOYOTA ─────────────────────────
  "toyota|camry": { base: 27000, premiumTrims: { trd: 32500, xse: 31500 } },
  "toyota|corolla": { base: 22000, premiumTrims: { "gr corolla": 36000, apex: 28500 } },
  "toyota|rav4": { base: 28500, premiumTrims: { prime: 43000, trd: 36500, adventure: 34000 } },
  "toyota|highlander": { base: 36500, premiumTrims: { hybrid: 40500, platinum: 49500 } },
  "toyota|tacoma": { base: 31500, premiumTrims: { trd: 42500 } },
  "toyota|4runner": { base: 40000, premiumTrims: { trd: 50000 } },
  "toyota|sienna": { base: 37500 },
  "toyota|prius": { base: 27500, premiumTrims: { prime: 33000 } },
  "toyota|avalon": { base: 36000 },
  "toyota|c-hr": { base: 24000 },
  "toyota|venza": { base: 36500 },
  "toyota|bZ4X": { base: 42000 },
  "toyota| Crown": { base: 41000 },

  // ───────────────────────── HONDA ─────────────────────────
  "honda|civic": { base: 23500, premiumTrims: { "type r": 44500, si: 29500, "sport touring": 29500 } },
  "honda|accord": { base: 27500, premiumTrims: { "sport touring": 31500, touring: 30500 } },
  "honda|cr-v": { base: 29500, premiumTrims: { "sport touring": 35000 } },
  "honda|hr-v": { base: 24500 },
  "honda|pilot": { base: 37000, premiumTrims: { elite: 52000, black: 45000 } },
  "honda|odyssey": { base: 38000, premiumTrims: { elite: 51000 } },
  "honda|passport": { base: 42000, premiumTrims: { elite: 49000 } },
  "honda|ridgeline": { base: 39000, premiumTrims: { black: 46000 } },
  "honda|fit": { base: 17500 },
  "honda|insight": { base: 25500 },

  // ───────────────────────── NISSAN ─────────────────────────
  "nissan|altima": { base: 26000 },
  "nissan|sentra": { base: 20500 },
  "nissan|rogue": { base: 28500, premiumTrims: { platinum: 38000 } },
  "nissan|pathfinder": { base: 36000, premiumTrims: { platinum: 49000 } },
  "nissan|murano": { base: 38500 },
  "nissan|kicks": { base: 21500 },
  "nissan|ariya": { base: 39000, premiumTrims: { "evolve": 44000 } },
  "nissan|leaf": { base: 28500 },
  "nissan|z": { base: 42000, premiumTrims: { "nismo": 53000 } },
  "nissan|frontier": { base: 30000 },
  "nissan|armada": { base: 52000 },
  "nissan|versa": { base: 16500 },
  "nissan|kicks": { base: 21500 },

  // ───────────────────────── FORD ─────────────────────────
  "ford|f-150": { base: 36000, premiumTrims: { raptor: 78000, "lightning": 50000, limited: 84000, platinum: 63000 } },
  "ford|escape": { base: 29000, premiumTrims: { "plug-in": 41000 } },
  "ford|explorer": { base: 36500, premiumTrims: { st: 55000, king: 58000, platinum: 53000 } },
  "ford|bronco": { base: 39000, premiumTrims: { raptor: 80000, "wildtrak": 49000 } },
  "ford|bronco sport": { base: 29500 },
  "ford|mustang": { base: 32000, premiumTrims: { gt: 43000, "dark horse": 60000, mach: 52000 } },
  "ford|maverick": { base: 23000 },
  "ford|edge": { base: 37500, premiumTrims: { st: 47000 } },
  "ford|fusion": { base: 26000 },
  "ford|ranger": { base: 32500, premiumTrims: { raptor: 55000 } },
  "ford|mustang mach-e": { base: 40000, premiumTrims: { gt: 52000 } },
  "ford|transit": { base: 49000 },

  // ───────────────────────── CHEVROLET ─────────────────────────
  "chevrolet|silverado": { base: 36000, premiumTrims: { "high country": 62000, z71: 53000 } },
  "chevrolet|silverado 1500": { base: 36000, premiumTrims: { "high country": 62000, z71: 53000 } },
  "chevrolet|equinox": { base: 26500, premiumTrims: { premier: 32000 } },
  "chevrolet|malibu": { base: 25500 },
  "chevrolet|traverse": { base: 35500, premiumTrims: { "high country": 51000 } },
  "chevrolet|tahoe": { base: 56000, premiumTrims: { "high country": 74000, premier: 68000 } },
  "chevrolet|suburban": { base: 59000, premiumTrims: { "high country": 78000 } },
  "chevrolet|trailblazer": { base: 23500 },
  "chevrolet|trax": { base: 21500 },
  "chevrolet|bolt": { base: 27000, premiumTrims: { euv: 27500 } },
  "chevrolet|blazer": { base: 35000, premiumTrims: { rs: 41000 } },
  "chevrolet|camaro": { base: 30500, premiumTrims: { ss: 43000, zl1: 70000 } },
  "chevrolet|corvette": { base: 68000, premiumTrims: { z06: 110000 } },
  "chevrolet|colorado": { base: 29500, premiumTrims: { zr2: 48000 } },
  "chevrolet|spark": { base: 14500 },
  "chevrolet|sonic": { base: 16500 },
  "chevrolet|cruze": { base: 18000 },

  // ───────────────────────── TESLA ─────────────────────────
  "tesla|model 3": { base: 39000, premiumTrims: { "performance": 49000, "long range": 42000 } },
  "tesla|model y": { base: 44000, premiumTrims: { "performance": 51000, "long range": 48000 } },
  "tesla|model s": { base: 75000, premiumTrims: { plaid: 90000 } },
  "tesla|model x": { base: 80000, premiumTrims: { plaid: 95000 } },
  "tesla|cybertruck": { base: 60000, premiumTrims: { "foundation": 100000 } },

  // ───────────────────────── HYUNDAI ─────────────────────────
  "hyundai|elantra": { base: 21500, premiumTrims: { n: 33500, "n line": 27500 } },
  "hyundai|sonata": { base: 26500 },
  "hyundai|tucson": { base: 28000, premiumTrims: { "limited": 38000 } },
  "hyundai|santa fe": { base: 33500, premiumTrims: { "calligraphy": 46000 } },
  "hyundai|palisade": { base: 36500, premiumTrims: { "calligraphy": 50000 } },
  "hyundai|kona": { base: 24500, premiumTrims: { n: 34000 } },
  "hyundai|ioniq 5": { base: 41000, premiumTrims: { "limited": 57000 } },
  "hyundai|ioniq 6": { base: 42000 },
  "hyundai|venue": { base: 19500 },
  "hyundai|accent": { base: 16500 },
  "hyundai|kona electric": { base: 33000 },

  // ───────────────────────── KIA ─────────────────────────
  "kia|forte": { base: 19500 },
  "kia|k5": { base: 25500, premiumTrims: { gt: 31500 } },
  "kia|sportage": { base: 27500, premiumTrims: { "sx prestige": 37000 } },
  "kia|sorento": { base: 31500, premiumTrims: { "sx prestige": 44000 } },
  "kia|telluride": { base: 36000, premiumTrims: { "sx prestige": 47000 } },
  "kia|soul": { base: 20500 },
  "kia|niro": { base: 27500, premiumTrims: { ev: 39500 } },
  "kia|ev6": { base: 42000, premiumTrims: { gt: 61000 } },
  "kia|rio": { base: 17000 },
  "kia|carnival": { base: 33500, premiumTrims: { "sx prestige": 47000 } },
  "kia|stinger": { base: 36500, premiumTrims: { gt: 53000 } },
  "kia|k900": { base: 60000 },

  // ───────────────────────── MAZDA ─────────────────────────
  "mazda|mazda3": { base: 24000, premiumTrims: { turbo: 33500 } },
  "mazda|3": { base: 24000, premiumTrims: { turbo: 33500 } },
  "mazda|mazda6": { base: 27500, premiumTrims: { turbo: 36000 } },
  "mazda|cx-5": { base: 28500, premiumTrims: { turbo: 39000 } },
  "mazda|cx-30": { base: 24500, premiumTrims: { turbo: 34500 } },
  "mazda|cx-50": { base: 28500, premiumTrims: { turbo: 39500 } },
  "mazda|cx-9": { base: 38000, premiumTrims: { signature: 48000 } },
  "mazda|cx-90": { base: 39000, premiumTrims: { "turbo s": 48000 } },
  "mazda|mx-5": { base: 28500, premiumTrims: { rf: 35000 } },
  "mazda|miata": { base: 28500 },

  // ───────────────────────── SUBARU ─────────────────────────
  "subaru|outback": { base: 28500, premiumTrims: { touring: 42000, wilderness: 35000 } },
  "subaru|forester": { base: 27500, premiumTrims: { touring: 37000, wilderness: 33000 } },
  "subaru|crosstrek": { base: 25500, premiumTrims: { wilderness: 30000 } },
  "subaru|impreza": { base: 23000, premiumTrims: { wrx: 32000, sti: 37000 } },
  "subaru|wrx": { base: 32000, premiumTrims: { sti: 41000 } },
  "subaru|legacy": { base: 24500, premiumTrims: { touring: 36000 } },
  "subaru|ascent": { base: 34500, premiumTrims: { touring: 49000 } },
  "subaru|solterra": { base: 45000 },
  "subaru|brz": { base: 30500 },

  // ───────────────────────── VOLKSWAGEN ─────────────────────────
  "volkswagen|jetta": { base: 22000 },
  "volkswagen|passat": { base: 27000 },
  "volkswagen|tiguan": { base: 28500, premiumTrims: { "sel r-line": 38000 } },
  "volkswagen|atlas": { base: 36500, premiumTrims: { "sel premium": 52000 } },
  "volkswagen|golf": { base: 23500, premiumTrims: { gti: 31500, r: 45000 } },
  "volkswagen|id.4": { base: 39500, premiumTrims: { "pro s": 48000 } },
  "volkswagen|taos": { base: 24500 },
  "volkswagen|arteon": { base: 38000 },

  // ───────────────────────── BMW ─────────────────────────
  "bmw|3 series": { base: 44500, premiumTrims: { m3: 72000, "330e": 45500 } },
  "bmw|5 series": { base: 55000, premiumTrims: { m5: 110000 } },
  "bmw|7 series": { base: 97000, premiumTrims: { "760i": 113000 } },
  "bmw|x1": { base: 40000 },
  "bmw|x3": { base: 46000, premiumTrims: { m: 72000 } },
  "bmw|x5": { base: 62500, premiumTrims: { m: 108000 } },
  "bmw|x7": { base: 77000 },
  "bmw|4 series": { base: 46500 },
  "bmw|i4": { base: 52000 },
  "bmw|ix": { base: 87000 },
  "bmw|iX": { base: 87000 },
  "bmw|2 series": { base: 38500 },

  // ───────────────────────── MERCEDES-BENZ ─────────────────────────
  "mercedes-benz|c-class": { base: 47000, premiumTrims: { "c63 amg": 80000 } },
  "mercedes-benz|e-class": { base: 57000, premiumTrims: { "e63 amg": 115000 } },
  "mercedes-benz|s-class": { base: 115000, premiumTrims: { "s580": 120000, "amg": 230000 } },
  "mercedes-benz|gle": { base: 62000, premiumTrims: { "gle 63 amg": 120000 } },
  "mercedes-benz|glc": { base: 47000, premiumTrims: { "glc 63 amg": 77000 } },
  "mercedes-benz|gls": { base: 80000 },
  "mercedes-benz|a-class": { base: 35000 },
  "mercedes-benz|cla": { base: 43000 },
  "mercedes-benz|eqs": { base: 105000 },
  "mercedes-benz|eqe": { base: 75000 },
  "mercedes-benz|g-class": { base: 145000, premiumTrims: { "amg": 180000 } },

  // ───────────────────────── AUDI ─────────────────────────
  "audi|a4": { base: 41000, premiumTrims: { "s4": 52000, "rs4": 80000 } },
  "audi|a6": { base: 56000, premiumTrims: { "s6": 70000 } },
  "audi|a8": { base: 87000 },
  "audi|q3": { base: 37000 },
  "audi|q5": { base: 43500, premiumTrims: { "sq5": 56000 } },
  "audi|q7": { base: 57500, premiumTrims: { "sq7": 80000 } },
  "audi|q8": { base: 72000, premiumTrims: { "rsq8": 125000 } },
  "audi|e-tron": { base: 66000 },
  "audi|tt": { base: 50000 },

  // ───────────────────────── LEXUS ─────────────────────────
  "lexus|is": { base: 41000, premiumTrims: { "is 500": 67000 } },
  "lexus|es": { base: 43000, premiumTrims: { "es 350": 46000 } },
  "lexus|rx": { base: 47000, premiumTrims: { "rx 450h": 50000, "rx 350": 49000 } },
  "lexus|nx": { base: 40000, premiumTrims: { "nx 450h+": 57000 } },
  "lexus|gx": { base: 64000 },
  "lexus|lx": { base: 89000, premiumTrims: { "lx 600": 101000 } },
  "lexus|ux": { base: 37000 },
  "lexus|lc": { base: 99000 },
  "lexus|rc": { base: 45000 },

  // ───────────────────────── PORSCHE ─────────────────────────
  "porsche|911": { base: 107000, premiumTrims: { turbo: 184000, gt3: 180000, "turbo s": 230000 } },
  "porsche|cayenne": { base: 79000, premiumTrims: { turbo: 130000, "turbo gt": 200000 } },
  "porsche|macan": { base: 60000, premiumTrims: { "gts": 80000, turbo: 88000 } },
  "porsche|taycan": { base: 92000, premiumTrims: { turbo: 155000 } },
  "porsche|panamera": { base: 92000 },
  "porsche|718": { base: 63000 },

  // ───────────────────────── JEEP ─────────────────────────
  "jeep|wrangler": { base: 32000, premiumTrims: { rubicon: 45000, "392": 80000 } },
  "jeep|grand cherokee": { base: 36500, premiumTrims: { "summit reserve": 64000, "srt": 70000 } },
  "jeep|cherokee": { base: 30500 },
  "jeep|compass": { base: 25500 },
  "jeep|renegade": { base: 23500 },
  "jeep|gladiator": { base: 37000, premiumTrims: { rubicon: 47000 } },
  "jeep|wagoneer": { base: 62000, premiumTrims: { "grand wagoneer": 91000 } },

  // ───────────────────────── RAM ─────────────────────────
  "ram|1500": { base: 38500, premiumTrims: { "trx": 85000, limited: 62000 } },
  "ram|2500": { base: 45000 },
  "ram|3500": { base: 48000 },

  // ───────────────────────── GMC ─────────────────────────
  "gmc|sierra": { base: 37000, premiumTrims: { denali: 60000, "at4": 55000 } },
  "gmc|sierra 1500": { base: 37000, premiumTrims: { denali: 60000 } },
  "gmc|terrain": { base: 28000, premiumTrims: { denali: 36000 } },
  "gmc|acadia": { base: 36500, premiumTrims: { denali: 49000 } },
  "gmc|yukon": { base: 57000, premiumTrims: { denali: 74000, xl: 60000 } },
  "gmc|canyon": { base: 30000, premiumTrims: { "at4": 41000 } },
  "gmc|hummer ev": { base: 80000 },

  // ───────────────────────── DODGE / CHRYSLER ─────────────────────────
  "dodge|charger": { base: 33000, premiumTrims: { "srt hellcat": 72000, "r/t": 40000 } },
  "dodge|challenger": { base: 31000, premiumTrims: { "srt hellcat": 72000, "r/t": 39000 } },
  "dodge|durango": { base: 38500, premiumTrims: { "srt hellcat": 85000 } },
  "dodge|hornet": { base: 30000 },
  "chrysler|pacifica": { base: 37000, premiumTrims: { pinnacle: 53000 } },
  "chrysler|300": { base: 36000, premiumTrims: { "s": 46000 } },

  // ───────────────────────── BUICK ─────────────────────────
  "buick|encore": { base: 24000 },
  "buick|encore gx": { base: 25000, premiumTrims: { aventine: 32000 } },
  "buick|envision": { base: 34000, premiumTrims: { aventine: 43000 } },
  "buick|enclave": { base: 44000, premiumTrims: { aventine: 55000 } },
  "buick|envista": { base: 23000 },
  "buick|lacrosse": { base: 34000 },

  // ───────────────────────── CADILLAC ─────────────────────────
  "cadillac|ct4": { base: 35000, premiumTrims: { "v": 48000, "blackwing": 60000 } },
  "cadillac|ct5": { base: 39000, premiumTrims: { "v": 72000, "blackwing": 93000 } },
  "cadillac|xt4": { base: 37000 },
  "cadillac|xt5": { base: 44000, premiumTrims: { "premium luxury": 53000 } },
  "cadillac|xt6": { base: 49000 },
  "cadillac|escalade": { base: 79000, premiumTrims: { "v": 150000, "sport platinum": 105000 } },
  "cadillac|lyriq": { base: 58000 },

  // ───────────────────────── LINCOLN ─────────────────────────
  "lincoln|nautilus": { base: 50000, premiumTrims: { "black label": 76000 } },
  "lincoln|navigator": { base: 79000, premiumTrims: { "black label": 112000 } },
  "lincoln|aviator": { base: 53000, premiumTrims: { "black label": 88000 } },
  "lincoln|corsair": { base: 38000 },

  // ───────────────────────── VOLVO ─────────────────────────
  "volvo|xc40": { base: 36500, premiumTrims: { recharge: 53000 } },
  "volvo|xc60": { base: 43500, premiumTrims: { recharge: 57000 } },
  "volvo|xc90": { base: 50000, premiumTrims: { recharge: 71000 } },
  "volvo|s60": { base: 42000 },
  "volvo|s90": { base: 57000 },
  "volvo|c40": { base: 42000 },
  "volvo|ex30": { base: 35000 },
  "volvo|ex90": { base: 77000 },

  // ───────────────────────── ACURA ─────────────────────────
  "acura|integra": { base: 31000, premiumTrims: { "type s": 51000 } },
  "acura|tlx": { base: 45000, premiumTrims: { "type s": 58000 } },
  "acura|rdx": { base: 41000, premiumTrims: { "advance": 52000 } },
  "acura|mdx": { base: 49500, premiumTrims: { "type s": 67000 } },
  "acura|zdx": { base: 60000 },

  // ───────────────────────── INFINITI ─────────────────────────
  "infiniti|q50": { base: 43000 },
  "infiniti|q60": { base: 45000 },
  "infiniti|q50 red sport": { base: 53000 },
  "infiniti|qx50": { base: 42000 },
  "infiniti|qx55": { base: 49000 },
  "infiniti|qx60": { base: 49000, premiumTrims: { "sensory": 60000 } },
  "infiniti|qx80": { base: 62000 },

  // ───────────────────────── GENESIS ─────────────────────────
  "genesis|g70": { base: 40000 },
  "genesis|g80": { base: 54000 },
  "genesis|g90": { base: 89000 },
  "genesis|gv70": { base: 43000 },
  "genesis|gv80": { base: 56000, premiumTrims: { "3.5t": 63000 } },
  "genesis|gv60": { base: 50000 },
  "genesis|electrified": { base: 52000 },

  // ───────────────────────── POLESTAR ─────────────────────────
  "polestar|polestar 2": { base: 49000 },
  "polestar|polestar 3": { base: 67000 },
  "polestar|2": { base: 49000 },
  "polestar|3": { base: 67000 },
  "polestar|4": { base: 56000 },

  // ───────────────────────── LUCID / RIVIAN / FISKER ─────────────────────────
  "lucid|air": { base: 71000, premiumTrims: { "pure": 71000, "touring": 87000, "grand touring": 110000, sapphire: 250000 } },
  "lucid|gravity": { base: 80000 },
  "rivian|r1t": { base: 71000, premiumTrims: { "quad": 85000 } },
  "rivian|r1s": { base: 76000 },
  "rivian|r2": { base: 45000 },
  "fisker|ocean": { base: 39000, premiumTrims: { extreme: 69000 } },

  // ───────────────────────── MINI ─────────────────────────
  "mini|cooper": { base: 25000, premiumTrims: { "s": 28500, jcw: 35000 } },
  "mini|countryman": { base: 30000, premiumTrims: { "s": 34000, jcw: 42000 } },
  "mini|clubman": { base: 30000 },
  "mini|se": { base: 31000 },

  // ───────────────────────── MITSUBISHI ─────────────────────────
  "mitsubishi|outlander": { base: 28000, premiumTrims: { phev: 40000 } },
  "mitsubishi|eclipse cross": { base: 26000 },
  "mitsubishi|mirage": { base: 16500 },
  "mitsubishi|outlander sport": { base: 23500 },

  // ───────────────────────── MISC US / GLOBAL ─────────────────────────
  "fiat|500": { base: 17500, premiumTrims: { "e": 34000 } },
  "fiat|500x": { base: 25000 },
  "alfa romeo|giulia": { base: 43000, premiumTrims: { quadrifoglio: 81000 } },
  "alfa romeo|stelvio": { base: 47000, premiumTrims: { quadrifoglio: 87000 } },
  "alfa romeo|tonale": { base: 44000 },
  "jaguar|f-pace": { base: 56000, premiumTrims: { "svr": 87000 } },
  "jaguar|xf": { base: 47000 },
  "jaguar|i-pace": { base: 72000 },
  "jaguar|e-pace": { base: 48000 },
  "land rover|range rover": { base: 107000, premiumTrims: { "sv": 230000, "sport": 80000 } },
  "land rover|range rover sport": { base: 80000 },
  "land rover|defender": { base: 56000, premiumTrims: { "v8": 115000 } },
  "land rover|discovery": { base: 59000 },
  "land rover|velar": { base: 60000 },
  "aston martin|vantage": { base: 190000 },
  "aston martin|db12": { base: 245000 },
  "bentley|continental": { base: 250000, premiumTrims: { gt: 250000, "speed": 320000 } },
  "bentley|bentayga": { base: 200000 },
  "rolls-royce|ghost": { base: 355000 },
  "rolls-royce|phantom": { base: 500000 },
  "rolls-royce|cullinan": { base: 395000 },
  "ferrari|roma": { base: 250000 },
  "ferrari|296": { base: 340000 },
  "ferrari|purosangue": { base: 400000 },
  "lamborghini|huracan": { base: 250000 },
  "lamborghini|urus": { base: 240000, premiumTrims: { "performante": 265000 } },
  "mclaren|artura": { base: 230000 },
  "mclaren|750s": { base: 320000 },
  "maserati|ghibli": { base: 85000 },
  "maserati|grecale": { base: 65000 },
  "maserati|levante": { base: 90000 },
  "maserati|mc20": { base: 230000 },
  "lotus|emira": { base: 93000 },
  "lotus|eletre": { base: 110000 },

  // ───────────────────────── CHINESE EVs (CNY→USD approx) ─────────────────────────
  // Prices converted from CNY MSRPs to USD at ~1 USD = 7.2 CNY (2025).
  "byd|atto 3": { base: 28000 },
  "byd|han": { base: 35000, premiumTrims: { ev: 40000 } },
  "byd|seal": { base: 30000 },
  "byd|dolphin": { base: 18000 },
  "byd|yuan plus": { base: 24000 },
  "byd|tang": { base: 45000 },
  "byd|song": { base: 22000 },
  "byd|qin": { base: 20000 },
  "byd|seagull": { base: 12000 },
  "byd|seal u": { base: 32000 },
  "byd|denza": { base: 42000 },
  "byd|yangwang": { base: 125000 },
  "nio|et5": { base: 45000 },
  "nio|et7": { base: 70000 },
  "nio|es6": { base: 47000 },
  "nio|es7": { base: 60000 },
  "nio|es8": { base: 72000 },
  "nio|ec6": { base: 48000 },
  "nio|ec7": { base: 62000 },
  "xpeng|p7": { base: 35000 },
  "xpeng|p5": { base: 26000 },
  "xpeng|g9": { base: 45000 },
  "xpeng|g6": { base: 32000 },
  "zeekr|001": { base: 45000 },
  "zeekr|002": { base: 35000 },
  "zeekr|009": { base: 70000 },
  "zeekr|x": { base: 35000 },
  "zeekr|007": { base: 32000 },
  "li auto|li one": { base: 55000 },
  "li auto|l9": { base: 80000 },
  "li auto|l8": { base: 65000 },
  "li auto|l7": { base: 55000 },
  "li auto|mega": { base: 75000 },
  "geely|coolray": { base: 22000 },
  "geely|monjaro": { base: 35000 },
  "chery|tiggo": { base: 20000 },
  "gwm|haval": { base: 22000 },
  "mg motor|mg4": { base: 30000 },
  "mg motor|zs": { base: 25000 },
  "hongqi|h9": { base: 65000 },
  "hongqi|e-hs9": { base: 70000 },
  "avatr|11": { base: 55000 },
  "avatr|12": { base: 60000 },
  "voyah|dreamer": { base: 55000 },
  "voyah|free": { base: 48000 },
  "deepal|sl03": { base: 25000 },
  "aion|y": { base: 20000 },
  "aion|s": { base: 22000 },
  "ora|good cat": { base: 18000 },
  "tank|300": { base: 35000 },
  "tank|500": { base: 48000 },
  "link & co|09": { base: 40000 },
  "aito|m5": { base: 40000 },
  "aito|m7": { base: 45000 },
  "aito|m9": { base: 65000 },
};
