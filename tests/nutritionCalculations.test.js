import { describe, it, expect } from 'vitest';
import {
  calculateServingNutrition,
  calculateMacroCalories,
  calculateMacroPercentages,
  calculateDiaryTotals,
  calculateRemainingCalories,
  calculateProgressPercentage,
} from '../src/utils/nutritionCalculations';

describe('Nutrition Calculations', () => {
  const sampleChicken = {
    name: 'Chicken Breast',
    serving_size: 100,
    serving_unit: 'g',
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
  };

  it('correctly calculates scaled nutrition for double serving (200g)', () => {
    const scaled = calculateServingNutrition(sampleChicken, 200, 'g');
    expect(scaled.calories).toBe(330);
    expect(scaled.protein).toBe(62);
    expect(scaled.carbs).toBe(0);
    expect(scaled.fats).toBe(7.2);
  });

  it('correctly scales for half serving (50g)', () => {
    const scaled = calculateServingNutrition(sampleChicken, 50, 'g');
    expect(scaled.calories).toBe(83); // 165 * 0.5 = 82.5 rounded to 83
    expect(scaled.protein).toBe(15.5);
    expect(scaled.fats).toBe(1.8);
  });

  it('handles zero or invalid quantity gracefully', () => {
    const zero = calculateServingNutrition(sampleChicken, 0, 'g');
    expect(zero.calories).toBe(0);
    expect(zero.protein).toBe(0);

    const invalid = calculateServingNutrition(sampleChicken, -5, 'g');
    expect(invalid.calories).toBe(0);
  });

  it('calculates macro calories using standard 4-4-9 formula', () => {
    // 25g protein (100 kcal), 50g carbs (200 kcal), 10g fat (90 kcal) => 390 total
    const macros = calculateMacroCalories(25, 50, 10);
    expect(macros.proteinCalories).toBe(100);
    expect(macros.carbsCalories).toBe(200);
    expect(macros.fatsCalories).toBe(90);
    expect(macros.totalMacroCalories).toBe(390);
  });

  it('calculates macro percentages accurately', () => {
    // 25g P (100 kcal), 25g C (100 kcal), 0g F => total 200 kcal => 50% P, 50% C
    const pcts = calculateMacroPercentages(25, 25, 0);
    expect(pcts.proteinPct).toBe(50);
    expect(pcts.carbsPct).toBe(50);
    expect(pcts.fatsPct).toBe(0);
  });

  it('calculates remaining calories given goals and burned energy', () => {
    expect(calculateRemainingCalories(2800, 800, 0)).toBe(2000);
    expect(calculateRemainingCalories(2800, 800, 200)).toBe(2200);
    expect(calculateRemainingCalories(2000, 2500, 0)).toBe(0); // non-negative
  });

  it('calculates progress percentage capped at 100% by default', () => {
    expect(calculateProgressPercentage(500, 1000)).toBe(50);
    expect(calculateProgressPercentage(1500, 1000)).toBe(100);
    expect(calculateProgressPercentage(1500, 1000, true)).toBe(150); // allowOver
    expect(calculateProgressPercentage(0, 0)).toBe(0);
  });
});
