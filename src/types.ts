export type TopicId = 'firstaid' | 'rescue' | 'energy' | 'force';
export type QType = 'mc' | 'tf' | 'multi';

export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  topic: TopicId;
  type: QType;
  prompt: string;
  options: Choice[];
  /** Correct choice ids. Multi-select has more than one. */
  answer: string[];
  explain: string;
}

export const TOPIC_ORDER: TopicId[] = ['firstaid', 'rescue', 'energy', 'force'];

export const TOPIC_LABEL: Record<TopicId, string> = {
  firstaid: '急救箱與簡易急救',
  rescue: '危機與救援',
  energy: '能量的形式與轉換',
  force: '力與摩擦力',
};

export const TOPIC_SHORT: Record<TopicId, string> = {
  firstaid: '簡易急救',
  rescue: '危機救援',
  energy: '能量',
  force: '力與摩擦',
};
