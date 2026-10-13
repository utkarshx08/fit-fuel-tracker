import { describe, it, expect } from 'vitest';
import { calculateDiaryTotals } from '../src/utils/nutritionCalculations';

describe('Food Diary Totals Aggregation', () => {
  it('correctly sums calories, protein, carbs and fats for multiple items', () => {
    const entries = [
      { id: 1, name: 'Oats with milk', calories: 350, protein: 15, carbs: 50, fats: 10 },
      { id: 2, name: 'Eggs & toast', calories: 250, protein: 20, carbs: 20, fats: 10 },
      { id: 3, name: 'Chicken, rice & veg', calories: 450, protein: 38, carbs: 45, fats: 9 },
    ];

    const totals = calculateDiaryTotals(entries);
    expect(totals.calories).toBe(1050);
    expect(totals.protein).toBe(73);
    expect(totals.carbs).toBe(115);
    expect(totals.fats).toBe(29);
  });

  it('handles empty entries array returning zeros', () => {
    const totals = calculateDiaryTotals([]);
    expect(totals).toEqual({
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
    });
  });

  it('tolerates non-numeric or string values safely', () => {
    const entries = [
      { calories: '300', protein: '20.5', carbs: null, fats: undefined },
    ];
    const totals = calculateDiaryTotals(entries);
    expect(totals.calories).toBe(300);
    expect(totals.protein).toBe(21);
    expect(totals.carbs).toBe(0);
    expect(totals.fats).toBe(0);
  });
});
