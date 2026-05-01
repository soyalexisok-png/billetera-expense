export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  name: string;
  tag: string;
  date: string;
}

export interface Tag {
  id: string;
  label: string;
  emoji: string;
}

export const DEFAULT_TAGS: Tag[] = [
  { id: 'compras', label: 'Compras', emoji: '🛍️' },
  { id: 'comida', label: 'Comida', emoji: '🍔' },
  { id: 'transporte', label: 'Transporte', emoji: '⛽' },
  { id: 'vivienda', label: 'Vivienda', emoji: '🔑' },
  { id: 'servicios', label: 'Servicios', emoji: '⚡' },
  { id: 'salud', label: 'Salud', emoji: '💊' },
  { id: 'ocio', label: 'Ocio', emoji: '🎮' },
  { id: 'educacion', label: 'Educación', emoji: '📚' },
  { id: 'trabajo', label: 'Trabajo', emoji: '💼' },
  { id: 'otros', label: 'Otros', emoji: '📦' },
];

export const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#a855f7',
  '#ef4444',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#ec4899',
  '#6366f1',
];
