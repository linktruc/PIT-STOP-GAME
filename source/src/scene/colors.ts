import type { Room } from '../types';
/** Public team palette is hex-only; Solo and menu retain the default uniform. */
export function teamCrewColor(room?: Pick<Room, 'solo' | 'color'> | null): string | null {
  return room && !room.solo && /^#[0-9a-f]{6}$/i.test(room.color) ? room.color.toLowerCase() : null;
}
