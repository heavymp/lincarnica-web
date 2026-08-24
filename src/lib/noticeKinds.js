export const NOTICE_KINDS = [
  {
    id: 'obavijest',
    label: 'Obavijest',
    emoji: '📢',
    hint: 'Opća vijest za mještane'
  },
  {
    id: 'sastanak',
    label: 'Sastanak',
    emoji: '🤝',
    hint: 'Skupština ili sastanak'
  },
  {
    id: 'dogadaj',
    label: 'Događaj',
    emoji: '📅',
    hint: 'Akcija, radionica, termin'
  },
  {
    id: 'festa',
    label: 'Fešta',
    emoji: '🎉',
    hint: 'Proslava ili zabava'
  }
];

export const NOTICE_EMOJIS = [
  '📢',
  '🤝',
  '📅',
  '🎉',
  '⚠️',
  '⛪',
  '🌊',
  '🐟',
  '🌿',
  '🎵',
  '🧹',
  '🗳️',
  '⚽',
  '❤️',
  '⭐',
  '🪵'
];

export function kindMeta(kind) {
  return NOTICE_KINDS.find((item) => item.id === kind) ?? NOTICE_KINDS[0];
}
