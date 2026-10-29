import { describe, it, expect } from 'vitest';
import { assignRoles, playableRoleFamily } from '../src/engine';
import { ROLES, type Player, type Role } from '../src/types';

function seeded(seed: number) { let state = seed; return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; }; }
const crew = (count: number): Player[] => Array.from({length: count}, (_, i) => ({ id: String(i), nickname: `p${i}`, role: 'FRONT_JACK', ready: true, joinedAt: i }));
const family = (role: Role) => playableRoleFamily(role);
const core = ['GUNNER','JACK','WHEEL_ON','WHEEL_OFF','RELEASE'];

describe('V14 first-cover-five then gunner/jack priority', () => {
  for (let seed = 0; seed < 100; seed++) {
    it(`seed ${seed}: roles are unique, progressively cover families, then fill wheel specialists`, () => {
      const roster = assignRoles(crew(15), seeded(seed));
      expect(new Set(roster.map(p => p.role)).size).toBe(15);
      expect(new Set(roster.slice(0, 5).map(p => family(p.role)))).toEqual(new Set(core));
      expect(family(roster[0].role)).toBe('JACK');
      for (let count = 1; count <= 5; count++) expect(new Set(roster.slice(0, count).map(p => family(p.role))).size).toBe(count);
      for (let idx = 5; idx < 9; idx++) expect(['GUNNER','JACK']).toContain(family(roster[idx].role));
      for (let idx = 9; idx < 15; idx++) expect(['WHEEL_OFF','WHEEL_ON']).toContain(family(roster[idx].role));
      expect(roster.filter(p => family(p.role) === 'GUNNER')).toHaveLength(4);
      expect(roster.filter(p => family(p.role) === 'JACK')).toHaveLength(2);
      expect(roster.filter(p => family(p.role) === 'WHEEL_OFF')).toHaveLength(4);
      expect(roster.filter(p => family(p.role) === 'WHEEL_ON')).toHaveLength(4);
      expect(roster.filter(p => family(p.role) === 'RELEASE')).toHaveLength(1);
      expect(roster.every(p => p.ready === false && ROLES.includes(p.role))).toBe(true);
    });
  }
  it('preserves 15-slot cap and rejects duplicate identity', () => {
    expect(() => assignRoles(crew(16))).toThrow(/15/);
    expect(() => assignRoles([crew(1)[0],crew(1)[0]])).toThrow(/unique/);
  });
});
