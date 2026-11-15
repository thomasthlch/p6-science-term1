import { SPECIES } from './animals';
import type { AnimalInst } from './logic';

const KEY = 'p6sci.v1';

export interface SaveData {
  v: 1;
  coins: number;
  animals: AnimalInst[];
  stats: {
    correct: number;
    answered: number;
    pulls: number;
    merges: number;
  };
}

export function emptySave(): SaveData {
  return {
    v: 1,
    coins: 0,
    animals: [],
    stats: { correct: 0, answered: 0, pulls: 0, merges: 0 },
  };
}

function knownSpecies(id: string): boolean {
  return SPECIES.some((item) => item.id === id);
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySave();
    const data = JSON.parse(raw) as Partial<SaveData>;
    if (!data || data.v !== 1 || !Array.isArray(data.animals)) return emptySave();
    const animals = data.animals.filter(
      (item): item is AnimalInst =>
        !!item &&
        typeof item.uid === 'string' &&
        typeof item.speciesId === 'string' &&
        knownSpecies(item.speciesId) &&
        (item.stars === 1 || item.stars === 2 || item.stars === 3),
    );
    const stats = data.stats ?? { correct: 0, answered: 0, pulls: 0, merges: 0 };
    return {
      v: 1,
      coins: Math.max(0, Math.floor(Number(data.coins) || 0)),
      animals,
      stats: {
        correct: Math.max(0, Math.floor(Number(stats.correct) || 0)),
        answered: Math.max(0, Math.floor(Number(stats.answered) || 0)),
        pulls: Math.max(0, Math.floor(Number(stats.pulls) || 0)),
        merges: Math.max(0, Math.floor(Number(stats.merges) || 0)),
      },
    };
  } catch {
    return emptySave();
  }
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* private mode or full storage: keep playing this session */
  }
}
