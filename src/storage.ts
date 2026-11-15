import { SPECIES } from './animals';
import type { AnimalInst, Star } from './logic';
import { QUESTIONS } from './questions';
import { emptyPasture, mergePasture, normalizePasture, type PastureData } from './pasture';

const KEY = 'p6sci.v1';
const QUESTION_IDS = new Set(QUESTIONS.map((item) => item.id));

export interface SoloProgress {
  mastered: string[];
  rounds: number;
}

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
  solo: SoloProgress;
  pasture: PastureData;
}

export function emptySave(): SaveData {
  return {
    v: 1,
    coins: 0,
    animals: [],
    stats: { correct: 0, answered: 0, pulls: 0, merges: 0 },
    solo: { mastered: [], rounds: 0 },
    pasture: emptyPasture(),
  };
}

function knownSpecies(id: string): boolean {
  return SPECIES.some((item) => item.id === id);
}

function asStar(value: unknown): Star | null {
  if (value === 1 || value === 2 || value === 3) return value;
  return null;
}

export function normalizeSave(raw: unknown): SaveData | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Partial<SaveData>;
  if (data.v !== 1 || !Array.isArray(data.animals)) return null;
  const animals: AnimalInst[] = [];
  for (const item of data.animals) {
    if (!item || typeof item !== 'object') continue;
    const animal = item as Partial<AnimalInst>;
    const stars = asStar(animal.stars);
    if (typeof animal.uid !== 'string' || typeof animal.speciesId !== 'string' || !stars) continue;
    if (!knownSpecies(animal.speciesId)) continue;
    animals.push({ uid: animal.uid, speciesId: animal.speciesId, stars });
  }
  const stats = data.stats ?? { correct: 0, answered: 0, pulls: 0, merges: 0 };
  const solo = data.solo;
  const mastered = Array.isArray(solo?.mastered)
    ? [...new Set(solo.mastered.filter((id): id is string => typeof id === 'string' && QUESTION_IDS.has(id)))]
    : [];
  const ownedIds = new Set(animals.map((item) => item.speciesId));
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
    solo: {
      mastered,
      rounds: Math.max(0, Math.floor(Number(solo?.rounds) || 0)),
    },
    pasture: normalizePasture(data.pasture, ownedIds, Date.now()),
  };
}

/** Keep every animal from both sides, and never lower coins, stats, or mastered questions. */
export function mergeSaves(local: SaveData, cloud: SaveData | null): SaveData {
  if (!cloud) return structuredClone(local);
  const byUid = new Map<string, AnimalInst>();
  for (const animal of [...cloud.animals, ...local.animals]) {
    const previous = byUid.get(animal.uid);
    if (!previous || animal.stars > previous.stars) byUid.set(animal.uid, { ...animal });
  }
  const animals = [...byUid.values()];
  const ownedIds = new Set(animals.map((item) => item.speciesId));
  return {
    v: 1,
    coins: Math.max(local.coins, cloud.coins),
    animals,
    stats: {
      correct: Math.max(local.stats.correct, cloud.stats.correct),
      answered: Math.max(local.stats.answered, cloud.stats.answered),
      pulls: Math.max(local.stats.pulls, cloud.stats.pulls),
      merges: Math.max(local.stats.merges, cloud.stats.merges),
    },
    solo: {
      mastered: [...new Set([...cloud.solo.mastered, ...local.solo.mastered])],
      rounds: Math.max(local.solo.rounds, cloud.solo.rounds),
    },
    pasture: mergePasture(local.pasture, cloud.pasture, ownedIds),
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySave();
    return normalizeSave(JSON.parse(raw) as unknown) ?? emptySave();
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
