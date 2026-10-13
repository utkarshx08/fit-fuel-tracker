import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidUuid,
  getFoodDiary,
  addFoodDiaryEntry,
  updateFoodDiaryEntry,
  deleteFoodDiaryEntry,
} from '../src/services/fitnessService';

describe('Fitness Service & Food Diary Operations', () => {
  beforeEach(() => {
    if (typeof globalThis.localStorage === 'undefined') {
      const mem = new Map();
      globalThis.localStorage = {
        getItem: (k) => mem.get(k) || null,
        setItem: (k, v) => mem.set(k, String(v)),
        removeItem: (k) => mem.delete(k),
        clear: () => mem.clear(),
      };
    } else {
      globalThis.localStorage.clear();
    }
  });

  it('validates UUIDs correctly', () => {
    expect(isValidUuid('a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d')).toBe(true);
    expect(isValidUuid('not-a-uuid')).toBe(false);
    expect(isValidUuid('staple-1')).toBe(false);
    expect(isValidUuid(null)).toBe(false);
    expect(isValidUuid(undefined)).toBe(false);
  });

  it('adds, updates, and deletes food diary entries', async () => {
    const userId = '11111111-2222-4333-8444-555555555555';
    const today = new Date().toISOString().split('T')[0];

    // 1. Add food
    const entry = await addFoodDiaryEntry(userId, {
      name: 'Paneer Wrap',
      meal: 'Lunch',
      serving_size: 1,
      serving_unit: 'wrap',
      calories: 320,
      protein: 18,
      carbs: 30,
      fats: 14,
      entry_date: today,
    });

    expect(entry.id).toBeDefined();
    expect(entry.name).toBe('Paneer Wrap');
    expect(entry.calories).toBe(320);

    const diary = await getFoodDiary(userId, today);
    expect(diary.length).toBe(1);
    expect(diary[0].name).toBe('Paneer Wrap');

    // 2. Update food (e.g. increase to 1.5 wraps)
    const updated = await updateFoodDiaryEntry(userId, entry.id, {
      serving_size: 1.5,
      calories: 480,
      protein: 27,
      carbs: 45,
      fats: 21,
    });

    expect(updated.serving_size).toBe(1.5);
    expect(updated.calories).toBe(480);
    expect(updated.protein).toBe(27);

    // 3. Delete food
    await deleteFoodDiaryEntry(userId, entry.id);
    const diaryAfterDelete = await getFoodDiary(userId, today);
    expect(diaryAfterDelete.length).toBe(0);
  });

  it('isolates guest data from authenticated UUID user data', async () => {
    const today = new Date().toISOString().split('T')[0];

    // Guest gets seeded default demo entries
    const guestDiary = await getFoodDiary(null, today);
    expect(guestDiary.length).toBeGreaterThan(0);

    // New authenticated user starts with a clean slate
    const authUserId = '22222222-3333-4444-8555-666666666666';
    const userDiary = await getFoodDiary(authUserId, today);
    expect(userDiary.length).toBe(0);
  });
});
