/**
 * FitFuel 2.0 Nutrition & Macro Calculations Engine
 */

/**
 * Calculates scaled nutritional values based on serving quantity.
 * @param {Object} food - The base food item with calories, protein, carbs, fats and serving size
 * @param {number} quantity - The requested quantity/amount
 * @param {string} unit - The unit of measurement ('g', 'ml', 'serving', 'oz', etc.)
 * @returns {Object} Scaled nutrition values
 */
export function calculateServingNutrition(food, quantity, unit = null) {
  if (!food) {
    return { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
  }

  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) {
    return { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
  }

  const baseServing = Number(food.serving_size || food.servingSize) || 100;
  const baseCalories = Number(food.calories) || 0;
  const baseProtein = Number(food.protein) || 0;
  const baseCarbs = Number(food.carbs) || 0;
  const baseFats = Number(food.fats) || 0;
  const baseFiber = Number(food.fiber) || 0;

  // If unit is specified as 'serving' or 'servings', scale directly by quantity
  const isServingCount = unit && (unit.toLowerCase().includes('serving') || unit.toLowerCase().includes('item') || unit.toLowerCase().includes('piece'));
  
  let multiplier;
  if (isServingCount) {
    multiplier = qty;
  } else if (food.serving_unit && (food.serving_unit.includes('serving') || food.serving_unit.includes('item'))) {
    multiplier = qty / (baseServing || 1);
  } else {
    // Grams / ml scaling
    multiplier = qty / (baseServing || 100);
  }

  return {
    calories: Math.max(0, Math.round(baseCalories * multiplier)),
    protein: Math.max(0, Math.round(baseProtein * multiplier * 10) / 10),
    carbs: Math.max(0, Math.round(baseCarbs * multiplier * 10) / 10),
    fats: Math.max(0, Math.round(baseFats * multiplier * 10) / 10),
    fiber: Math.max(0, Math.round(baseFiber * multiplier * 10) / 10),
  };
}

/**
 * Calculates macro calorie distribution.
 * Protein: 4 kcal/g, Carbs: 4 kcal/g, Fats: 9 kcal/g.
 */
export function calculateMacroCalories(protein = 0, carbs = 0, fats = 0) {
  const pCal = (Number(protein) || 0) * 4;
  const cCal = (Number(carbs) || 0) * 4;
  const fCal = (Number(fats) || 0) * 9;
  return {
    proteinCalories: pCal,
    carbsCalories: cCal,
    fatsCalories: fCal,
    totalMacroCalories: pCal + cCal + fCal,
  };
}

/**
 * Calculates the percentage of total calories from each macro.
 */
export function calculateMacroPercentages(protein = 0, carbs = 0, fats = 0) {
  const { proteinCalories, carbsCalories, fatsCalories, totalMacroCalories } = calculateMacroCalories(protein, carbs, fats);
  if (totalMacroCalories <= 0) {
    return { proteinPct: 0, carbsPct: 0, fatsPct: 0 };
  }
  return {
    proteinPct: Math.round((proteinCalories / totalMacroCalories) * 100),
    carbsPct: Math.round((carbsCalories / totalMacroCalories) * 100),
    fatsPct: Math.round((fatsCalories / totalMacroCalories) * 100),
  };
}

/**
 * Sums up nutritional values for a list of diary entries.
 * @param {Array} entries
 * @returns {Object} Totals for calories, protein, carbs, fats
 */
export function calculateDiaryTotals(entries = []) {
  if (!Array.isArray(entries)) {
    return { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
  }

  return entries.reduce(
    (acc, entry) => {
      acc.calories += Math.round(Number(entry.calories) || 0);
      acc.protein += Math.round(Number(entry.protein) || 0);
      acc.carbs += Math.round(Number(entry.carbs) || 0);
      acc.fats += Math.round(Number(entry.fats) || 0);
      acc.fiber += Math.round(Number(entry.fiber) || 0);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
  );
}

/**
 * Calculates remaining calories given goal, consumed, and optionally burned.
 */
export function calculateRemainingCalories(goal = 2800, consumed = 0, burned = 0) {
  const g = Number(goal) || 0;
  const c = Number(consumed) || 0;
  const b = Number(burned) || 0;
  return Math.max(0, g - c + b);
}

/**
 * Calculates progress percentage toward a goal (capped at 100 or unbounded if allowOver=true).
 */
export function calculateProgressPercentage(current = 0, target = 1, allowOver = false) {
  const cur = Number(current) || 0;
  const tgt = Number(target) || 0;
  if (tgt <= 0) return 0;
  const pct = Math.round((cur / tgt) * 100);
  return allowOver ? pct : Math.min(100, Math.max(0, pct));
}

/**
 * Sanitizes input to avoid XSS in dynamically injected text.
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c] || c));
}
