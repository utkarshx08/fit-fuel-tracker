/**
 * Nutrition API Integration Service
 * Primary: USDA FoodData Central API
 * Secondary Fallback: Open Food Facts API (No API key needed)
 * Local Verified Fallback: Curated staple foods for offline resilience
 */

export const getUsdaKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USDA_API_KEY) {
    return import.meta.env.VITE_USDA_API_KEY.trim().replace(/^["']|["']$/g, '');
  }
  return 'DEMO_KEY';
};

const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
const OFF_DIRECT_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

/**
 * Curated offline staples with exact USDA nutrition per 100g or standard serving
 */
export const VERIFIED_STAPLE_FOODS = [
  {
    id: 'staple-1',
    name: 'Chicken Breast (cooked, skinless)',
    brand: 'Whole Food',
    serving_size: 100,
    serving_unit: 'g',
    calories: 165,
    protein: 31.0,
    carbs: 0.0,
    fats: 3.6,
    fiber: 0.0,
    source: 'Verified Database',
  },
  {
    id: 'staple-2',
    name: 'Whole Large Egg',
    brand: 'Farm Fresh',
    serving_size: 1,
    serving_unit: 'large egg (50g)',
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fats: 4.8,
    fiber: 0.0,
    source: 'Verified Database',
  },
  {
    id: 'staple-3',
    name: 'Egg Whites',
    brand: 'Farm Fresh',
    serving_size: 100,
    serving_unit: 'g (~3 whites)',
    calories: 52,
    protein: 10.9,
    carbs: 0.7,
    fats: 0.2,
    fiber: 0.0,
    source: 'Verified Database',
  },
  {
    id: 'staple-4',
    name: 'Rolled Oats (dry)',
    brand: 'Quaker / Generic',
    serving_size: 50,
    serving_unit: 'g',
    calories: 187,
    protein: 6.5,
    carbs: 33.0,
    fats: 3.2,
    fiber: 5.1,
    source: 'Verified Database',
  },
  {
    id: 'staple-5',
    name: 'Greek Yogurt (0% Non-Fat)',
    brand: 'Chobani / Fage',
    serving_size: 170,
    serving_unit: 'g (3/4 cup)',
    calories: 100,
    protein: 18.0,
    carbs: 6.0,
    fats: 0.7,
    fiber: 0.0,
    source: 'Verified Database',
  },
  {
    id: 'staple-6',
    name: 'Brown Rice (cooked)',
    brand: 'Generic',
    serving_size: 150,
    serving_unit: 'g (1 cup)',
    calories: 168,
    protein: 3.8,
    carbs: 35.0,
    fats: 1.4,
    fiber: 2.5,
    source: 'Verified Database',
  },
  {
    id: 'staple-7',
    name: 'White Basmati Rice (cooked)',
    brand: 'Generic',
    serving_size: 150,
    serving_unit: 'g (1 cup)',
    calories: 195,
    protein: 4.1,
    carbs: 43.0,
    fats: 0.4,
    fiber: 0.6,
    source: 'Verified Database',
  },
  {
    id: 'staple-8',
    name: 'Salmon Fillet (Atlantic, cooked)',
    brand: 'Fresh Catch',
    serving_size: 100,
    serving_unit: 'g',
    calories: 206,
    protein: 22.1,
    carbs: 0.0,
    fats: 12.3,
    fiber: 0.0,
    source: 'Verified Database',
  },
  {
    id: 'staple-9',
    name: 'Paneer (Indian Cottage Cheese)',
    brand: 'Amul / Mother Dairy',
    serving_size: 100,
    serving_unit: 'g',
    calories: 265,
    protein: 18.3,
    carbs: 3.4,
    fats: 20.8,
    fiber: 0.0,
    source: 'Verified Database',
  },
  {
    id: 'staple-10',
    name: 'Whey Protein Isolate Powder',
    brand: 'Optimum Nutrition',
    serving_size: 30,
    serving_unit: 'g (1 scoop)',
    calories: 120,
    protein: 24.0,
    carbs: 3.0,
    fats: 1.0,
    fiber: 0.5,
    source: 'Verified Database',
  },
  {
    id: 'staple-11',
    name: 'Banana (medium, raw)',
    brand: 'Fresh Fruit',
    serving_size: 118,
    serving_unit: 'medium banana (118g)',
    calories: 105,
    protein: 1.3,
    carbs: 27.0,
    fats: 0.3,
    fiber: 3.1,
    source: 'Verified Database',
  },
  {
    id: 'staple-12',
    name: 'Peanut Butter (Natural)',
    brand: 'Pintola / Generic',
    serving_size: 32,
    serving_unit: 'g (2 tbsp)',
    calories: 188,
    protein: 8.0,
    carbs: 7.0,
    fats: 16.0,
    fiber: 2.0,
    source: 'Verified Database',
  },
  {
    id: 'staple-13',
    name: 'Almonds (raw)',
    brand: 'Generic',
    serving_size: 28,
    serving_unit: 'g (handful, 23 nuts)',
    calories: 164,
    protein: 6.0,
    carbs: 6.1,
    fats: 14.2,
    fiber: 3.5,
    source: 'Verified Database',
  },
  {
    id: 'staple-14',
    name: 'Sweet Potato (baked)',
    brand: 'Generic',
    serving_size: 150,
    serving_unit: 'g (1 medium)',
    calories: 135,
    protein: 3.0,
    carbs: 31.0,
    fats: 0.2,
    fiber: 4.5,
    source: 'Verified Database',
  },
  {
    id: 'staple-15',
    name: 'Broccoli (steamed)',
    brand: 'Generic',
    serving_size: 100,
    serving_unit: 'g (1 cup florets)',
    calories: 35,
    protein: 2.4,
    carbs: 7.2,
    fats: 0.4,
    fiber: 2.6,
    source: 'Verified Database',
  },
  {
    id: 'staple-16',
    name: 'Whole Milk (3.25% fat)',
    brand: 'Generic',
    serving_size: 244,
    serving_unit: 'ml (1 cup)',
    calories: 149,
    protein: 7.7,
    carbs: 11.7,
    fats: 8.0,
    fiber: 0.0,
    source: 'Verified Database',
  },
  {
    id: 'staple-17',
    name: 'Avocado (raw)',
    brand: 'Hass',
    serving_size: 100,
    serving_unit: 'g (~1/2 avocado)',
    calories: 160,
    protein: 2.0,
    carbs: 8.5,
    fats: 14.7,
    fiber: 6.7,
    source: 'Verified Database',
  },
  {
    id: 'staple-18',
    name: 'Tofu (Firm)',
    brand: 'Generic',
    serving_size: 100,
    serving_unit: 'g',
    calories: 83,
    protein: 10.0,
    carbs: 2.3,
    fats: 5.3,
    fiber: 0.9,
    source: 'Verified Database',
  },
  {
    id: 'staple-19',
    name: 'Cooked Lentils (Dal)',
    brand: 'Generic',
    serving_size: 150,
    serving_unit: 'g (1 cup cooked)',
    calories: 174,
    protein: 13.5,
    carbs: 29.8,
    fats: 0.6,
    fiber: 11.8,
    source: 'Verified Database',
  },
  {
    id: 'staple-20',
    name: 'Lean Ground Beef (93/7, cooked)',
    brand: 'Generic',
    serving_size: 100,
    serving_unit: 'g',
    calories: 206,
    protein: 26.1,
    carbs: 0.0,
    fats: 10.6,
    fiber: 0.0,
    source: 'Verified Database',
  },
];

/**
 * Searches USDA FoodData Central API
 * Uses official POST endpoint with JSON body to support complex dataTypes without nginx query string issues.
 */
export async function searchUSDA(query) {
  const apiKey = getUsdaKey();
  const url = `${USDA_BASE_URL}/foods/search?api_key=${encodeURIComponent(apiKey)}`;
  
  const payload = {
    query: query,
    pageSize: 15,
    dataType: ['Foundation', 'SR Legacy', 'Branded', 'Survey (FNDDS)'],
  };

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(9000),
    });
  } catch (netErr) {
    // If POST fails with network issue, attempt simple GET without complex dataType query params
    const getUrl = `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=15&api_key=${encodeURIComponent(apiKey)}`;
    response = await fetch(getUrl, { signal: AbortSignal.timeout(9000) });
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || errJson.error?.message || '';
    } catch (e) {
      // Non-JSON response
    }

    if (response.status === 400) {
      throw new Error(`USDA API invalid request (HTTP 400)${errorDetail ? `: ${errorDetail}` : ''}`);
    } else if (response.status === 401 || response.status === 403) {
      throw new Error(`USDA API authentication error (HTTP ${response.status}): Invalid API key`);
    } else if (response.status >= 500) {
      throw new Error(`USDA API service outage (HTTP ${response.status})`);
    } else {
      throw new Error(`USDA API error: HTTP ${response.status}${errorDetail ? ` - ${errorDetail}` : ''}`);
    }
  }

  const data = await response.json();
  if (!data.foods || !Array.isArray(data.foods)) {
    return [];
  }

  return data.foods.map((item) => {
    const nutrients = item.foodNutrients || [];

    // Helper for robust nutrient extraction
    const getNutrient = (names, ids = []) => {
      // 1. Exact ID match first
      for (const id of ids) {
        const found = nutrients.find((n) => n.nutrientId === id);
        if (found && !isNaN(Number(found.value))) {
          return Number(found.value);
        }
      }
      // 2. Exact or partial name match
      for (const name of names) {
        const found = nutrients.find(
          (n) => n.nutrientName && n.nutrientName.toLowerCase().includes(name.toLowerCase())
        );
        if (found && !isNaN(Number(found.value))) {
          return Number(found.value);
        }
      }
      return 0;
    };

    // Correct Energy (KCAL vs kJ resolution)
    let calories = 0;
    const kcalNutrient = nutrients.find(
      (n) =>
        n.nutrientId === 1008 ||
        (n.unitName && n.unitName.toUpperCase() === 'KCAL') ||
        (n.nutrientName && n.nutrientName.toLowerCase() === 'energy' && n.unitName?.toUpperCase() === 'KCAL')
    );
    if (kcalNutrient && !isNaN(Number(kcalNutrient.value))) {
      calories = Number(kcalNutrient.value);
    } else {
      // If only kJ is present, convert to kcal (1 kcal = 4.184 kJ)
      const kjNutrient = nutrients.find(
        (n) => n.nutrientId === 1062 || (n.unitName && n.unitName.toUpperCase() === 'KJ')
      );
      if (kjNutrient && !isNaN(Number(kjNutrient.value))) {
        calories = Number(kjNutrient.value) / 4.184;
      }
    }

    const protein = getNutrient(['Protein'], [1003]);
    const carbs = getNutrient(['Carbohydrate, by difference', 'Carbohydrate'], [1005]);
    const fats = getNutrient(['Total lipid (fat)', 'Fat'], [1004]);
    const fiber = getNutrient(['Fiber, total dietary', 'Fiber'], [1079]);

    const servingSize = Number(item.servingSize) || 100;
    const servingUnit = item.servingSizeUnit || 'g';

    return {
      id: `usda-${item.fdcId}`,
      fdc_id: String(item.fdcId),
      name: item.description || 'Unknown food',
      brand: item.brandOwner || item.brandName || 'USDA Standard',
      serving_size: Math.round(servingSize * 10) / 10,
      serving_unit: servingUnit,
      calories: Math.max(0, Math.round(calories)),
      protein: Math.max(0, Math.round(protein * 10) / 10),
      carbs: Math.max(0, Math.round(carbs * 10) / 10),
      fats: Math.max(0, Math.round(fats * 10) / 10),
      fiber: Math.max(0, Math.round(fiber * 10) / 10),
      source: 'USDA FoodData Central',
    };
  });
}

/**
 * Searches Open Food Facts API with exponential backoff retries and timeout
 */
export async function searchOpenFoodFacts(query) {
  // Use Vite dev server proxy in development to bypass CORS, fallback to direct in prod
  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const url = isDev
    ? `/api/off?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=12`
    : `${OFF_DIRECT_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=12`;

  const maxRetries = 2;
  const timeoutMs = 8000;
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FitFuelApp/2.0 (contact@fitfuel.app)',
        },
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.products || !Array.isArray(data.products)) {
          return [];
        }

        return data.products
          .filter((p) => p.product_name && p.nutriments)
          .map((p) => {
            const nm = p.nutriments;
            const calories =
              nm['energy-kcal_100g'] ??
              (nm['energy_100g'] ? nm['energy_100g'] / 4.184 : 0);
            const protein = nm['proteins_100g'] ?? 0;
            const carbs = nm['carbohydrates_100g'] ?? 0;
            const fats = nm['fat_100g'] ?? 0;
            const fiber = nm['fiber_100g'] ?? 0;

            return {
              id: `off-${p.code || Math.random().toString(36).substr(2, 9)}`,
              name: p.product_name,
              brand: p.brands || 'Commercial Product',
              serving_size: 100,
              serving_unit: 'g',
              calories: Math.max(0, Math.round(Number(calories) || 0)),
              protein: Math.max(0, Math.round((Number(protein) || 0) * 10) / 10),
              carbs: Math.max(0, Math.round((Number(carbs) || 0) * 10) / 10),
              fats: Math.max(0, Math.round((Number(fats) || 0) * 10) / 10),
              fiber: Math.max(0, Math.round((Number(fiber) || 0) * 10) / 10),
              source: 'Open Food Facts',
            };
          })
          .filter((item) => item.calories > 0 || item.protein > 0);
      }

      // If temporary 503/502/504 or 429, retry with exponential backoff
      if ([429, 502, 503, 504].includes(response.status)) {
        if (attempt < maxRetries) {
          await new Promise((res) => setTimeout(res, 600 * Math.pow(2, attempt)));
          continue;
        }
        throw new Error(`Open Food Facts service temporarily unavailable (HTTP ${response.status}) after ${maxRetries} retries`);
      }

      throw new Error(`Open Food Facts error: HTTP ${response.status}`);
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries && !err.name?.includes('AbortError')) {
        await new Promise((res) => setTimeout(res, 600 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error('Open Food Facts request failed');
}

/**
 * Main unified food search function
 * Searches Custom Foods + Verified Staples + USDA FoodData Central + Open Food Facts
 */
export async function searchFoodDatabase(query, customFoods = []) {
  const trimmed = (query || '').trim().toLowerCase();
  if (!trimmed) {
    return { results: [], source: '', error: null };
  }

  // 1. Search user's custom foods
  const matchedCustom = customFoods
    .filter(
      (f) =>
        f.name.toLowerCase().includes(trimmed) ||
        (f.brand && f.brand.toLowerCase().includes(trimmed))
    )
    .map((f) => ({ ...f, source: 'Custom Food' }));

  // 2. Search local verified staple foods
  const matchedStaples = VERIFIED_STAPLE_FOODS.filter(
    (f) =>
      f.name.toLowerCase().includes(trimmed) ||
      (f.brand && f.brand.toLowerCase().includes(trimmed))
  );

  let usdaResults = [];
  let offResults = [];
  let sourcesUsed = [];
  let apiError = null;

  // 3. Query USDA FoodData Central API
  try {
    usdaResults = await searchUSDA(trimmed);
    if (usdaResults.length > 0) {
      sourcesUsed.push('USDA FoodData Central');
    }
  } catch (usdaErr) {
    console.warn('USDA search error:', usdaErr.message);
  }

  // 4. If USDA returned fewer than 4 results or failed, supplement with Open Food Facts
  if (usdaResults.length < 4) {
    try {
      offResults = await searchOpenFoodFacts(trimmed);
      if (offResults.length > 0) {
        sourcesUsed.push('Open Food Facts');
      }
    } catch (offErr) {
      console.warn('Open Food Facts search error:', offErr.message);
    }
  }

  if (sourcesUsed.length === 0) {
    if (matchedStaples.length > 0) {
      sourcesUsed.push('Verified Staples');
    } else {
      apiError = 'External APIs unavailable or rate-limited. You can create custom foods.';
    }
  }

  // Combine results in order of accuracy
  const combined = [
    ...matchedCustom,
    ...matchedStaples,
    ...usdaResults,
    ...offResults,
  ];

  // Deduplicate by normalized name
  const seen = new Set();
  const deduped = [];
  for (const item of combined) {
    const key = (item.name || '').toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  return {
    results: deduped,
    source: sourcesUsed.join(' + ') || 'Verified Database',
    error: apiError,
  };
}

/**
 * Health check utility to test active APIs and response latency with error categorization
 */
export async function testNutritionApis() {
  const status = {
    usda: { connected: false, latencyMs: 0, error: null, category: 'unknown', details: '', count: 0 },
    openFoodFacts: { connected: false, latencyMs: 0, error: null, category: 'unknown', details: '', count: 0 },
  };

  // Test USDA with live query
  const t0 = Date.now();
  try {
    const res = await searchUSDA('oats');
    status.usda.latencyMs = Date.now() - t0;
    if (Array.isArray(res) && res.length > 0) {
      status.usda.connected = true;
      status.usda.count = res.length;
      status.usda.category = 'ok';
      status.usda.details = `Connected (${status.usda.latencyMs} ms) — ${res.length} live USDA foods retrieved`;
    } else {
      status.usda.connected = false;
      status.usda.category = 'empty_result';
      status.usda.details = 'Query succeeded but returned 0 items';
    }
  } catch (err) {
    status.usda.latencyMs = Date.now() - t0;
    status.usda.error = err.message;
    if (err.message?.includes('HTTP 400')) {
      status.usda.category = 'invalid_request';
      status.usda.details = `Invalid Request (HTTP 400): ${err.message}`;
    } else if (err.message?.includes('HTTP 401') || err.message?.includes('HTTP 403')) {
      status.usda.category = 'auth_failure';
      status.usda.details = `Authentication Failed (HTTP 401/403): Invalid API Key`;
    } else if (err.message?.includes('HTTP 5')) {
      status.usda.category = 'service_outage';
      status.usda.details = `Service Outage (HTTP 5xx): USDA gateway unavailable`;
    } else {
      status.usda.category = 'network_error';
      status.usda.details = err.message;
    }
  }

  // Test Open Food Facts with live query
  const t1 = Date.now();
  try {
    const res = await searchOpenFoodFacts('oats');
    status.openFoodFacts.latencyMs = Date.now() - t1;
    if (Array.isArray(res) && res.length > 0) {
      status.openFoodFacts.connected = true;
      status.openFoodFacts.count = res.length;
      status.openFoodFacts.category = 'ok';
      status.openFoodFacts.details = `Connected (${status.openFoodFacts.latencyMs} ms) — ${res.length} products retrieved`;
    } else {
      status.openFoodFacts.connected = false;
      status.openFoodFacts.category = 'empty_result';
      status.openFoodFacts.details = 'Query succeeded but returned 0 products';
    }
  } catch (err) {
    status.openFoodFacts.latencyMs = Date.now() - t1;
    status.openFoodFacts.error = err.message;
    if (err.message?.includes('503')) {
      status.openFoodFacts.category = 'service_outage';
      status.openFoodFacts.details = `Service Outage (HTTP 503): Open Food Facts upstream temporarily unavailable. Manual tracking & USDA remain fully operational.`;
    } else if (err.message?.includes('502') || err.message?.includes('504')) {
      status.openFoodFacts.category = 'service_outage';
      status.openFoodFacts.details = `Gateway Error (HTTP 502/504): Timeout after retries.`;
    } else if (err.message?.includes('CORS') || err.name?.includes('TypeError')) {
      status.openFoodFacts.category = 'cors_restricted';
      status.openFoodFacts.details = `CORS Restricted on direct origin. Verified local staples & USDA active.`;
    } else {
      status.openFoodFacts.category = 'network_error';
      status.openFoodFacts.details = err.message;
    }
  }

  return status;
}
