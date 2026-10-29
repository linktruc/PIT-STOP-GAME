import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export type DatabaseRole = 'anon' | 'authenticated' | 'service_role';

/** A fresh PostgreSQL engine, with only Supabase's platform identities stubbed. */
export async function createDatabase(setup = 'SUPABASE_SETUP.sql'): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon NOLOGIN;
    CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE service_role NOLOGIN;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid primary key,email text);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
  `);
  const source = await readFile(resolve(setup), 'utf8');
  // PGlite has no Supabase Realtime service. Keep every table, policy, grant,
  // trigger and production function body; omit only publication registration.
  const sql = source
    .replace(/^\s*ALTER\s+PUBLICATION\s+supabase_realtime\s+ADD\s+TABLE\s+[^;]+;/gim, '')
    .replace(/^\s*CREATE\s+PUBLICATION\s+supabase_realtime\b[^;]*;/gim, '');
  await db.exec(sql);
  return db;
}

export function literal(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export function userId(index: number): string {
  return `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;
}

export async function owner<T extends Record<string, unknown> = Record<string, unknown>>(
  db: PGlite,
  sql: string,
): Promise<T[]> {
  const results = await db.exec(`RESET ROLE; ${sql}`);
  return (results.at(-1)?.rows ?? []) as T[];
}

export async function clearDatabase(db: PGlite): Promise<void> {
  const rows = await owner<{ tablename: string }>(db,
    "SELECT tablename FROM pg_tables WHERE schemaname = 'pit_private'");
  const tables = rows.map(({ tablename }) => `pit_private."${tablename.replaceAll('"', '""')}"`);
  tables.push('public.pit_public_state');
  await owner(db, `TRUNCATE TABLE ${tables.join(', ')} RESTART IDENTITY CASCADE;
    SELECT set_config('request.jwt.claim.sub', '', false);`);
}

/** Each batch sets its own claim before invoking the real public RPC. */
export async function rpc<T>(
  db: PGlite,
  user: string | null,
  op: string | null,
  room: string | null = null,
  payload: Record<string, unknown> = {},
  role: DatabaseRole = user ? 'authenticated' : 'anon',
): Promise<T> {
  const invocation = op === null
    ? 'public.pit_state()'
    : `public.pit_call(${literal(op)}, ${room ? `${literal(room)}::uuid` : 'NULL'}, ${literal(JSON.stringify(payload))}::jsonb)`;
  const results = await db.exec(`
    RESET ROLE;
    SET ROLE ${role};
    SELECT set_config('request.jwt.claim.sub', ${literal(user ?? '')}, false);
    SELECT ${invocation} AS snapshot;
  `);
  return (results.at(-1)!.rows[0] as { snapshot: T }).snapshot;
}
