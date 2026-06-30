import { SubjectId } from '@/contexts/UserContext';

export const SUBJECTS = [
  { id: 'nl', label: 'Nederlands' },
  { id: 'math', label: 'Wiskunde' },
  { id: 'engels', label: 'Engels' },
  { id: 'hist', label: 'Geschiedenis' },
  { id: 'geo', label: 'Aardrijkskunde' },
  { id: 'biologie', label: 'Biologie' },
  { id: 'natuurkunde', label: 'Natuurkunde' },
];

export const SUBJECT_LABELS: Record<string, string> = {
  nl: 'Nederlands',
  math: 'Wiskunde',
  engels: 'Engels',
  hist: 'Geschiedenis',
  geo: 'Aardrijkskunde',
  biologie: 'Biologie',
  natuurkunde: 'Natuurkunde',
} as const;

export const SUBJECT_ICONS: Record<string, string> = {
  nl: '📚',
  math: '🔢',
  engels: '🇬🇧',
  hist: '🌍',
  geo: '🗺️',
  biologie: '🧬',
  natuurkunde: '⚛️',
} as const;

// Levels voor gebruikers
export const LEVELS = [
  { id: 'basis', label: 'Basis' },
  { id: 'gevorderd', label: 'Gevorderd' },
];

// Grades/klassen
export const GRADES = [
  { id: 'VWO 1', label: 'VWO 1' },
  { id: 'VWO 2', label: 'VWO 2' },
  { id: 'VWO 3', label: 'VWO 3' },
]; 