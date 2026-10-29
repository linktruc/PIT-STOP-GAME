import type { Round, Task } from './types';

export function formatTime(ms: number): string { return (Math.max(0, ms) / 1000).toFixed(3); }
export function elapsed(round: Round | null | undefined, now: number): number { return round ? round.elapsedMs ?? Math.max(0, (round.finishedAt ?? now) - round.goAt) : 0; }
export function actionLabel(task: Task): string {
  const fixed: Record<string, string> = { FRONT_LIFT: 'LIFT FRONT', REAR_LIFT: 'LIFT REAR', FRONT_LOWER: 'LOWER FRONT', REAR_LOWER: 'LOWER REAR', GREEN_RELEASE: 'RELEASE CAR' };
  if (fixed[task.id]) return fixed[task.id];
  return task.id.endsWith('GUN_LOOSEN') ? 'LOOSEN NUT' : task.id.endsWith('GUN_TIGHTEN') ? 'TIGHTEN NUT' : task.id.endsWith('WHEEL_OFF') ? 'REMOVE OLD WHEEL' : 'FIT NEW WHEEL';
}
