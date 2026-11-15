export type Rarity = 'common' | 'rare' | 'super';

export type TotemKey =
  | 'sun'
  | 'clover'
  | 'wave'
  | 'daisy'
  | 'cloud'
  | 'seed'
  | 'fish'
  | 'paw'
  | 'maple'
  | 'bamboo'
  | 'snow'
  | 'shell'
  | 'moon'
  | 'acorn'
  | 'leaf'
  | 'feather'
  | 'flower'
  | 'aurora'
  | 'eye'
  | 'swirl'
  | 'star'
  | 'hive';

export type AnimalKind =
  | 'chick'
  | 'rabbit'
  | 'duck'
  | 'guinea'
  | 'sheep'
  | 'hamster'
  | 'cat'
  | 'dog'
  | 'fox'
  | 'panda'
  | 'penguin'
  | 'otter'
  | 'owl'
  | 'hedgehog'
  | 'deer'
  | 'flamingo'
  | 'sloth'
  | 'bear'
  | 'peacock'
  | 'koi'
  | 'horse'
  | 'bee';

export interface Species {
  id: string;
  name: string;
  rarity: Rarity;
  totem: string;
  totemKey: TotemKey;
  blurb: string;
  kind: AnimalKind;
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: '普通',
  rare: '稀有',
  super: '超稀有',
};

export const SPECIES: Species[] = [
  { id: 'chick', name: '暖暖雞', rarity: 'common', totem: '太陽', totemKey: 'sun', blurb: '每天用軟軟的叫聲迎接早晨。', kind: 'chick' },
  { id: 'rabbit', name: '棉花兔', rarity: 'common', totem: '三葉草', totemKey: 'clover', blurb: '最喜歡在草地上輕輕跳躍。', kind: 'rabbit' },
  { id: 'duck', name: '泡泡鴨', rarity: 'common', totem: '水波', totemKey: 'wave', blurb: '下雨天也會開心地踩水。', kind: 'duck' },
  { id: 'guinea', name: '圓圓天竺鼠', rarity: 'common', totem: '雛菊', totemKey: 'daisy', blurb: '圓滾滾的身體，走路慢慢的。', kind: 'guinea' },
  { id: 'sheep', name: '軟軟羊', rarity: 'common', totem: '白雲', totemKey: 'cloud', blurb: '羊毛好像一小團白雲。', kind: 'sheep' },
  { id: 'hamster', name: '豆豆倉鼠', rarity: 'common', totem: '種子', totemKey: 'seed', blurb: '把最愛的種子藏在頰囊裡。', kind: 'hamster' },
  { id: 'cat', name: '咪咪貓', rarity: 'common', totem: '小魚', totemKey: 'fish', blurb: '曬太陽時會發出輕輕的呼嚕聲。', kind: 'cat' },
  { id: 'dog', name: '旺旺狗', rarity: 'common', totem: '爪印', totemKey: 'paw', blurb: '搖著尾巴歡迎每一位朋友。', kind: 'dog' },
  { id: 'fox', name: '楓楓狐', rarity: 'rare', totem: '楓葉', totemKey: 'maple', blurb: '尾巴蓬鬆，走路輕輕的。', kind: 'fox' },
  { id: 'panda', name: '團團熊貓', rarity: 'rare', totem: '竹子', totemKey: 'bamboo', blurb: '抱著竹子，笑得圓圓的。', kind: 'panda' },
  { id: 'penguin', name: '搖搖企鵝', rarity: 'rare', totem: '雪花', totemKey: 'snow', blurb: '走路一搖一擺，非常可愛。', kind: 'penguin' },
  { id: 'otter', name: '河河水獺', rarity: 'rare', totem: '貝殼', totemKey: 'shell', blurb: '喜歡仰泳，也喜歡閃亮的貝殼。', kind: 'otter' },
  { id: 'owl', name: '月光貓頭鷹', rarity: 'rare', totem: '新月', totemKey: 'moon', blurb: '安靜地陪著夜晚的月亮。', kind: 'owl' },
  { id: 'hedgehog', name: '栗栗刺蝟', rarity: 'rare', totem: '橡果', totemKey: 'acorn', blurb: '刺是軟軟的朋友裝，其實很溫柔。', kind: 'hedgehog' },
  { id: 'deer', name: '斑斑小鹿', rarity: 'rare', totem: '嫩葉', totemKey: 'leaf', blurb: '森林裡最安靜的小訪客。', kind: 'deer' },
  { id: 'flamingo', name: '粉粉紅鶴', rarity: 'super', totem: '羽毛', totemKey: 'feather', blurb: '單腳站著，像一朵粉紅色的花。', kind: 'flamingo' },
  { id: 'sloth', name: '悠悠樹懶', rarity: 'super', totem: '花朵', totemKey: 'flower', blurb: '慢慢的也沒關係，微笑就好。', kind: 'sloth' },
  { id: 'bear', name: '雪球北極熊', rarity: 'super', totem: '極光', totemKey: 'aurora', blurb: '白白圓圓，喜歡柔柔的雪。', kind: 'bear' },
  { id: 'peacock', name: '翎翎孔雀', rarity: 'super', totem: '彩翎', totemKey: 'eye', blurb: '張開尾巴時，像一把溫柔的扇。', kind: 'peacock' },
  { id: 'koi', name: '錦錦鯉', rarity: 'super', totem: '漩渦', totemKey: 'swirl', blurb: '在清水裡畫出金色的弧線。', kind: 'koi' },
  { id: 'horse', name: '星星馬', rarity: 'super', totem: '星星', totemKey: 'star', blurb: '鬃毛裡好像藏著一顆小星星。', kind: 'horse' },
  { id: 'bee', name: '蜜蜜蜂', rarity: 'super', totem: '蜂巢', totemKey: 'hive', blurb: '忙著採蜜，也忙著和花說你好。', kind: 'bee' },
];

const INK = '#5b3b2a';

const TOTEM_ICON: Record<TotemKey, string> = {
  sun: `<circle r="6" fill="#f6b73c" stroke="${INK}" stroke-width="2"/><g stroke="#f6b73c" stroke-width="2" stroke-linecap="round"><path d="M0-11v3M0 8v3M-11 0h3M8 0h3M-8-8l2 2M6 6l2 2M-8 8l2-2M6-6l2-2"/></g>`,
  clover: `<g fill="#3cb371" stroke="${INK}" stroke-width="1.5"><circle cx="0" cy="-6" r="5"/><circle cx="-5.2" cy="3" r="5"/><circle cx="5.2" cy="3" r="5"/></g><path d="M0 6v7" stroke="#2f8f55" stroke-width="2" stroke-linecap="round"/>`,
  wave: `<path d="M-12 2q6-8 12 0t12 0" fill="none" stroke="#3aa0d8" stroke-width="3" stroke-linecap="round"/><path d="M-12 8q6-8 12 0t12 0" fill="none" stroke="#7ec8ef" stroke-width="3" stroke-linecap="round"/>`,
  daisy: `<g fill="#fff" stroke="${INK}" stroke-width="1.4">${[0, 45, 90, 135, 180, 225, 270, 315].map((d) => `<ellipse transform="rotate(${d})" cx="0" cy="-8" rx="3" ry="5"/>`).join('')}</g><circle r="3.5" fill="#f6c445" stroke="${INK}" stroke-width="1.4"/>`,
  cloud: `<g fill="#fff" stroke="${INK}" stroke-width="1.6"><ellipse cx="-4" cy="2" rx="8" ry="6"/><ellipse cx="6" cy="2" rx="7" ry="5.5"/><ellipse cx="1" cy="-3" rx="6" ry="5"/></g>`,
  seed: `<ellipse cx="0" cy="1" rx="6" ry="9" fill="#c9853a" stroke="${INK}" stroke-width="1.6"/><path d="M0-8c4 4 4 8 0 10" fill="none" stroke="#8a5a28" stroke-width="1.4"/>`,
  fish: `<ellipse cx="-1" cy="1" rx="10" ry="6" fill="#ff8f70" stroke="${INK}" stroke-width="1.6"/><path d="M8 1l7-5v10z" fill="#ffb199" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="-5" cy="0" r="1.2" fill="${INK}"/>`,
  paw: `<g fill="#e7a15a" stroke="${INK}" stroke-width="1.4"><ellipse cx="0" cy="4" rx="6" ry="5"/><circle cx="-6" cy="-4" r="2.4"/><circle cx="-2" cy="-7" r="2.4"/><circle cx="3" cy="-7" r="2.4"/><circle cx="7" cy="-3.5" r="2.2"/></g>`,
  maple: `<path d="M0-12 L3-4 L11-6 L6 0 L10 8 L0 4 L-10 8 L-6 0 L-11-6 L-3-4 Z" fill="#e15b3a" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>`,
  bamboo: `<g stroke="${INK}" stroke-width="1.5"><rect x="-8" y="-12" width="5" height="24" rx="2" fill="#7dcb6a"/><rect x="-1" y="-14" width="5" height="26" rx="2" fill="#5bb85a"/><path d="M-8-4h5M-8 4h5M-1-5h5M-1 4h5" stroke="#2f7a3a"/></g>`,
  snow: `<g stroke="#7eb6e0" stroke-width="2" stroke-linecap="round"><path d="M0-11v22M-10-6l20 12M-10 6l20-12"/><path d="M0-11l-3 3M0-11l3 3M0 11l-3-3M0 11l3-3"/></g>`,
  shell: `<path d="M-10 6 Q0-12 10 6 Z" fill="#f3b9c8" stroke="${INK}" stroke-width="1.6"/><path d="M0-8v14M-5 0c2 2 3 4 5 6M5 0c-2 2-3 4-5 6" fill="none" stroke="${INK}" stroke-width="1.3"/>`,
  moon: `<path d="M4-10a10 10 0 1 0 0 20a8 8 0 1 1 0-20z" fill="#f6e27a" stroke="${INK}" stroke-width="1.6"/>`,
  acorn: `<path d="M-8-2h16c-1 3-4 5-8 5s-7-2-8-5z" fill="#8d5a32" stroke="${INK}" stroke-width="1.4"/><ellipse cx="0" cy="6" rx="7" ry="8" fill="#d9924a" stroke="${INK}" stroke-width="1.4"/>`,
  leaf: `<path d="M-8 6 C-8-8 8-10 10-12 C4 2 0 8-8 6z" fill="#67b86a" stroke="${INK}" stroke-width="1.5"/><path d="M-6 5 C-2-2 4-8 9-11" fill="none" stroke="#2f7a3e" stroke-width="1.3"/>`,
  feather: `<path d="M0 12 C8 4 8-8 0-12 C-8-8-8 4 0 12z" fill="#f7c1d4" stroke="${INK}" stroke-width="1.5"/><path d="M0-10v20" stroke="${INK}" stroke-width="1.3"/>`,
  flower: `<g fill="#ff8fb8" stroke="${INK}" stroke-width="1.3"><circle cx="0" cy="-7" r="4.5"/><circle cx="6.5" cy="-2" r="4.5"/><circle cx="4" cy="6" r="4.5"/><circle cx="-4" cy="6" r="4.5"/><circle cx="-6.5" cy="-2" r="4.5"/></g><circle r="3.2" fill="#ffe28a" stroke="${INK}" stroke-width="1.3"/>`,
  aurora: `<path d="M-12 6c4-12 8-12 12 0" fill="none" stroke="#7d6bff" stroke-width="2.4" stroke-linecap="round"/><path d="M-8 8c3-10 6-10 9 0" fill="none" stroke="#5ddea0" stroke-width="2.4" stroke-linecap="round"/><path d="M-4 9c2-7 4-7 6 0" fill="none" stroke="#f7d36a" stroke-width="2.2" stroke-linecap="round"/>`,
  eye: `<circle r="10" fill="#2a9d8f" stroke="${INK}" stroke-width="1.5"/><circle r="6" fill="#1d6a8a"/><circle r="3" fill="#123"/><circle cx="2" cy="-2" r="1.2" fill="#fff"/>`,
  swirl: `<path d="M0 0c6 0 8 6 2 8c-8 2-10-8-2-10c10-2 14 10 4 14" fill="none" stroke="#3a8fd4" stroke-width="2.2" stroke-linecap="round"/>`,
  star: `<path d="M0-11l2.6 6.2H9l-5 4.1 1.9 6.4L0 5.8l-5.9 4.9 1.9-6.4-5-4.1h6.4z" fill="#f6c445" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>`,
  hive: `<g stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"><path d="M-8 0l4-7h8l4 7-4 7h-8z" fill="#f6c445"/><path d="M-8 0h16M-6 5h12M-6-5h12" /></g>`,
};

function totem(key: TotemKey): string {
  return `<g transform="translate(166,42)"><circle r="24" fill="#fffaf3" stroke="${INK}" stroke-width="3"/><circle r="19" fill="#fff" stroke="#f0d8b8" stroke-width="2"/>${TOTEM_ICON[key]}</g>`;
}

function eyes(x1: number, x2: number, y: number, r = 7): string {
  return `<ellipse cx="${x1}" cy="${y}" rx="${r}" ry="${r + 1.4}" fill="#2c211c"/><ellipse cx="${x2}" cy="${y}" rx="${r}" ry="${r + 1.4}" fill="#2c211c"/><circle cx="${x1 + 2.4}" cy="${y - 2.4}" r="2.2" fill="#fff"/><circle cx="${x2 + 2.4}" cy="${y - 2.4}" r="2.2" fill="#fff"/>`;
}

function blush(y: number, spread = 36): string {
  return `<ellipse cx="${100 - spread}" cy="${y}" rx="9" ry="5.5" fill="#ffb4c2" opacity=".9"/><ellipse cx="${100 + spread}" cy="${y}" rx="9" ry="5.5" fill="#ffb4c2" opacity=".9"/>`;
}

function ground(): string {
  return `<ellipse cx="96" cy="190" rx="52" ry="8" fill="#efd3ae"/>`;
}

function backdrop(color: string): string {
  return `<circle cx="96" cy="112" r="74" fill="${color}"/>`;
}

function draw(kind: AnimalKind): string {
  switch (kind) {
    case 'chick':
      return `${backdrop('#ffe8a8')}${ground()}
        <ellipse cx="70" cy="132" rx="16" ry="11" fill="#ffd15c" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="122" cy="132" rx="16" ry="11" fill="#ffd15c" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="96" cy="118" rx="46" ry="42" fill="#ffd45a" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="96" cy="132" rx="28" ry="22" fill="#fff4c8"/>
        <path d="M80 78l8-16 8 16" fill="#f08a2c" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M84 112h24l-12 12z" fill="#f29a2e" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        ${eyes(82, 110, 108)}
        ${blush(122, 30)}`;
    case 'rabbit':
      return `${backdrop('#ffe4ef')}${ground()}
        <ellipse cx="74" cy="62" rx="12" ry="28" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="118" cy="62" rx="12" ry="28" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="74" cy="66" rx="6" ry="16" fill="#ffd0dc"/>
        <ellipse cx="118" cy="66" rx="6" ry="16" fill="#ffd0dc"/>
        <ellipse cx="96" cy="124" rx="42" ry="40" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="96" cy="136" rx="22" ry="16" fill="#ffe4ef"/>
        ${eyes(82, 110, 116)}
        <path d="M90 128h12l-6 7z" fill="#f4a6b8" stroke="${INK}" stroke-width="2"/>
        ${blush(132, 28)}`;
    case 'duck':
      return `${backdrop('#e5f6ff')}${ground()}
        <ellipse cx="96" cy="124" rx="46" ry="38" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
        <circle cx="96" cy="92" r="28" fill="#fffef8" stroke="${INK}" stroke-width="3.5"/>
        <path d="M78 98h36l-6 12h-24z" fill="#f0a03a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M112 70c10-8 16 2 8 8" fill="#ffe08a" stroke="${INK}" stroke-width="2.5"/>
        ${eyes(86, 108, 88, 6)}
        <ellipse cx="64" cy="128" rx="14" ry="10" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
    case 'guinea':
      return `${backdrop('#fff1df')}${ground()}
        <ellipse cx="96" cy="128" rx="52" ry="36" fill="#e7b07a" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="96" cy="136" rx="30" ry="20" fill="#fff3e4"/>
        <ellipse cx="62" cy="104" rx="10" ry="12" fill="#d99962" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="130" cy="104" rx="10" ry="12" fill="#d99962" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="96" cy="112" rx="28" ry="22" fill="#f0c49a" stroke="${INK}" stroke-width="3"/>
        ${eyes(86, 108, 110, 5.5)}
        <ellipse cx="96" cy="120" rx="5" ry="3.5" fill="#c98484"/>
        ${blush(122, 20)}`;
    case 'sheep':
      return `${backdrop('#eef8ff')}${ground()}
        <g fill="#fff" stroke="${INK}" stroke-width="3">
          <circle cx="70" cy="120" r="22"/><circle cx="96" cy="108" r="24"/><circle cx="122" cy="120" r="22"/>
          <circle cx="78" cy="140" r="18"/><circle cx="112" cy="140" r="18"/>
        </g>
        <ellipse cx="96" cy="124" rx="16" ry="14" fill="#f3d2b8" stroke="${INK}" stroke-width="3"/>
        ${eyes(90, 104, 122, 4.2)}
        <path d="M92 130h8" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
        <rect x="78" y="156" width="8" height="16" rx="3" fill="#5b3b2a"/>
        <rect x="106" y="156" width="8" height="16" rx="3" fill="#5b3b2a"/>`;
    case 'hamster':
      return `${backdrop('#fff4d8')}${ground()}
        <ellipse cx="96" cy="126" rx="44" ry="40" fill="#f0b56a" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="96" cy="136" rx="24" ry="18" fill="#fff1d6"/>
        <circle cx="58" cy="128" r="14" fill="#ffd7b0" stroke="${INK}" stroke-width="3"/>
        <circle cx="134" cy="128" r="14" fill="#ffd7b0" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="74" cy="88" rx="10" ry="12" fill="#e8a25c" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="118" cy="88" rx="10" ry="12" fill="#e8a25c" stroke="${INK}" stroke-width="3"/>
        ${eyes(84, 110, 116)}
        <ellipse cx="96" cy="128" rx="5" ry="3.5" fill="#e08a8a"/>
        ${blush(132, 24)}`;
    case 'cat':
      return `${backdrop('#fde8e2')}${ground()}
        <path d="M138 150c24 8 28-20 16-28" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="96" cy="128" rx="42" ry="38" fill="#f7b89a" stroke="${INK}" stroke-width="3.5"/>
        <path d="M62 100l14-28 16 20" fill="#f7b89a" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M130 100l-14-28-16 20" fill="#f7b89a" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M70 90l8-10 6 8" fill="#ffd0dc"/>
        <path d="M122 90l-8-10-6 8" fill="#ffd0dc"/>
        ${eyes(82, 112, 120, 6)}
        <path d="M90 132h12l-6 6z" fill="#ef8d9a"/>
        <path d="M74 126h12M108 126h12" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
        ${blush(136, 26)}`;
    case 'dog':
      return `${backdrop('#e7f6ea')}${ground()}
        <ellipse cx="58" cy="118" rx="16" ry="22" fill="#c9844a" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="134" cy="118" rx="16" ry="22" fill="#c9844a" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="96" cy="126" rx="42" ry="40" fill="#e0a15c" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="96" cy="140" rx="24" ry="16" fill="#fff3e2"/>
        ${eyes(82, 112, 116)}
        <ellipse cx="96" cy="130" rx="7" ry="5" fill="#5b3b2a"/>
        <path d="M90 138c4 6 12 6 16 0" fill="#f28b96" stroke="${INK}" stroke-width="2"/>
        ${blush(128, 28)}`;
    case 'fox':
      return `${backdrop('#ffe8d6')}${ground()}
        <path d="M140 156c22-4 30-24 18-30" fill="#e86a32" stroke="${INK}" stroke-width="3"/>
        <path d="M148 150c10 2 16-6 10-12" fill="#fff"/>
        <ellipse cx="96" cy="128" rx="40" ry="38" fill="#f28a3c" stroke="${INK}" stroke-width="3.5"/>
        <path d="M64 108l10-30 18 22" fill="#f28a3c" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M128 108l-10-30-18 22" fill="#f28a3c" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M70 96l8-12 8 10M122 96l-8-12-8 10" fill="#fff"/>
        <path d="M78 140h36l-18 16z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        ${eyes(84, 110, 120, 5.5)}
        <ellipse cx="96" cy="132" rx="4" ry="3" fill="${INK}"/>`;
    case 'panda':
      return `${backdrop('#eef3f1')}${ground()}
        <circle cx="64" cy="100" r="16" fill="#2c211c"/>
        <circle cx="128" cy="100" r="16" fill="#2c211c"/>
        <ellipse cx="96" cy="126" rx="46" ry="42" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="78" cy="122" rx="14" ry="16" fill="#2c211c"/>
        <ellipse cx="114" cy="122" rx="14" ry="16" fill="#2c211c"/>
        ${eyes(78, 114, 122, 5)}
        <ellipse cx="96" cy="138" rx="7" ry="5" fill="#2c211c"/>
        <path d="M88 146h16" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="58" cy="156" rx="12" ry="8" fill="#2c211c"/>
        <ellipse cx="134" cy="156" rx="12" ry="8" fill="#2c211c"/>`;
    case 'penguin':
      return `${backdrop('#e7f3ff')}${ground()}
        <ellipse cx="96" cy="124" rx="40" ry="48" fill="#2c3a4a" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="96" cy="132" rx="24" ry="34" fill="#fff"/>
        <ellipse cx="58" cy="132" rx="12" ry="22" fill="#2c3a4a" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="134" cy="132" rx="12" ry="22" fill="#2c3a4a" stroke="${INK}" stroke-width="3"/>
        ${eyes(84, 108, 112, 5.5)}
        <path d="M88 124h16l-8 8z" fill="#f0a03a" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
        <ellipse cx="80" cy="176" rx="14" ry="6" fill="#f0a03a" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="112" cy="176" rx="14" ry="6" fill="#f0a03a" stroke="${INK}" stroke-width="2"/>`;
    case 'otter':
      return `${backdrop('#e5f7f4')}${ground()}
        <ellipse cx="108" cy="136" rx="48" ry="28" fill="#8d6246" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="78" cy="112" rx="28" ry="24" fill="#a87552" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="70" cy="124" rx="16" ry="10" fill="#f0d2b4"/>
        ${eyes(68, 88, 108, 5)}
        <ellipse cx="74" cy="118" rx="4" ry="3" fill="#5b3b2a"/>
        <path d="M62 114h-10M70 120h-12M66 126h-8" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>
        <ellipse cx="150" cy="150" rx="16" ry="10" fill="#8d6246" stroke="${INK}" stroke-width="3"/>`;
    case 'owl':
      return `${backdrop('#efe8ff')}${ground()}
        <path d="M70 78l-8-20 18 12M122 78l8-20-18 12" fill="#8d6b4a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <ellipse cx="96" cy="124" rx="44" ry="46" fill="#c9a27a" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="96" cy="136" rx="22" ry="24" fill="#f4e2c4"/>
        <circle cx="80" cy="116" r="14" fill="#fff" stroke="${INK}" stroke-width="3"/>
        <circle cx="112" cy="116" r="14" fill="#fff" stroke="${INK}" stroke-width="3"/>
        <circle cx="80" cy="116" r="6" fill="#2c211c"/>
        <circle cx="112" cy="116" r="6" fill="#2c211c"/>
        <circle cx="82" cy="114" r="2" fill="#fff"/>
        <circle cx="114" cy="114" r="2" fill="#fff"/>
        <path d="M90 132h12l-6 8z" fill="#e7a04a" stroke="${INK}" stroke-width="2"/>`;
    case 'hedgehog':
      return `${backdrop('#fff6e4')}${ground()}
        <g fill="#c9843c" stroke="${INK}" stroke-width="2">${Array.from({ length: 9 }, (_, i) => {
          const a = Math.PI * (1.05 + i * 0.12);
          const x = 96 + Math.cos(a) * 36;
          const y = 118 + Math.sin(a) * 30;
          return `<path d="M${x} ${y}l6-16 6 16z"/>`;
        }).join('')}</g>
        <ellipse cx="96" cy="132" rx="40" ry="32" fill="#f0c07a" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="112" cy="136" rx="20" ry="16" fill="#fff1dc"/>
        ${eyes(100, 122, 128, 4.5)}
        <ellipse cx="128" cy="136" rx="4" ry="3" fill="#e29a9a"/>`;
    case 'deer':
      return `${backdrop('#f4fbe8')}${ground()}
        <path d="M74 86c-8-18-2-28 6-24 2 8 2 14 0 20M118 86c8-18 2-28-6-24-2 8-2 14 0 20" fill="none" stroke="#8d5a32" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="96" cy="132" rx="40" ry="36" fill="#e7b98a" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="78" cy="100" rx="10" ry="16" fill="#e7b98a" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="114" cy="100" rx="10" ry="16" fill="#e7b98a" stroke="${INK}" stroke-width="3"/>
        <circle cx="82" cy="120" r="4" fill="#fff" stroke="${INK}" stroke-width="1.5"/>
        <circle cx="108" cy="128" r="3.5" fill="#fff" stroke="${INK}" stroke-width="1.5"/>
        ${eyes(84, 110, 124, 5)}
        <ellipse cx="96" cy="136" rx="5" ry="3.5" fill="#c98484"/>`;
    case 'flamingo':
      return `${backdrop('#ffe8f1')}${ground()}
        <path d="M108 150c8 20 6 30-2 32" fill="none" stroke="#f2a3c0" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="100" cy="182" rx="12" ry="4" fill="#f2a3c0"/>
        <path d="M78 118c20-40 46-36 48-8" fill="none" stroke="#f7b6cc" stroke-width="12" stroke-linecap="round"/>
        <circle cx="128" cy="78" r="16" fill="#ffd0e0" stroke="${INK}" stroke-width="3"/>
        <path d="M138 80h16l-8 6z" fill="#f0a03a" stroke="${INK}" stroke-width="2"/>
        ${eyes(124, 136, 76, 3.2)}
        <ellipse cx="86" cy="132" rx="18" ry="12" fill="#ffd6e6" stroke="${INK}" stroke-width="3"/>`;
    case 'sloth':
      return `${backdrop('#f3eee4')}${ground()}
        <ellipse cx="96" cy="128" rx="42" ry="40" fill="#c8b39a" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="96" cy="124" rx="28" ry="26" fill="#f6efe4" stroke="${INK}" stroke-width="3"/>
        <path d="M70 100c-6-10-2-16 4-14M122 100c6-10 2-16-4-14" stroke="#8d6b4a" stroke-width="3" stroke-linecap="round"/>
        ${eyes(86, 108, 120, 5)}
        <path d="M90 134c4 4 12 4 16 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
        <path d="M62 150l-8 10M78 156l-4 12M114 156l4 12M130 150l8 10" stroke="#8d6b4a" stroke-width="3" stroke-linecap="round"/>`;
    case 'bear':
      return `${backdrop('#eaf4ff')}${ground()}
        <circle cx="66" cy="100" r="14" fill="#f7fbff" stroke="${INK}" stroke-width="3"/>
        <circle cx="126" cy="100" r="14" fill="#f7fbff" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="96" cy="128" rx="48" ry="42" fill="#f7fbff" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="96" cy="140" rx="22" ry="14" fill="#e7f1fb"/>
        ${eyes(82, 112, 122)}
        <ellipse cx="96" cy="134" rx="7" ry="5" fill="#2c211c"/>
        ${blush(138, 28)}`;
    case 'peacock':
      return `${backdrop('#e8fff6')}${ground()}
        <g fill="#1f9d8a" stroke="${INK}" stroke-width="1.6">${[0, 1, 2, 3, 4].map((i) => {
          const x = 48 + i * 22;
          return `<ellipse cx="${x}" cy="${78 + (i % 2) * 8}" rx="10" ry="16"/><circle cx="${x}" cy="${78 + (i % 2) * 8}" r="3.5" fill="#f6c445"/>`;
        }).join('')}</g>
        <ellipse cx="96" cy="136" rx="28" ry="32" fill="#148f86" stroke="${INK}" stroke-width="3.5"/>
        <circle cx="96" cy="104" r="16" fill="#19a38a" stroke="${INK}" stroke-width="3"/>
        ${eyes(90, 104, 102, 3.4)}
        <path d="M92 110h8l-4 6z" fill="#f0a03a"/>`;
    case 'koi':
      return `${backdrop('#e7f5ff')}${ground()}
        <path d="M36 118c28-28 70-28 104-4-20 8-40 10-70 8-12 10-24 8-34-4z" fill="#fff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M36 118c10 6 16 16 12 24 16-6 22-16 22-24" fill="#f28b3c" stroke="${INK}" stroke-width="3"/>
        <circle cx="118" cy="112" r="4" fill="${INK}"/>
        <circle cx="119.5" cy="110.5" r="1.4" fill="#fff"/>
        <path d="M70 108c8 6 14 6 24 0" fill="none" stroke="#f28b3c" stroke-width="4" stroke-linecap="round"/>
        <path d="M86 124c10 8 20 6 30-2" fill="none" stroke="#f28b3c" stroke-width="4" stroke-linecap="round"/>
        <circle cx="78" cy="112" r="5" fill="#f6c445" opacity=".9"/>`;
    case 'horse':
      return `${backdrop('#eef0ff')}${ground()}
        <path d="M70 96c-8-24 10-36 18-18" fill="#243056" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="104" cy="128" rx="40" ry="36" fill="#f4e2c4" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="128" cy="140" rx="18" ry="12" fill="#fff"/>
        <path d="M78 112c6-20 20-24 26-8" fill="#243056"/>
        ${eyes(96, 118, 120, 5)}
        <ellipse cx="132" cy="132" rx="5" ry="3.5" fill="#e29a9a"/>
        <path d="M88 168v14M118 168v14" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    case 'bee':
      return `${backdrop('#fff8dc')}${ground()}
        <ellipse cx="74" cy="112" rx="16" ry="10" fill="#dff6ff" stroke="${INK}" stroke-width="2.5" opacity=".95"/>
        <ellipse cx="118" cy="112" rx="16" ry="10" fill="#dff6ff" stroke="${INK}" stroke-width="2.5" opacity=".95"/>
        <ellipse cx="96" cy="128" rx="32" ry="28" fill="#f6c445" stroke="${INK}" stroke-width="3.5"/>
        <path d="M76 120h40M78 132h36M80 144h32" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="96" cy="100" r="16" fill="#f6c445" stroke="${INK}" stroke-width="3"/>
        ${eyes(90, 104, 100, 3.6)}
        <path d="M88 82c-2-14 4-16 4-16M104 82c2-14-4-16-4-16" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
        <circle cx="84" cy="66" r="3" fill="${INK}"/><circle cx="108" cy="66" r="3" fill="${INK}"/>
        <path d="M92 108h8" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
    default: {
      const never: never = kind;
      return never;
    }
  }
}

export function speciesById(id: string): Species | undefined {
  return SPECIES.find((item) => item.id === id);
}

export function animalSvg(species: Species): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 210" class="animal-svg" aria-hidden="true">${draw(species.kind)}${totem(species.totemKey)}</svg>`;
}

export function eggSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" class="egg-svg" aria-hidden="true">
    <ellipse cx="60" cy="88" rx="44" ry="56" fill="var(--shell,#f6d7ae)" stroke="#5b3b2a" stroke-width="4"/>
    <ellipse cx="46" cy="66" rx="12" ry="18" fill="#fff" opacity=".45"/>
    <circle cx="78" cy="74" r="5" fill="var(--spot,#efc48e)"/>
    <circle cx="42" cy="102" r="4" fill="var(--spot,#efc48e)"/>
    <circle cx="70" cy="108" r="3.5" fill="var(--spot,#efc48e)"/>
  </svg>`;
}

export interface EggOffer {
  id: 'plain' | 'rare' | 'super';
  name: string;
  cost: number;
  hint: string;
  weights: Record<Rarity, number>;
}

export const EGGS: EggOffer[] = [
  {
    id: 'plain',
    name: '普通蛋',
    cost: 30,
    hint: '多數是普通動物，偶爾有驚喜',
    weights: { common: 78, rare: 19, super: 3 },
  },
  {
    id: 'rare',
    name: '稀有蛋',
    cost: 80,
    hint: '較容易孵出稀有動物',
    weights: { common: 35, rare: 50, super: 15 },
  },
  {
    id: 'super',
    name: '超稀有蛋',
    cost: 150,
    hint: '最有機會遇見超稀有動物',
    weights: { common: 10, rare: 40, super: 50 },
  },
];

export function rollRarity(weights: Record<Rarity, number>, rng: () => number = Math.random): Rarity {
  const total = weights.common + weights.rare + weights.super;
  let roll = rng() * total;
  if ((roll -= weights.common) < 0) return 'common';
  if ((roll -= weights.rare) < 0) return 'rare';
  return 'super';
}

export function rollSpecies(egg: EggOffer, rng: () => number = Math.random): Species {
  const rarity = rollRarity(egg.weights, rng);
  const pool = SPECIES.filter((item) => item.rarity === rarity);
  const index = Math.min(pool.length - 1, Math.floor(rng() * pool.length));
  return pool[index] ?? SPECIES[0];
}
