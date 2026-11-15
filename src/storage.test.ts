import { describe, expect, it } from 'vitest';
import { emptySave, mergeSaves, normalizeSave, type SaveData } from './storage';

function save(partial: Partial<SaveData> = {}): SaveData {
  return {
    ...emptySave(),
    ...partial,
    stats: { ...emptySave().stats, ...partial.stats },
    solo: { ...emptySave().solo, ...partial.solo },
  };
}

describe('account progress merge', () => {
  it('keeps a richer cloud collection and still adds local-only animals', () => {
    const local = save({
      coins: 20,
      animals: [{ uid: 'local-rabbit', speciesId: 'rabbit', stars: 1 }],
      solo: { mastered: ['fa01'], rounds: 1 },
    });
    const cloud = save({
      coins: 100,
      animals: [
        { uid: 'cloud-chick', speciesId: 'chick', stars: 3 },
        { uid: 'cloud-fox', speciesId: 'fox', stars: 2 },
      ],
      stats: { correct: 12, answered: 14, pulls: 4, merges: 1 },
      solo: { mastered: ['en01', 'fo01'], rounds: 3 },
    });
    const merged = mergeSaves(local, cloud);
    expect(merged.coins).toBe(100);
    expect(merged.animals.map((item) => item.uid).sort()).toEqual(['cloud-chick', 'cloud-fox', 'local-rabbit']);
    expect(merged.stats.correct).toBe(12);
    expect(merged.solo.mastered.sort()).toEqual(['en01', 'fa01', 'fo01']);
    expect(merged.solo.rounds).toBe(3);
  });

  it('does not drop a richer local coin balance when the cloud collection is larger', () => {
    const local = save({
      coins: 80,
      animals: [{ uid: 'bee', speciesId: 'bee', stars: 1 }],
      stats: { correct: 4, answered: 4, pulls: 1, merges: 0 },
    });
    const cloud = save({
      coins: 10,
      animals: [{ uid: 'panda', speciesId: 'panda', stars: 2 }],
      stats: { correct: 1, answered: 9, pulls: 6, merges: 2 },
    });
    const merged = mergeSaves(local, cloud);
    expect(merged.coins).toBe(80);
    expect(merged.animals).toHaveLength(2);
    expect(merged.stats).toEqual({ correct: 4, answered: 9, pulls: 6, merges: 2 });
  });

  it('keeps the higher star when the same animal exists on both sides', () => {
    const local = save({ animals: [{ uid: 'same', speciesId: 'chick', stars: 2 }] });
    const cloud = save({ animals: [{ uid: 'same', speciesId: 'chick', stars: 3 }] });
    expect(mergeSaves(local, cloud).animals).toEqual([{ uid: 'same', speciesId: 'chick', stars: 3 }]);
    expect(mergeSaves(cloud, local).animals).toEqual([{ uid: 'same', speciesId: 'chick', stars: 3 }]);
  });

  it('uploads local progress when the account has no cloud document', () => {
    const local = save({ coins: 15, solo: { mastered: ['rs01'], rounds: 1 } });
    expect(mergeSaves(local, null)).toEqual(local);
  });

  it('accepts older local saves that have no solo field', () => {
    const parsed = normalizeSave({
      v: 1,
      coins: 5,
      animals: [{ uid: 'c', speciesId: 'chick', stars: 1 }],
      stats: { correct: 1, answered: 2, pulls: 0, merges: 0 },
    });
    expect(parsed?.solo).toEqual({ mastered: [], rounds: 0 });
    expect(parsed?.coins).toBe(5);
    expect(normalizeSave({ v: 1, animals: [{ uid: 'x', speciesId: 'nope', stars: 9 }] })?.animals).toEqual([]);
  });
});
