import type { Question, TopicId } from './types';
import { TOPIC_ORDER } from './types';

export type Star = 1 | 2 | 3;

export interface AnimalInst {
  uid: string;
  speciesId: string;
  stars: Star;
}

export const SOLO_ROUND = 10;
export const BOARD_ROUND = 8;
export const BOARD_LIMIT_MS = 30_000;
export const SOLO_FIRST_COINS = 10;
export const SOLO_RETRY_COINS = 5;

export function shuffle<T>(list: readonly T[], rng: () => number = Math.random): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const a = arr[i]!;
    const b = arr[j]!;
    arr[i] = b;
    arr[j] = a;
  }
  return arr;
}

export function isCorrect(question: Question, picked: readonly string[]): boolean {
  if (picked.length !== question.answer.length) return false;
  const need = new Set(question.answer);
  return picked.every((id) => need.has(id));
}

export function soloCoins(correct: boolean, retrying: boolean): number {
  if (!correct) return 0;
  return retrying ? SOLO_RETRY_COINS : SOLO_FIRST_COINS;
}

/** Faster correct answers earn more. Wrong answers earn nothing. Range about 8–24. */
export function boardCoins(elapsedMs: number, limitMs: number, correct: boolean): number {
  if (!correct) return 0;
  const clamped = Math.min(limitMs, Math.max(0, elapsedMs));
  const ratio = 1 - clamped / limitMs;
  return Math.round(8 + ratio * 16);
}

export function pickQuestions(
  all: readonly Question[],
  topic: TopicId | 'mix',
  count: number,
  rng: () => number = Math.random,
): Question[] {
  if (topic !== 'mix') {
    return shuffle(
      all.filter((item) => item.topic === topic),
      rng,
    ).slice(0, count);
  }
  const buckets = new Map<TopicId, Question[]>();
  for (const id of TOPIC_ORDER) buckets.set(id, []);
  for (const item of all) buckets.get(item.topic)?.push(item);
  for (const id of TOPIC_ORDER) buckets.set(id, shuffle(buckets.get(id) ?? [], rng));
  const picked: Question[] = [];
  let guard = 0;
  while (picked.length < count && guard < count * 8) {
    let progressed = false;
    for (const id of TOPIC_ORDER) {
      const bucket = buckets.get(id);
      const next = bucket?.shift();
      if (next) {
        picked.push(next);
        progressed = true;
        if (picked.length >= count) break;
      }
    }
    if (!progressed) break;
    guard += 1;
  }
  return shuffle(picked, rng);
}

export function mergeAnimals(
  list: readonly AnimalInst[],
  speciesId: string,
  stars: 1 | 2,
  makeUid: () => string,
): { list: AnimalInst[]; created: AnimalInst | null } {
  const matches = list.filter((item) => item.speciesId === speciesId && item.stars === stars);
  if (matches.length < 3) return { list: [...list], created: null };
  const remove = new Set(matches.slice(0, 3).map((item) => item.uid));
  const created: AnimalInst = {
    uid: makeUid(),
    speciesId,
    stars: (stars + 1) as 2 | 3,
  };
  return {
    list: [...list.filter((item) => !remove.has(item.uid)), created],
    created,
  };
}

export function newUid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `a${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
