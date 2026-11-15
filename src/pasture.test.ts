import { describe, expect, it } from 'vitest';
import { applyCare, defaultPet, mergePasture, tickPet, togglePlacement } from './pasture';

describe('pasture care', () => {
  it('does not place an uncollected animal and stops at three', () => {
    expect(togglePlacement([], 'chick', false)).toEqual([]);
    const three = togglePlacement(togglePlacement(togglePlacement([], 'chick', true), 'rabbit', true), 'duck', true);
    expect(togglePlacement(three, 'fox', true)).toEqual(three);
    expect(togglePlacement(three, 'chick', true)).toEqual(['rabbit', 'duck']);
  });

  it('decays gently and never lowers affection', () => {
    const pet = { ...defaultPet('chick', 0, 0), hunger: 100, affection: 40, friend: true };
    const later = tickPet(pet, 48 * 60 * 60 * 1000);
    expect(later.hunger).toBeGreaterThan(40);
    expect(later.affection).toBe(40);
    expect(later.friend).toBe(true);
  });

  it('celebrates good care without being a coin action', () => {
    let pet = { ...defaultPet('rabbit', 1, 1_000), affection: 76, mood: 70, hunger: 80, cleanliness: 80 };
    const first = applyCare(pet, 'pet', 1_000);
    expect(first.celebrated).toBe(true);
    expect(first.pet.friend).toBe(true);
    expect(first.pet.affection).toBeGreaterThan(pet.affection);
    const again = applyCare(first.pet, 'feed', 2_000);
    expect(again.celebrated).toBe(false);
    expect(again.pet.hunger).toBeGreaterThan(first.pet.hunger);
  });

  it('keeps the richer care state when accounts merge', () => {
    const local = {
      placed: ['chick'],
      pets: [{ ...defaultPet('chick', 0, 50), affection: 30, hunger: 40 }],
    };
    const cloud = {
      placed: ['fox'],
      pets: [{ ...defaultPet('chick', 0, 10), affection: 90, hunger: 80, friend: true }],
    };
    const merged = mergePasture(local, cloud, new Set(['chick', 'fox']));
    expect(merged.placed).toEqual(['chick']);
    expect(merged.pets[0]?.affection).toBe(90);
    expect(merged.pets[0]?.hunger).toBe(80);
    expect(merged.pets[0]?.friend).toBe(true);
  });
});
