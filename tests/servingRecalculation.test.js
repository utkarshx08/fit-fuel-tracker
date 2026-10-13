import { describe, it, expect } from 'vitest';
import { calculateServingNutrition } from '../src/utils/nutritionCalculations';

describe('Serving Size and Quantity Recalculator', () => {
  const egg = {
    name: 'Whole Large Egg',
    serving_size: 1,
    serving_unit: 'large egg (50g)',
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fats: 4.8,
  };

  it('calculates 3 whole eggs', () => {
    const result = calculateServingNutrition(egg, 3, 'serving');
    expect(result.calories).toBe(216);
    expect(result.protein).toBe(18.9);
    expect(result.carbs).toBe(1.2);
    expect(result.fats).toBe(14.4);
  });

  const whey = {
    name: 'Whey Protein Isolate',
    serving_size: 30,
    serving_unit: 'g (1 scoop)',
    calories: 120,
    protein: 24,
    carbs: 3,
    fats: 1,
  };

  it('calculates 1.5 scoops (45g)', () => {
    const result = calculateServingNutrition(whey, 45, 'g');
    expect(result.calories).toBe(180);
    expect(result.protein).toBe(36);
    expect(result.carbs).toBe(4.5);
    expect(result.fats).toBe(1.5);
  });
});
