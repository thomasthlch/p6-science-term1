import {
  PULL_COST,
  RARITY_LABEL,
  SPECIES,
  TEN_PULL_COST,
  TEN_PULL_COUNT,
  animalSvg,
  eggSvg,
  rollSpecies,
  speciesById,
  type Rarity,
  type Species,
} from './animals';
import { authErrorText, finishRedirectSignIn, loadCloudSave, saveCloudSave, signInGoogle, signOutGoogle, watchAuth } from './cloud';
import {
  BOARD_LIMIT_MS,
  BOARD_ROUND,
  SOLO_FIRST_COINS,
  SOLO_RETRY_COINS,
  SOLO_ROUND,
  boardCoins,
  isCorrect,
  mergeAnimals,
  newUid,
  pickQuestions,
  shuffle,
  soloCoins,
  type AnimalInst,
  type Star,
} from './logic';
import { QUESTIONS } from './questions';
import { emptySave, loadSave, mergeSaves, writeSave, type SaveData } from './storage';
import { TOPIC_LABEL, TOPIC_ORDER, type Choice, type Question, type TopicId } from './types';

type RouteName = 'home' | 'solo' | 'board' | 'farm' | 'gacha';
type TopicPick = TopicId | 'mix';
type FarmFilter = 'all' | 'owned' | 'missing' | Rarity;

interface SoloState {
  name: string;
  topic: TopicPick;
  queue: Question[];
  cursor: number;
  presented: Choice[];
  picked: string[];
  phase: 'answer' | 'explain' | 'summary';
  retrying: boolean;
  missed: Question[];
  correctCount: number;
  totalCount: number;
  coins: number;
  lastCorrect: boolean;
  note: string;
  roundCounted: boolean;
}

interface BoardPlayer {
  name: string;
  picked: string[];
  locked: boolean;
  correct: boolean | null;
  elapsedMs: number | null;
  gained: number;
  total: number;
}

interface BoardState {
  phase: 'answer' | 'explain' | 'done';
  topic: TopicPick;
  questions: Question[];
  index: number;
  presented: Choice[];
  players: [BoardPlayer, BoardPlayer, BoardPlayer];
  startedAt: number;
}

interface AnimalModal {
  kind: 'animal';
  speciesId: string;
  stars: Star;
  banner?: string;
}

interface ResetModal {
  kind: 'reset';
}

interface HatchState {
  phase: 'wobble' | 'reveal';
  pulls: Species[];
}

interface Account {
  uid: string;
  name: string;
  preview?: boolean;
}

type SyncState = 'local' | 'saving' | 'synced' | 'error';

const COL_NAME = ['同學一', '同學二', '同學三'] as const;

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    if (ch === '&') return '&amp;';
    if (ch === '<') return '&lt;';
    if (ch === '>') return '&gt;';
    if (ch === '"') return '&quot;';
    return '&#39;';
  });
}

function parseHash(hash: string): RouteName {
  const path = hash.replace(/^#/, '') || '/';
  if (path.startsWith('/board')) return 'board';
  if (path.startsWith('/solo')) return 'solo';
  if (path.startsWith('/farm')) return 'farm';
  if (path.startsWith('/gacha')) return 'gacha';
  return 'home';
}

function cleanName(raw: string, fallback: string): string {
  const text = raw.replace(/\s+/g, '').slice(0, 8);
  return text || fallback;
}

function letter(index: number): string {
  return 'ABCDE'[index] ?? '';
}

function topicName(topic: TopicPick): string {
  return topic === 'mix' ? '混合溫習' : TOPIC_LABEL[topic];
}

function starGlyph(stars: number): string {
  const filled = Math.max(0, Math.min(3, stars));
  return `${'★'.repeat(filled)}${'☆'.repeat(3 - filled)}`;
}

function starWord(stars: number): string {
  if (stars === 1) return '一星';
  if (stars === 2) return '二星';
  return '三星';
}

function coinSvg(): string {
  return `<svg class="coin-svg" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="#f6c445" stroke="#a86b12" stroke-width="2"/><text x="16" y="21" text-anchor="middle" font-size="13" font-weight="700" fill="#7a4b0d">科</text></svg>`;
}

function bucketsFor(animals: AnimalInst[], speciesId: string): Record<Star, AnimalInst[]> {
  const buckets: Record<Star, AnimalInst[]> = { 1: [], 2: [], 3: [] };
  for (const item of animals) {
    if (item.speciesId === speciesId) buckets[item.stars].push(item);
  }
  return buckets;
}

export function startApp(root: HTMLElement): void {
  const app = new App(root);
  app.start();
}

class App {
  private save: SaveData;
  private route: RouteName;
  private solo: SoloState | null = null;
  private board: BoardState | null = null;
  private soloTopic: TopicPick = 'mix';
  private soloName = '';
  private boardTopic: TopicPick = 'mix';
  private boardCount = BOARD_ROUND;
  private boardNames: [string, string, string] = ['', '', ''];
  private farmFilter: FarmFilter = 'all';
  private modal: AnimalModal | ResetModal | null = null;
  private hatch: HatchState | null = null;
  private timer: number | null = null;
  private hatchTimer: number | null = null;
  private renderedCoins = -1;
  private account: Account | null = null;
  private hadAccount = false;
  private syncState: SyncState = 'local';
  private authError = '';
  private authBusy = false;
  private cloudTimer: number | null = null;

  constructor(private root: HTMLElement) {
    this.save = loadSave();
    this.route = parseHash(location.hash);
  }

  start(): void {
    this.root.addEventListener('click', this.onClick);
    this.root.addEventListener('pointerdown', this.onPointerDown);
    this.root.addEventListener('input', this.onInput);
    this.root.addEventListener('contextmenu', this.onContextMenu);
    window.addEventListener('hashchange', this.onHash);
    this.applyPreviewAccount();
    void finishRedirectSignIn();
    watchAuth((user) => {
      void this.onAuth(user);
    });
    this.render();
  }

  private onHash = (): void => {
    const next = parseHash(location.hash);
    if (next === this.route) return;
    this.clearTimer();
    this.clearHatchTimer();
    this.solo = null;
    this.board = null;
    this.hatch = null;
    this.modal = null;
    this.route = next;
    this.render();
  };

  private onContextMenu = (event: Event): void => {
    if (document.body.classList.contains('mode-board')) event.preventDefault();
  };

  private onInput = (event: Event): void => {
    const input = event.target as HTMLInputElement | null;
    if (!input || input.tagName !== 'INPUT') return;
    const field = input.dataset.field;
    if (field === 'solo-name') this.soloName = input.value;
    if (field === 'board-name') {
      const index = Number(input.dataset.index);
      if (index === 0 || index === 1 || index === 2) this.boardNames[index] = input.value;
    }
  };

  private onClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const actionEl = target.closest<HTMLElement>('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    if (action === 'close-modal') {
      const inside = target.closest('[data-modal-card]');
      const closer = target.closest('[data-close]');
      if (inside && !closer) return;
      this.modal = null;
      this.render();
      return;
    }
    if (action === 'go-home') this.go('home');
    else if (action === 'go-solo') this.go('solo');
    else if (action === 'go-board') this.go('board');
    else if (action === 'go-farm') this.go('farm');
    else if (action === 'go-gacha') this.go('gacha');
    else if (action === 'topic-solo') this.setTopic('solo', actionEl.dataset.topic);
    else if (action === 'topic-board') this.setTopic('board', actionEl.dataset.topic);
    else if (action === 'board-count') {
      const count = Number(actionEl.dataset.count);
      if (count === 6 || count === 8 || count === 10) {
        this.boardCount = count;
        this.render();
      }
    } else if (action === 'start-solo') this.startSolo();
    else if (action === 'start-board') this.startBoard();
    else if (action === 'solo-opt') this.chooseSolo(actionEl.dataset.opt ?? '');
    else if (action === 'solo-submit') this.submitSolo();
    else if (action === 'solo-next') this.nextSolo();
    else if (action === 'solo-retry') this.retrySolo();
    else if (action === 'solo-again') this.startSolo();
    else if (action === 'board-next') this.nextBoard();
    else if (action === 'farm-filter') {
      const filter = actionEl.dataset.filter as FarmFilter | undefined;
      if (filter) {
        this.farmFilter = filter;
        this.render();
      }
    } else if (action === 'open-animal') this.openAnimal(actionEl.dataset.species ?? '');
    else if (action === 'merge') this.merge(actionEl.dataset.species ?? '', Number(actionEl.dataset.stars));
    else if (action === 'ask-reset') {
      this.modal = { kind: 'reset' };
      this.render();
    } else if (action === 'reset-yes') {
      this.save = emptySave();
      this.persist();
      this.modal = null;
      this.render();
    } else if (action === 'pull-one') void this.buyPull('single');
    else if (action === 'pull-ten') void this.buyPull('ten');
    else if (action === 'sign-in') void this.signIn();
    else if (action === 'sign-out') void this.signOutAccount();
    else if (action === 'close-hatch') {
      this.hatch = null;
      this.render();
    }
  };

  private onPointerDown = (event: PointerEvent): void => {
    if (this.route !== 'board' || !this.board || this.board.phase !== 'answer') return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const opt = target.closest<HTMLElement>('[data-board-opt]');
    const lock = target.closest<HTMLElement>('[data-board-lock]');
    if (!opt && !lock) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    if (opt) this.onBoardOpt(opt);
    else if (lock) this.onBoardLock(lock);
  };

  private go(route: RouteName): void {
    this.clearTimer();
    this.clearHatchTimer();
    if (route !== 'solo') this.solo = null;
    if (route !== 'board') this.board = null;
    if (route !== 'gacha') this.hatch = null;
    this.modal = null;
    this.route = route;
    const hash = route === 'home' ? '#/' : `#/${route}`;
    if (location.hash !== hash) location.hash = hash;
    this.render();
  }

  private setTopic(which: 'solo' | 'board', raw: string | undefined): void {
    const topic = raw === 'mix' || raw === 'firstaid' || raw === 'rescue' || raw === 'energy' || raw === 'force' ? raw : null;
    if (!topic) return;
    if (which === 'solo') this.soloTopic = topic;
    else this.boardTopic = topic;
    this.render();
  }

  private startSolo(): void {
    const queue = pickQuestions(QUESTIONS, this.soloTopic, SOLO_ROUND);
    const first = queue[0];
    if (!first) return;
    this.solo = {
      name: cleanName(this.soloName, '小科學家'),
      topic: this.soloTopic,
      queue,
      cursor: 0,
      presented: shuffle(first.options),
      picked: [],
      phase: 'answer',
      retrying: false,
      missed: [],
      correctCount: 0,
      totalCount: 0,
      coins: 0,
      lastCorrect: false,
      note: '',
      roundCounted: false,
    };
    this.route = 'solo';
    if (location.hash !== '#/solo') location.hash = '#/solo';
    this.render();
  }

  private chooseSolo(id: string): void {
    const solo = this.solo;
    if (!solo || solo.phase !== 'answer' || !id) return;
    const question = solo.queue[solo.cursor];
    if (!question) return;
    if (question.type === 'multi') {
      solo.picked = solo.picked.includes(id) ? solo.picked.filter((item) => item !== id) : [...solo.picked, id];
      solo.note = '';
      this.render();
      return;
    }
    solo.picked = [id];
    this.revealSolo();
  }

  private submitSolo(): void {
    const solo = this.solo;
    if (!solo || solo.phase !== 'answer') return;
    if (solo.picked.length === 0) {
      solo.note = '請先選出答案';
      this.render();
      return;
    }
    this.revealSolo();
  }

  private revealSolo(): void {
    const solo = this.solo;
    if (!solo || solo.phase !== 'answer') return;
    const question = solo.queue[solo.cursor];
    if (!question) return;
    const correct = isCorrect(question, solo.picked);
    const gain = soloCoins(correct, solo.retrying);
    solo.lastCorrect = correct;
    solo.totalCount += 1;
    solo.coins += gain;
    solo.phase = 'explain';
    if (correct) {
      solo.correctCount += 1;
      if (!this.save.solo.mastered.includes(question.id)) {
        this.save.solo.mastered = [...this.save.solo.mastered, question.id];
      }
    } else solo.missed.push(question);
    this.save.coins += gain;
    this.save.stats.answered += 1;
    if (correct) this.save.stats.correct += 1;
    this.persist();
    this.render();
  }

  private nextSolo(): void {
    const solo = this.solo;
    if (!solo || solo.phase !== 'explain') return;
    solo.cursor += 1;
    const next = solo.queue[solo.cursor];
    if (!next) {
      if (!solo.retrying && !solo.roundCounted) {
        this.save.solo.rounds += 1;
        solo.roundCounted = true;
        this.persist();
      }
      solo.phase = 'summary';
      this.render();
      return;
    }
    solo.presented = shuffle(next.options);
    solo.picked = [];
    solo.note = '';
    solo.phase = 'answer';
    this.render();
  }

  private retrySolo(): void {
    const solo = this.solo;
    if (!solo || solo.missed.length === 0) return;
    const queue = shuffle(solo.missed);
    const first = queue[0];
    if (!first) return;
    solo.queue = queue;
    solo.missed = [];
    solo.cursor = 0;
    solo.retrying = true;
    solo.presented = shuffle(first.options);
    solo.picked = [];
    solo.note = '';
    solo.phase = 'answer';
    this.render();
  }

  private startBoard(): void {
    const questions = pickQuestions(QUESTIONS, this.boardTopic, this.boardCount);
    const first = questions[0];
    if (!first) return;
    const makePlayer = (index: 0 | 1 | 2): BoardPlayer => ({
      name: cleanName(this.boardNames[index] ?? '', COL_NAME[index]),
      picked: [],
      locked: false,
      correct: null,
      elapsedMs: null,
      gained: 0,
      total: 0,
    });
    const players: [BoardPlayer, BoardPlayer, BoardPlayer] = [makePlayer(0), makePlayer(1), makePlayer(2)];
    this.board = {
      phase: 'answer',
      topic: this.boardTopic,
      questions,
      index: 0,
      presented: shuffle(first.options),
      players,
      startedAt: Date.now(),
    };
    this.route = 'board';
    if (location.hash !== '#/board') location.hash = '#/board';
    this.render();
    this.armTimer();
  }

  private armTimer(): void {
    this.clearTimer();
    this.timer = window.setInterval(() => this.tick(), 100);
  }

  private tick(): void {
    const board = this.board;
    if (!board || board.phase !== 'answer') return;
    const left = BOARD_LIMIT_MS - (Date.now() - board.startedAt);
    const sec = Math.max(0, Math.ceil(left / 1000));
    const label = this.root.querySelector('[data-timer]');
    if (label) label.textContent = String(sec);
    const ring = this.root.querySelector<SVGCircleElement>('[data-timer-ring]');
    if (ring) {
      const ratio = Math.max(0, Math.min(1, left / BOARD_LIMIT_MS));
      ring.style.strokeDashoffset = String((1 - ratio) * 100);
    }
    this.root.querySelector('.timer')?.classList.toggle('urgent', sec <= 5);
    if (left <= 0) this.finishBoard();
  }

  private onBoardOpt(opt: HTMLElement): void {
    const board = this.board;
    if (!board || board.phase !== 'answer') return;
    const column = opt.closest<HTMLElement>('[data-col]');
    const col = Number(column?.dataset.col);
    const id = opt.dataset.boardOpt ?? '';
    const player = board.players[col];
    const question = board.questions[board.index];
    if (!player || player.locked || !question || !id) return;
    if (question.type === 'multi') {
      player.picked = player.picked.includes(id) ? player.picked.filter((item) => item !== id) : [...player.picked, id];
      this.paintColumn(col);
      return;
    }
    player.picked = [id];
    this.lockPlayer(col);
  }

  private onBoardLock(lock: HTMLElement): void {
    const board = this.board;
    if (!board || board.phase !== 'answer') return;
    const col = Number(lock.dataset.boardLock);
    const player = board.players[col];
    if (!player || player.locked) return;
    if (player.picked.length === 0) {
      const note = this.root.querySelector(`[data-col="${col}"] .col-note`);
      if (note) note.textContent = '先選答案，再按確定';
      return;
    }
    this.lockPlayer(col);
  }

  private lockPlayer(col: number): void {
    const board = this.board;
    const player = board?.players[col];
    if (!board || !player || player.locked || board.phase !== 'answer') return;
    player.locked = true;
    player.elapsedMs = Date.now() - board.startedAt;
    this.paintColumn(col);
    if (board.players.every((item) => item.locked)) this.finishBoard();
  }

  private paintColumn(col: number): void {
    const board = this.board;
    const player = board?.players[col];
    const column = this.root.querySelector<HTMLElement>(`[data-col="${col}"]`);
    if (!board || !player || !column) return;
    column.querySelectorAll<HTMLButtonElement>('[data-board-opt]').forEach((button) => {
      const on = player.picked.includes(button.dataset.boardOpt ?? '');
      button.classList.toggle('on', on);
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
      button.disabled = player.locked;
    });
    const lock = column.querySelector<HTMLButtonElement>('[data-board-lock]');
    if (lock) lock.disabled = player.locked;
    let ribbon = column.querySelector('.ribbon');
    if (player.locked && !ribbon) {
      ribbon = document.createElement('span');
      ribbon.className = 'ribbon';
      ribbon.textContent = '已作答';
      column.querySelector('.col-h')?.appendChild(ribbon);
    }
    const note = column.querySelector('.col-note');
    if (note && player.locked) note.textContent = '';
  }

  private finishBoard(): void {
    const board = this.board;
    if (!board || board.phase !== 'answer') return;
    board.phase = 'explain';
    this.clearTimer();
    const question = board.questions[board.index];
    if (!question) return;
    for (const player of board.players) {
      if (!player.locked) {
        player.locked = true;
        player.elapsedMs = BOARD_LIMIT_MS;
      }
      const correct = isCorrect(question, player.picked);
      player.correct = correct;
      const gain = boardCoins(player.elapsedMs ?? BOARD_LIMIT_MS, BOARD_LIMIT_MS, correct);
      player.gained = gain;
      player.total += gain;
      this.save.coins += gain;
      this.save.stats.answered += 1;
      if (correct) this.save.stats.correct += 1;
    }
    this.persist();
    this.render();
  }

  private nextBoard(): void {
    const board = this.board;
    if (!board || board.phase !== 'explain') return;
    board.index += 1;
    const question = board.questions[board.index];
    if (!question) {
      board.phase = 'done';
      this.render();
      return;
    }
    board.presented = shuffle(question.options);
    board.phase = 'answer';
    board.startedAt = Date.now();
    for (const player of board.players) {
      player.picked = [];
      player.locked = false;
      player.correct = null;
      player.elapsedMs = null;
      player.gained = 0;
    }
    this.render();
    this.armTimer();
  }

  private openAnimal(speciesId: string): void {
    const species = speciesById(speciesId);
    if (!species) return;
    const owned = this.save.animals.filter((item) => item.speciesId === speciesId);
    const best = owned.reduce<Star>((max, item) => (item.stars > max ? item.stars : max), 1);
    this.modal = { kind: 'animal', speciesId, stars: owned.length ? best : 1 };
    this.render();
  }

  private merge(speciesId: string, stars: number): void {
    if (stars !== 1 && stars !== 2) return;
    const result = mergeAnimals(this.save.animals, speciesId, stars, newUid);
    if (!result.created) return;
    this.save.animals = result.list;
    this.save.stats.merges += 1;
    this.persist();
    this.modal = {
      kind: 'animal',
      speciesId,
      stars: result.created.stars,
      banner: `合成成功！3 隻${starWord(stars)}變成了 1 隻${starWord(result.created.stars)}。`,
    };
    this.render();
  }

  private buyPull(kind: 'single' | 'ten'): void {
    if (this.hatch) return;
    const cost = kind === 'single' ? PULL_COST : TEN_PULL_COST;
    const count = kind === 'single' ? 1 : TEN_PULL_COUNT;
    if (this.save.coins < cost) return;
    const pulls: Species[] = [];
    this.save.coins -= cost;
    for (let index = 0; index < count; index += 1) {
      const species = rollSpecies();
      pulls.push(species);
      this.save.animals.push({ uid: newUid(), speciesId: species.id, stars: 1 });
    }
    this.save.stats.pulls += count;
    this.persist();
    this.hatch = { phase: 'wobble', pulls };
    this.render();
    this.clearHatchTimer();
    this.hatchTimer = window.setTimeout(() => {
      if (!this.hatch) return;
      this.hatch.phase = 'reveal';
      this.render();
    }, 1100);
  }

  private persist(): void {
    writeSave(this.save);
    this.scheduleCloud();
  }

  private scheduleCloud(): void {
    if (!this.account || this.account.preview) return;
    this.syncState = 'saving';
    if (this.cloudTimer !== null) window.clearTimeout(this.cloudTimer);
    this.cloudTimer = window.setTimeout(() => {
      void this.pushCloud();
    }, 400);
  }

  private async pushCloud(): Promise<void> {
    const account = this.account;
    if (!account || account.preview) return;
    try {
      await saveCloudSave(account.uid, this.save);
      if (this.account?.uid === account.uid) this.syncState = 'synced';
    } catch (error) {
      if (this.account?.uid === account.uid) {
        this.syncState = 'error';
        this.authError = authErrorText(error);
      }
    }
    if (!document.body.classList.contains('mode-board')) this.render();
  }

  private applyPreviewAccount(): void {
    if (!import.meta.env.DEV) return;
    if (new URLSearchParams(location.search).get('previewAccount') !== '1') return;
    this.account = { uid: 'preview', name: '小明', preview: true };
    this.syncState = 'synced';
    this.save = {
      ...emptySave(),
      coins: 120,
      animals: [
        { uid: 'p1', speciesId: 'chick', stars: 3 },
        { uid: 'p2', speciesId: 'rabbit', stars: 1 },
        { uid: 'p3', speciesId: 'duck', stars: 1 },
        { uid: 'p4', speciesId: 'fox', stars: 2 },
      ],
      stats: { correct: 8, answered: 10, pulls: 4, merges: 1 },
      solo: { mastered: ['fa01', 'fa02'], rounds: 2 },
    };
  }

  private async onAuth(user: { uid: string; displayName: string | null } | null): Promise<void> {
    if (this.account?.preview && !user) return;
    if (!user) {
      if (!this.hadAccount) return;
      this.hadAccount = false;
      this.account = null;
      this.syncState = 'local';
      this.save = emptySave();
      writeSave(this.save);
      this.render();
      return;
    }
    const name = (user.displayName || '同學').replace(/\s+/g, '').slice(0, 12) || '同學';
    this.account = { uid: user.uid, name };
    this.hadAccount = true;
    this.syncState = 'saving';
    this.authError = '';
    if (!document.body.classList.contains('mode-board')) this.render();
    try {
      const cloud = await loadCloudSave(user.uid);
      if (this.account?.uid !== user.uid) return;
      this.save = mergeSaves(this.save, cloud);
      writeSave(this.save);
      await saveCloudSave(user.uid, this.save);
      if (this.account?.uid === user.uid) this.syncState = 'synced';
    } catch (error) {
      if (this.account?.uid === user.uid) {
        this.syncState = 'error';
        this.authError = authErrorText(error);
      }
    }
    if (!document.body.classList.contains('mode-board')) this.render();
  }

  private async signIn(): Promise<void> {
    if (this.authBusy || this.account) return;
    this.authBusy = true;
    this.authError = '';
    this.render();
    try {
      await signInGoogle();
    } catch (error) {
      this.authError = authErrorText(error);
    } finally {
      this.authBusy = false;
      if (!document.body.classList.contains('mode-board')) this.render();
    }
  }

  private async signOutAccount(): Promise<void> {
    if (this.account?.preview) {
      this.account = null;
      this.syncState = 'local';
      this.save = emptySave();
      writeSave(this.save);
      this.render();
      return;
    }
    try {
      if (this.cloudTimer !== null) {
        window.clearTimeout(this.cloudTimer);
        this.cloudTimer = null;
        await this.pushCloud();
      }
      await signOutGoogle();
    } catch (error) {
      this.authError = authErrorText(error);
      this.render();
    }
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  private clearHatchTimer(): void {
    if (this.hatchTimer !== null) {
      window.clearTimeout(this.hatchTimer);
      this.hatchTimer = null;
    }
  }

  private render(): void {
    const playing =
      this.route === 'board' && !!this.board && (this.board.phase === 'answer' || this.board.phase === 'explain');
    document.body.classList.toggle('mode-board', playing);
    const bump = this.renderedCoins >= 0 && this.save.coins > this.renderedCoins;
    this.renderedCoins = this.save.coins;
    if (playing && this.board) {
      this.root.innerHTML = this.boardPlayHtml(this.board, bump);
      return;
    }
    this.root.innerHTML = `<div class="app">${this.topbar(bump)}<main class="wrap">${this.page()}</main></div>${this.modalHtml()}`;
  }

  private topbar(bump: boolean): string {
    return `<header class="topbar">
      <button class="brand" type="button" data-action="go-home">
        ${coinSvg()}
        <span class="brand-text"><strong>小六科學溫習站</strong><small>上學期科學農場</small></span>
      </button>
      <div class="top-actions">
        ${this.accountControls()}
        <button class="nav-btn" type="button" data-action="go-farm">飼養場</button>
        <button class="nav-btn" type="button" data-action="go-gacha">孵蛋</button>
        <span class="coin-pill ${bump ? 'bump' : ''}" data-testid="coins">${coinSvg()}<strong>${this.save.coins}</strong><small>科學幣</small></span>
      </div>
    </header>`;
  }

  private page(): string {
    if (this.route === 'solo') return this.solo ? this.soloPlayHtml(this.solo) : this.soloSetupHtml();
    if (this.route === 'board') return this.board && this.board.phase === 'done' ? this.boardDoneHtml(this.board) : this.boardSetupHtml();
    if (this.route === 'farm') return this.farmHtml();
    if (this.route === 'gacha') return this.gachaHtml();
    return this.homeHtml();
  }

  private homeHtml(): string {
    const owned = new Set(this.save.animals.map((item) => item.speciesId)).size;
    const parade = SPECIES.slice(0, 7).map((species) => `<div class="parade-item">${animalSvg(species)}</div>`).join('');
    return `<section class="home" data-testid="home">
      <div class="hero">
        <p class="eyebrow">香港小學六年級 · 上學期</p>
        <h1>科學農場溫習站</h1>
        <p class="lede">答對題目賺科學幣，孵出小動物，三隻相同星級可以合成升級。未登入也可以玩。</p>
        ${this.loginBanner()}
        <div class="topic-row">
          ${TOPIC_ORDER.map((id) => `<span class="pill">${esc(TOPIC_LABEL[id])}</span>`).join('')}
        </div>
      </div>
      <div class="mode-grid">
        <button class="mode-card solo" type="button" data-action="go-solo">
          <span class="mode-kicker">自己的節奏</span>
          <strong>個人溫習</strong>
          <span>選一個課題或混合，每輪 ${SOLO_ROUND} 題。答完即時看短解說，未掌握的題目可以再練。</span>
        </button>
        <button class="mode-card board" type="button" data-action="go-board">
          <span class="mode-kicker">智慧板 · 三人同時</span>
          <strong>白板三人</strong>
          <span>同一題、三欄同時作答。答得又快又準，科學幣愈多。適合投到大螢幕。</span>
        </button>
      </div>
      <div class="quick-grid">
        <button class="quick" type="button" data-action="go-gacha"><strong>孵蛋</strong><span>用科學幣打開一隻蛋</span></button>
        <button class="quick" type="button" data-action="go-farm"><strong>動物飼養場</strong><span>已遇見 ${owned} / ${SPECIES.length} 種</span></button>
      </div>
      <div class="parade" aria-hidden="true">${parade}</div>
      <ol class="steps">
        <li>選擇個人溫習或白板三人。</li>
        <li>答對得到科學幣，錯了會看到簡短解說。</li>
        <li>三隻完全相同的一星合成二星，三隻二星合成三星。</li>
      </ol>
      <p class="note">題庫 ${QUESTIONS.length} 題 · 已掌握 ${this.save.solo.mastered.length} 題 · 沒有班內排行榜 · 名字只在這一局顯示</p>
    </section>`;
  }

  private topicChips(which: 'solo' | 'board', current: TopicPick): string {
    const action = which === 'solo' ? 'topic-solo' : 'topic-board';
    const items: { id: TopicPick; label: string }[] = [
      { id: 'mix', label: '混合溫習' },
      ...TOPIC_ORDER.map((id) => ({ id, label: TOPIC_LABEL[id] })),
    ];
    return `<div class="chips">${items
      .map(
        (item) =>
          `<button type="button" class="chip ${item.id === current ? 'on' : ''}" data-action="${action}" data-topic="${item.id}">${esc(item.label)}</button>`,
      )
      .join('')}</div>`;
  }

  private soloSetupHtml(): string {
    return `<section class="panel" data-testid="solo-setup">
      <h2>個人溫習</h2>
      <p class="lede">每輪 ${SOLO_ROUND} 題。第一次答對得 ${SOLO_FIRST_COINS} 科學幣，再練時答對得 ${SOLO_RETRY_COINS} 科學幣。</p>
      <label class="field">這一局顯示的名字（可留空）
        <input data-field="solo-name" maxlength="8" placeholder="例如：小明" value="${esc(this.soloName)}" />
      </label>
      <p class="label">課題</p>
      ${this.topicChips('solo', this.soloTopic)}
      <button class="primary big" type="button" data-action="start-solo">開始 ${SOLO_ROUND} 題</button>
    </section>`;
  }

  private soloPlayHtml(solo: SoloState): string {
    if (solo.phase === 'summary') return this.soloSummaryHtml(solo);
    const question = solo.queue[solo.cursor];
    if (!question) return this.soloSummaryHtml(solo);
    const revealed = solo.phase === 'explain';
    const last = solo.cursor >= solo.queue.length - 1;
    const choices = solo.presented
      .map((choice, index) => {
        const picked = solo.picked.includes(choice.id);
        const right = question.answer.includes(choice.id);
        const cls = revealed ? (right ? 'choice correct' : picked ? 'choice wrong' : 'choice') : picked ? 'choice on' : 'choice';
        return `<button type="button" class="${cls}" data-action="solo-opt" data-opt="${choice.id}" ${revealed ? 'disabled' : ''}>
          <span class="k">${letter(index)}</span><span class="t">${esc(choice.text)}</span>
        </button>`;
      })
      .join('');
    const gain = revealed ? soloCoins(solo.lastCorrect, solo.retrying) : 0;
    return `<section class="panel play" data-testid="solo-question" data-qid="${question.id}">
      <div class="play-top">
        <span class="tag">${esc(topicName(solo.topic))}${solo.retrying ? ' · 再練' : ''}</span>
        <span class="progress">第 ${solo.cursor + 1} / ${solo.queue.length} 題</span>
        <span class="who">${esc(solo.name)}</span>
      </div>
      <h2 class="prompt">${esc(question.prompt)}</h2>
      <p class="hint">${question.type === 'multi' ? '可選多於一項，選齊後按確定。' : question.type === 'tf' ? '判斷這句說話是否正確。' : '選一個最合適的答案。'}</p>
      <div class="options ${question.type === 'tf' ? 'tf' : ''}">${choices}</div>
      ${solo.note ? `<p class="hint warn">${esc(solo.note)}</p>` : ''}
      ${
        question.type === 'multi' && !revealed
          ? `<button class="primary" type="button" data-action="solo-submit">確定</button>`
          : ''
      }
      ${
        revealed
          ? `<div class="explain ${solo.lastCorrect ? 'good' : 'soft'}" data-testid="explain">
              <strong>${solo.lastCorrect ? '答對了！' : '差一點點'}</strong>
              <p>${esc(question.explain)}</p>
              ${gain ? `<p class="gain">科學幣 +${gain}</p>` : '<p class="gain soft">這題先記下解說，等一下可以再練。</p>'}
              <button class="primary" type="button" data-action="solo-next">${last ? '看這一輪結果' : '下一題'}</button>
            </div>`
          : ''
      }
    </section>`;
  }

  private soloSummaryHtml(solo: SoloState): string {
    return `<section class="panel summary" data-testid="solo-summary">
      <h2>${solo.correctCount === solo.totalCount && solo.totalCount > 0 ? '這一輪全對！' : '這一輪完成了'}</h2>
      <p class="lede">${esc(solo.name)} · ${esc(topicName(solo.topic))}</p>
      <div class="stat-row">
        <div class="stat"><strong>${solo.correctCount}/${solo.totalCount}</strong><span>答對</span></div>
        <div class="stat"><strong>+${solo.coins}</strong><span>科學幣</span></div>
      </div>
      ${
        solo.missed.length
          ? `<p>還有 ${solo.missed.length} 題可以再看一次。再答對仍然有科學幣。</p>
             <button class="primary" type="button" data-action="solo-retry">再練未掌握的題目</button>`
          : '<p>這幾題都掌握了，去孵一隻蛋慶祝吧。</p>'
      }
      <div class="row-actions">
        <button class="ghost" type="button" data-action="solo-again">再來一輪</button>
        <button class="ghost" type="button" data-action="go-gacha">去孵蛋</button>
        <button class="ghost" type="button" data-action="go-home">回主頁</button>
      </div>
    </section>`;
  }

  private boardSetupHtml(): string {
    return `<section class="panel" data-testid="board-setup">
      <h2>白板三人</h2>
      <p class="lede">三位同學同時看同一題，在自己的一欄作答。愈快答對，科學幣愈多。名字只在這一局顯示。</p>
      <div class="setup-names">
        ${[0, 1, 2]
          .map(
            (index) => `<label class="field">第 ${index + 1} 位（可留空）
              <input data-field="board-name" data-index="${index}" maxlength="8" placeholder="${COL_NAME[index]}" value="${esc(this.boardNames[index] ?? '')}" />
            </label>`,
          )
          .join('')}
      </div>
      <p class="label">課題</p>
      ${this.topicChips('board', this.boardTopic)}
      <p class="label">題數</p>
      <div class="chips">
        ${[6, 8, 10]
          .map(
            (count) =>
              `<button type="button" class="chip ${count === this.boardCount ? 'on' : ''}" data-action="board-count" data-count="${count}">${count} 題</button>`,
          )
          .join('')}
      </div>
      <button class="primary big" type="button" data-action="start-board">開始白板</button>
    </section>`;
  }

  private boardPlayHtml(board: BoardState, bump: boolean): string {
    const question = board.questions[board.index];
    if (!question) return '';
    const revealed = board.phase === 'explain';
    const hint =
      question.type === 'multi'
        ? '可選多於一項，然後按自己一欄的「確定」。時間到會以已選答案結算。'
        : '在自己的一欄點選答案。三位可以同時按。';
    const cols = board.players
      .map((player, col) => {
        const options = board.presented
          .map((choice, index) => {
            const picked = player.picked.includes(choice.id);
            const right = question.answer.includes(choice.id);
            const cls = ['opt', picked ? 'on' : '', revealed && right ? 'correct' : '', revealed && picked && !right ? 'wrong' : '']
              .filter(Boolean)
              .join(' ');
            return `<button type="button" class="${cls}" data-board-opt="${choice.id}" aria-pressed="${picked ? 'true' : 'false'}" ${revealed ? 'disabled' : ''}>
              <span class="k">${letter(index)}</span><span class="t">${esc(choice.text)}</span>
            </button>`;
          })
          .join('');
        const result = revealed ? this.columnResult(player) : '';
        return `<section class="col c${col}" data-col="${col}">
          <header class="col-h">
            <span class="pname">${esc(player.name)}</span>
            <span class="pscore">${player.total}</span>
            ${player.locked && !revealed ? '<span class="ribbon">已作答</span>' : ''}
          </header>
          <div class="col-options">
            ${options}
            ${
              question.type === 'multi'
                ? `<button type="button" class="lock" data-board-lock="${col}" ${revealed ? 'disabled' : ''}>確定</button>`
                : ''
            }
          </div>
          <p class="col-note"></p>
          ${result}
        </section>`;
      })
      .join('');
    const last = board.index >= board.questions.length - 1;
    return `<section class="board-play" data-testid="board" data-qid="${question.id}">
      <header class="board-top">
        <button class="tiny" type="button" data-action="go-home">主頁</button>
        <div class="board-title">
          <strong>白板三人</strong>
          <span>第 ${board.index + 1} / ${board.questions.length} 題 · ${esc(topicName(board.topic))}</span>
        </div>
        <div class="timer ${revealed ? 'done' : ''}">
          <svg class="timer-svg" viewBox="0 0 100 100" aria-hidden="true">
            <circle class="ring-bg" cx="50" cy="50" r="42" pathLength="100"></circle>
            <circle class="ring" data-timer-ring cx="50" cy="50" r="42" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${revealed ? 100 : 0}"></circle>
          </svg>
          <strong data-timer>${revealed ? '✓' : '30'}</strong>
        </div>
        <span class="coin-pill ${bump ? 'bump' : ''}" data-testid="coins">${coinSvg()}<strong>${this.save.coins}</strong></span>
      </header>
      <div class="board-mid">
        <h2 class="board-q">${esc(question.prompt)}</h2>
        ${
          revealed
            ? `<div class="board-explain" data-testid="board-explain">
                <p>${esc(question.explain)}</p>
                <button class="primary" type="button" data-action="board-next">${last ? '看結算' : '下一題'}</button>
              </div>`
            : `<p class="board-hint">${hint}</p>`
        }
      </div>
      <div class="cols">${cols}</div>
    </section>`;
  }

  private columnResult(player: BoardPlayer): string {
    if (player.picked.length === 0) {
      return `<div class="col-result soft"><strong>時間到</strong><span>未有作答，下一題再一起試。</span></div>`;
    }
    if (player.correct) {
      const elapsed = player.elapsedMs ?? BOARD_LIMIT_MS;
      const ratio = elapsed / BOARD_LIMIT_MS;
      const word = ratio < 0.35 ? '好快！' : ratio < 0.7 ? '又快又準' : '答對了';
      return `<div class="col-result good"><strong>${word}</strong><span>科學幣 +${player.gained}</span></div>`;
    }
    return `<div class="col-result soft"><strong>差一點點</strong><span>看看上面的解說就好。</span></div>`;
  }

  private boardDoneHtml(board: BoardState): string {
    const cards = board.players
      .map(
        (player, index) => `<article class="done-card c${index}">
          <h3>${esc(player.name)}</h3>
          <p class="score-num">${player.total}</p>
          <span>本局科學幣</span>
        </article>`,
      )
      .join('');
    return `<section class="panel summary" data-testid="board-done">
      <h2>這一局完成了</h2>
      <p class="lede">三位都辛苦了。科學幣已存好，可以一起去孵蛋。</p>
      <div class="done-grid">${cards}</div>
      <div class="row-actions">
        <button class="primary" type="button" data-action="start-board">再玩一局</button>
        <button class="ghost" type="button" data-action="go-gacha">去孵蛋</button>
        <button class="ghost" type="button" data-action="go-home">回主頁</button>
      </div>
    </section>`;
  }

  private farmHtml(): string {
    const ownedIds = new Set(this.save.animals.map((item) => item.speciesId));
    const list = SPECIES.filter((species) => {
      const owned = ownedIds.has(species.id);
      if (this.farmFilter === 'owned') return owned;
      if (this.farmFilter === 'missing') return !owned;
      if (this.farmFilter === 'all') return true;
      return species.rarity === this.farmFilter;
    });
    const filters: { id: FarmFilter; label: string }[] = [
      { id: 'all', label: '全部' },
      { id: 'owned', label: '已收集' },
      { id: 'missing', label: '未遇見' },
      { id: 'common', label: '普通' },
      { id: 'rare', label: '稀有' },
      { id: 'super', label: '超稀有' },
    ];
    const cards = list
      .map((species) => {
        const groups = bucketsFor(this.save.animals, species.id);
        const owned = groups[1].length + groups[2].length + groups[3].length > 0;
        const best: Star = groups[3].length ? 3 : groups[2].length ? 2 : 1;
        const lines = ([1, 2, 3] as const)
          .map((stars) => {
            const count = groups[stars].length;
            if (!owned || count === 0) return '';
            const canMerge = stars < 3 && count >= 3;
            const need = stars < 3 && count > 0 && count < 3 ? `<small>再收集 ${3 - count} 隻可合成</small>` : '';
            const button = canMerge
              ? `<button type="button" class="merge" data-action="merge" data-species="${species.id}" data-stars="${stars}">3 隻${starWord(stars)}合成</button>`
              : need;
            return `<div class="count-line"><span class="${stars === 3 ? 'starbar max' : 'starbar'}">${starGlyph(stars)}</span><b>×${count}</b>${button}</div>`;
          })
          .join('');
        if (!owned) {
          return `<article class="species-card locked" data-action="open-animal" data-species="${species.id}" data-testid="species-${species.id}">
            <div class="art">${mysteryArt()}</div>
            <div class="species-meta">
              <span class="rarity unknown">未知</span>
              <h3>？？？</h3>
              <p class="missing">尚未遇見</p>
            </div>
          </article>`;
        }
        return `<article class="species-card ${best === 3 ? 'best3' : ''} rarity-${species.rarity}" data-action="open-animal" data-species="${species.id}" data-testid="species-${species.id}">
          <div class="art">${animalSvg(species)}</div>
          <div class="species-meta">
            <span class="rarity ${species.rarity}">${RARITY_LABEL[species.rarity]}</span>
            <h3>${esc(species.name)}</h3>
            <p class="totem">${esc(species.totem)}徽章</p>
            ${lines}
          </div>
        </article>`;
      })
      .join('');
    return `<section class="farm" data-testid="farm">
      <div class="farm-head">
        <div>
          <h2>動物飼養場</h2>
          <p class="lede">已遇見 ${ownedIds.size} / ${SPECIES.length} 種 · 動物 ${this.save.animals.length} 隻 · 合成 ${this.save.stats.merges} 次</p>
        </div>
      </div>
      <div class="chips">${filters
        .map(
          (item) =>
            `<button type="button" class="chip ${item.id === this.farmFilter ? 'on' : ''}" data-action="farm-filter" data-filter="${item.id}">${item.label}</button>`,
        )
        .join('')}</div>
      <div class="farm-grid">${cards || '<p class="lede">這個分類還沒有動物。</p>'}</div>
      <button class="danger" type="button" data-action="ask-reset">${this.account && !this.account.preview ? '清空這個帳號的農場' : '清空這部裝置上的農場'}</button>
    </section>`;
  }

  private gachaHtml(): string {
    if (this.hatch) return this.hatchHtml(this.hatch);
    const oneShort = Math.max(0, PULL_COST - this.save.coins);
    const tenShort = Math.max(0, TEN_PULL_COST - this.save.coins);
    return `<section class="gacha" data-testid="gacha">
      <h2>孵蛋</h2>
      <p class="lede">只有一種蛋。每抽 ${PULL_COST} 科學幣。十連抽 ${TEN_PULL_COST} 科學幣，會多送 1 抽，一共 ${TEN_PULL_COUNT} 隻。稀有度在孵出的動物身上：普通 70%、稀有 20%、超稀有 10%。</p>
      <div class="gacha-shop">
        <div class="egg-graphic egg-common">${eggSvg()}</div>
        <div class="gacha-actions">
          <button class="primary big" type="button" data-action="pull-one" data-testid="pull-one" ${oneShort ? 'disabled' : ''}>
            ${oneShort ? `單抽還差 ${oneShort} 幣` : `單抽 · ${PULL_COST} 科學幣`}
          </button>
          <button class="primary big ten" type="button" data-action="pull-ten" data-testid="pull-ten" ${tenShort ? 'disabled' : ''}>
            ${tenShort ? `十連抽還差 ${tenShort} 幣` : `十連抽（送多一抽）· ${TEN_PULL_COST} 科學幣`}
          </button>
        </div>
      </div>
      <p class="note">孵出來都是一星。三隻相同星級可以合成。每隻動物都是農場的好朋友。</p>
    </section>`;
  }

  private hatchHtml(hatch: HatchState): string {
    if (hatch.phase === 'wobble') {
      return `<section class="hatch wobble egg-common" data-testid="hatch">
        <div class="egg-graphic">${eggSvg()}</div>
        <p class="lede">${hatch.pulls.length > 1 ? `${hatch.pulls.length} 隻蛋在輕輕搖晃…` : '蛋在輕輕搖晃…'}</p>
      </section>`;
    }
    if (hatch.pulls.length === 1) {
      const species = hatch.pulls[0];
      if (!species) return '';
      return `<section class="hatch reveal egg-${species.rarity}" data-testid="egg-reveal">
        <div class="reveal-row">
          <div class="egg-graphic">${eggSvg()}</div>
          <div class="reveal-art">${animalSvg(species)}</div>
        </div>
        <p class="rarity ${species.rarity}">${RARITY_LABEL[species.rarity]} · ${esc(species.totem)}徽章</p>
        <h2>${esc(species.name)}</h2>
        <p class="lede">${esc(species.blurb)}</p>
        <p class="starbar">★☆☆ · 一星新朋友</p>
        <button class="primary big" type="button" data-action="close-hatch">收進飼養場</button>
      </section>`;
    }
    const cards = hatch.pulls
      .map(
        (species) => `<article class="pull-card rarity-${species.rarity}">
          <div class="art">${animalSvg(species)}</div>
          <span class="rarity ${species.rarity}">${RARITY_LABEL[species.rarity]}</span>
          <strong>${esc(species.name)}</strong>
        </article>`,
      )
      .join('');
    return `<section class="hatch reveal multi" data-testid="egg-reveal">
      <h2>十連抽 · ${hatch.pulls.length} 隻新朋友</h2>
      <div class="pull-grid">${cards}</div>
      <button class="primary big" type="button" data-action="close-hatch">收進飼養場</button>
    </section>`;
  }

  private modalHtml(): string {
    const modal = this.modal;
    if (!modal) return '';
    if (modal.kind === 'reset') {
      return `<div class="modal-back" data-action="close-modal">
        <div class="modal" data-modal-card role="dialog" aria-modal="true">
          <h3>清空農場？</h3>
          <p>${this.account && !this.account.preview ? '這個帳號的科學幣和動物會從雲端和這部裝置刪除。題目不會消失。' : '科學幣和動物會從這部裝置刪除。已登入帳號的雲端進度不會受影響。題目不會消失。'}</p>
          <div class="row-actions">
            <button class="danger" type="button" data-action="reset-yes">確定清空</button>
            <button class="ghost" type="button" data-close data-action="close-modal">保留</button>
          </div>
        </div>
      </div>`;
    }
    const species = speciesById(modal.speciesId);
    if (!species) return '';
    const owned = this.save.animals.filter((item) => item.speciesId === species.id);
    const have = owned.length > 0;
    if (!have) {
      return `<div class="modal-back" data-action="close-modal">
        <div class="modal animal" data-modal-card data-testid="animal-modal" role="dialog" aria-modal="true">
          <div class="modal-art">${mysteryArt()}</div>
          <p class="rarity unknown">未知</p>
          <h3>？？？</h3>
          <p>還沒遇見這位朋友。答題孵蛋就有機會遇到。</p>
          <button class="primary" type="button" data-close data-action="close-modal">關閉</button>
        </div>
      </div>`;
    }
    return `<div class="modal-back" data-action="close-modal">
      <div class="modal animal rarity-${species.rarity} ${modal.stars === 3 ? 'best3' : ''}" data-modal-card data-testid="animal-modal" role="dialog" aria-modal="true">
        ${modal.banner ? `<p class="banner">${esc(modal.banner)}</p>` : ''}
        <div class="modal-art">${animalSvg(species)}</div>
        <p class="rarity ${species.rarity}">${RARITY_LABEL[species.rarity]} · ${esc(species.totem)}徽章</p>
        <h3>${esc(species.name)}</h3>
        <p class="starbar ${modal.stars === 3 ? 'max' : ''}" data-testid="modal-stars">${starGlyph(modal.stars)}</p>
        <p>${esc(species.blurb)}</p>
        <p class="note">你有 ${owned.length} 隻，最高 ${starWord(modal.stars)}。</p>
        <button class="primary" type="button" data-close data-action="close-modal">關閉</button>
      </div>
    </div>`;
  }

  private accountControls(): string {
    if (!this.account) {
      return `<button class="nav-btn sign-in" type="button" data-action="sign-in" data-testid="sign-in-top" ${this.authBusy ? 'disabled' : ''}>用 Google 登入</button>`;
    }
    const label = this.syncState === 'saving' ? '同步中' : this.syncState === 'error' ? '未能同步' : '已同步';
    return `<span class="account" data-testid="signed-in"><strong>${esc(this.account.name)}</strong><small>${label}</small></span><button class="nav-btn" type="button" data-action="sign-out">登出</button>`;
  }

  private loginBanner(): string {
    if (this.account) {
      return `<div class="login-banner synced">
        <p>已登入 ${esc(this.account.name)}。科學幣、動物和已掌握的題目會跟住這個 Google 帳號。</p>
        <button class="ghost" type="button" data-action="sign-out">登出</button>
      </div>`;
    }
    return `<div class="login-banner" data-testid="login-banner">
      <p>未登入也可以玩。登入 Google 後，科學幣、動物和個人溫習進度會跟住帳號，換裝置也不會不見。</p>
      <button class="primary" type="button" data-action="sign-in" data-testid="sign-in" ${this.authBusy ? 'disabled' : ''}>用 Google 登入</button>
      ${this.authError ? `<p class="hint warn" data-testid="auth-error">${esc(this.authError)}</p>` : ''}
    </div>`;
  }
}

function mysteryArt(): string {
  return `<div class="mystery" role="img" aria-label="尚未遇見的動物"><span class="mystery-mark">？</span></div>`;
}
