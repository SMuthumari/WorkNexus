import type { Skill } from './types';

export const SKILL_ICONS: Record<Skill, string> = {
  picker: '📦',
  packer: '📮',
  forklift: '🚜',
  driver: '🚚',
};

export const SKILL_LABELS_EN: Record<Skill, string> = {
  picker: 'Picker',
  packer: 'Packer',
  forklift: 'Forklift Operator',
  driver: 'Driver',
};

export const SKILL_LABELS_TA: Record<Skill, string> = {
  picker: 'பிக்கர்',
  packer: 'பேக்கர்',
  forklift: 'ஃபோர்க்லிஃப்ட்',
  driver: 'டிரைவர்',
};

export type Lang = 'en' | 'ta';

export const ZONES = [
  'Zone A — North',
  'Zone B — South',
  'Zone C — East',
  'Zone D — West',
  'Zone E — Central',
];
