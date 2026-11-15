import { SPECIES } from './animals';

export interface PetCare {
  speciesId: string;
  /** 0 餓，100 飽。 */
  hunger: number;
  mood: number;
  affection: number;
  cleanliness: number;
  x: number;
  z: number;
  rot: number;
  updatedAt: number;
  /** 照顧得好之後會一直留著的小變化，不會因為沒登入而消失。 */
  friend: boolean;
}

export interface PastureData {
  placed: string[];
  pets: PetCare[];
}

const HOUR = 60 * 60 * 1000;
const MAX_GAP_HOURS = 8;

export function emptyPasture(): PastureData {
  return { placed: [], pets: [] };
}

export function clampStat(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function known(id: string): boolean {
  return SPECIES.some((item) => item.id === id);
}

export function defaultPet(speciesId: string, index: number, now: number): PetCare {
  const spots = [
    { x: -1.4, z: 0.2 },
    { x: 0.1, z: 0.9 },
    { x: 1.5, z: 0.15 },
  ];
  const spot = spots[index] ?? { x: 0, z: 0.4 };
  return {
    speciesId,
    hunger: 70,
    mood: 70,
    affection: 20,
    cleanliness: 70,
    x: spot.x,
    z: spot.z,
    rot: 0,
    updatedAt: now,
    friend: false,
  };
}

/** Gentle decay. A long absence only counts as eight hours, and affection never drops. */
export function tickPet(pet: PetCare, now: number): PetCare {
  const hours = Math.min(MAX_GAP_HOURS, Math.max(0, (now - pet.updatedAt) / HOUR));
  return {
    ...pet,
    hunger: clampStat(Math.max(20, pet.hunger - hours * 6)),
    cleanliness: clampStat(Math.max(20, pet.cleanliness - hours * 4)),
    mood: clampStat(Math.max(25, pet.mood - hours * 3)),
    updatedAt: now,
  };
}

export type CareAction = 'feed' | 'pet' | 'clean';

export function applyCare(pet: PetCare, action: CareAction, now: number): { pet: PetCare; celebrated: boolean } {
  const ticked = tickPet(pet, now);
  const next: PetCare = { ...ticked, updatedAt: now };
  if (action === 'feed') {
    next.hunger = clampStat(next.hunger + 35);
    next.mood = clampStat(next.mood + 8);
  } else if (action === 'pet') {
    next.affection = clampStat(next.affection + 8);
    next.mood = clampStat(next.mood + 10);
  } else {
    next.cleanliness = clampStat(next.cleanliness + 40);
    next.mood = clampStat(next.mood + 8);
  }
  const ready = next.affection >= 80 && next.mood >= 70 && next.hunger >= 60 && next.cleanliness >= 60;
  const celebrated = ready && !next.friend;
  if (ready) next.friend = true;
  return { pet: next, celebrated };
}

export function togglePlacement(placed: readonly string[], speciesId: string, owned: boolean): string[] {
  if (!owned || !known(speciesId)) return [...placed];
  if (placed.includes(speciesId)) return placed.filter((id) => id !== speciesId);
  if (placed.length >= 3) return [...placed];
  return [...placed, speciesId];
}

export function normalizePasture(raw: unknown, ownedIds: ReadonlySet<string>, now: number): PastureData {
  if (!raw || typeof raw !== 'object') return emptyPasture();
  const data = raw as Partial<PastureData>;
  const pets: PetCare[] = [];
  if (Array.isArray(data.pets)) {
    for (const item of data.pets) {
      if (!item || typeof item !== 'object') continue;
      const pet = item as Partial<PetCare>;
      if (typeof pet.speciesId !== 'string' || !known(pet.speciesId)) continue;
      pets.push({
        speciesId: pet.speciesId,
        hunger: clampStat(Number(pet.hunger) || 0),
        mood: clampStat(Number(pet.mood) || 0),
        affection: clampStat(Number(pet.affection) || 0),
        cleanliness: clampStat(Number(pet.cleanliness) || 0),
        x: Number.isFinite(pet.x) ? Number(pet.x) : 0,
        z: Number.isFinite(pet.z) ? Number(pet.z) : 0,
        rot: Number.isFinite(pet.rot) ? Number(pet.rot) : 0,
        updatedAt: Number.isFinite(pet.updatedAt) ? Number(pet.updatedAt) : now,
        friend: pet.friend === true,
      });
    }
  }
  const placed = Array.isArray(data.placed)
    ? data.placed.filter((id): id is string => typeof id === 'string' && ownedIds.has(id) && known(id)).slice(0, 3)
    : [];
  return { placed, pets };
}

export function mergePasture(local: PastureData, cloud: PastureData, ownedIds: ReadonlySet<string>): PastureData {
  const byId = new Map<string, PetCare>();
  for (const pet of [...cloud.pets, ...local.pets]) {
    const previous = byId.get(pet.speciesId);
    if (!previous) {
      byId.set(pet.speciesId, { ...pet });
      continue;
    }
    const newer = pet.updatedAt >= previous.updatedAt ? pet : previous;
    byId.set(pet.speciesId, {
      ...newer,
      hunger: Math.max(previous.hunger, pet.hunger),
      mood: Math.max(previous.mood, pet.mood),
      affection: Math.max(previous.affection, pet.affection),
      cleanliness: Math.max(previous.cleanliness, pet.cleanliness),
      friend: previous.friend || pet.friend,
    });
  }
  const preferred = local.placed.length > 0 ? local.placed : cloud.placed;
  return {
    placed: preferred.filter((id) => ownedIds.has(id)).slice(0, 3),
    pets: [...byId.values()],
  };
}

export function ensurePlacedPets(pasture: PastureData, now: number): PetCare[] {
  return pasture.placed.map((speciesId, index) => {
    const existing = pasture.pets.find((pet) => pet.speciesId === speciesId);
    return tickPet(existing ?? defaultPet(speciesId, index, now), now);
  });
}
