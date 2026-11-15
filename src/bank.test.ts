import { describe, expect, it } from 'vitest';
import { POOL_WEIGHTS, PULL_COST, RARITY_LABEL, SPECIES, TEN_PULL_COST, TEN_PULL_COUNT, animalSvg, rollRarity, rollSpecies } from './animals';
import { boardCoins, isCorrect, mergeAnimals, pickQuestions, soloCoins } from './logic';
import { QUESTIONS, bankStats } from './questions';
import type { Question } from './types';

const BANNED = '个门国这时过对会发电气车动还让进选头万与应来开关种后为体学东长风鱼鸟鸡鸭龙马贝见认请说话谢欢园远边连运医药伤护节号听热从习经现问题标签么儿两'.split('');

function byId(id: string): Question {
  const found = QUESTIONS.find((item) => item.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
}

function correctTexts(id: string): string[] {
  const question = byId(id);
  return question.answer.map((answerId) => {
    const choice = question.options.find((item) => item.id === answerId);
    if (!choice) throw new Error(`${id} missing choice ${answerId}`);
    return choice.text;
  });
}

describe('question bank', () => {
  it('has 80 unique playable questions across four topics', () => {
    expect(bankStats()).toEqual({
      total: 80,
      byTopic: { firstaid: 22, rescue: 20, energy: 18, force: 20 },
      byType: { mc: 53, tf: 12, multi: 15 },
      byTopicType: {
        'firstaid:mc': 14,
        'firstaid:tf': 4,
        'firstaid:multi': 4,
        'rescue:mc': 12,
        'rescue:tf': 3,
        'rescue:multi': 5,
        'energy:mc': 13,
        'energy:tf': 2,
        'energy:multi': 3,
        'force:mc': 14,
        'force:tf': 3,
        'force:multi': 3,
      },
    });
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(60);
  });

  it('rejects duplicates, broken answers, and simplified characters', () => {
    const ids = new Set<string>();
    const prompts = new Set<string>();
    const topics = new Set<string>();
    for (const question of QUESTIONS) {
      expect(ids.has(question.id), question.id).toBe(false);
      ids.add(question.id);
      const promptKey = question.prompt.replace(/\s+/g, '');
      expect(prompts.has(promptKey), question.prompt).toBe(false);
      prompts.add(promptKey);
      topics.add(question.topic);
      expect(question.explain.trim().length).toBeGreaterThan(8);
      expect(question.options.length).toBeGreaterThanOrEqual(2);
      const optionIds = question.options.map((item) => item.id);
      expect(new Set(optionIds).size).toBe(optionIds.length);
      expect(new Set(question.options.map((item) => item.text)).size).toBe(question.options.length);
      expect(question.answer.length).toBeGreaterThan(0);
      for (const answerId of question.answer) expect(optionIds).toContain(answerId);
      if (question.type === 'multi') {
        expect(question.answer.length).toBeGreaterThanOrEqual(2);
        expect(question.options.length).toBeGreaterThan(question.answer.length);
      } else {
        expect(question.answer).toHaveLength(1);
      }
      if (question.type === 'tf') {
        expect(question.options.map((item) => item.text)).toEqual(['正確', '錯誤']);
      }
      const blob = `${question.prompt}${question.explain}${question.options.map((item) => item.text).join('')}`;
      for (const ch of BANNED) expect(blob.includes(ch), `${question.id} has ${ch}`).toBe(false);
    }
    expect([...topics].sort()).toEqual(['energy', 'firstaid', 'force', 'rescue']);
  });

  it('keeps the teacher items scientifically correct', () => {
    expect(correctTexts('fa01')).toEqual(['用大量流動冷水沖洗至少十分鐘']);
    expect(correctTexts('fa02')).toEqual(['立即處理，防止傷勢惡化', '促進傷口癒合', '保存傷者性命']);
    expect(byId('fa02').options.map((item) => item.text)).toContain('保存傷者的名字');
    expect(correctTexts('fa02')).not.toContain('保存傷者的名字');
    expect(correctTexts('en01')).toEqual(['電器的能源效益等級']);
    expect(correctTexts('en02')).toEqual(['浪費的能量轉換較少，較慳電，也可減少電費']);
    expect(correctTexts('rs01')).toEqual(['開燈', '開啟抽氣扇', '按門鈴', '點燃火柴或打火機查看']);
    expect(correctTexts('rs02')).toEqual(['走到戶外安全的地方，再致電 999']);
    expect(correctTexts('fo01')).toEqual(['光合作用的力']);
    expect(correctTexts('rs14')).toEqual(['香港紅十字會', '醫療輔助隊', '民眾安全服務隊']);
    expect(correctTexts('rs14')).not.toContain('世界宣明會');
    expect(correctTexts('en15')).toEqual(['動能，讓單車前進', '光能，用來照明']);
    expect(correctTexts('en16')).toEqual(['浪費的能量']);
    expect(correctTexts('fo13')).toEqual(['動能轉換成熱能，也會有少量聲能']);
    expect(correctTexts('fo14')).toEqual(['煞車產生的摩擦力']);
    expect(correctTexts('fo09')).toEqual(['增加摩擦，防止滑倒']);
    expect(correctTexts('fo10')).toEqual(['摩擦力']);
    expect(correctTexts('fo07')).toEqual([
      '摩擦力會阻礙物體運動',
      '表面愈粗糙，摩擦力愈大',
      '摩擦力愈大，滑行距離通常愈短',
    ]);
    expect(byId('fo07').options.map((item) => item.text)).toContain('物體互相接觸就不會產生摩擦力');
  });
});

describe('rules', () => {
  it('grades multi-select independent of order', () => {
    const question = byId('fa02');
    expect(isCorrect(question, [...question.answer].reverse())).toBe(true);
    expect(isCorrect(question, question.answer.slice(0, 2))).toBe(false);
    expect(isCorrect(question, [...question.answer, 'a'])).toBe(false);
  });

  it('pays more for a fast correct whiteboard answer', () => {
    expect(boardCoins(0, 30000, true)).toBeGreaterThan(boardCoins(20000, 30000, true));
    expect(boardCoins(20000, 30000, true)).toBeGreaterThan(0);
    expect(boardCoins(1000, 30000, false)).toBe(0);
    expect(soloCoins(true, false)).toBe(10);
    expect(soloCoins(true, true)).toBe(5);
    expect(soloCoins(false, false)).toBe(0);
  });

  it('picks a mixed round without duplicate questions', () => {
    const mixed = pickQuestions(QUESTIONS, 'mix', 10, () => 0.2);
    expect(new Set(mixed.map((item) => item.id)).size).toBe(10);
    expect(new Set(mixed.map((item) => item.topic)).size).toBe(4);
    expect(pickQuestions(QUESTIONS, 'force', 10).every((item) => item.topic === 'force')).toBe(true);
  });

  it('merges three identical stars and stops at three stars', () => {
    const ones = [1, 2, 3, 4, 5, 6].map((id) => ({ uid: String(id), speciesId: 'chick', stars: 1 as const }));
    const step = mergeAnimals(ones, 'chick', 1, () => 'two');
    expect(step.created).toEqual({ uid: 'two', speciesId: 'chick', stars: 2 });
    expect(step.list.filter((item) => item.stars === 1)).toHaveLength(3);
    const twos = [1, 2, 3].map((id) => ({ uid: `t${id}`, speciesId: 'chick', stars: 2 as const }));
    twos.push({ uid: 'keep', speciesId: 'rabbit', stars: 2 });
    const up = mergeAnimals(twos, 'chick', 2, () => 'three');
    expect(up.created).toEqual({ uid: 'three', speciesId: 'chick', stars: 3 });
    expect(up.list.map((item) => item.uid).sort()).toEqual(['keep', 'three']);
    expect(mergeAnimals(twos.slice(0, 2), 'chick', 2, () => 'no').created).toBeNull();
  });

  it('draws original animals across three rarities', () => {
    expect(SPECIES.length).toBeGreaterThanOrEqual(18);
    expect(new Set(SPECIES.map((item) => item.id)).size).toBe(SPECIES.length);
    expect(new Set(SPECIES.map((item) => item.name)).size).toBe(SPECIES.length);
    expect(new Set(SPECIES.map((item) => item.totem)).size).toBe(SPECIES.length);
    for (const rarity of ['common', 'rare', 'super'] as const) {
      expect(SPECIES.filter((item) => item.rarity === rarity).length).toBeGreaterThanOrEqual(5);
      expect(RARITY_LABEL[rarity].length).toBeGreaterThan(0);
    }
    for (const species of SPECIES) {
      const svg = animalSvg(species);
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('translate(166,42)');
      expect(svg).not.toContain('©');
    }
    expect(POOL_WEIGHTS).toEqual({ common: 70, rare: 20, super: 10 });
    expect(PULL_COST).toBe(10);
    expect(TEN_PULL_COST).toBe(100);
    expect(TEN_PULL_COUNT).toBe(11);
    expect(rollRarity(POOL_WEIGHTS, () => 0)).toBe('common');
    expect(rollRarity(POOL_WEIGHTS, () => 0.75)).toBe('rare');
    expect(rollRarity(POOL_WEIGHTS, () => 0.95)).toBe('super');
    const pulled = rollSpecies(() => 0.99);
    expect(pulled.rarity).toBe('super');
  });
});
