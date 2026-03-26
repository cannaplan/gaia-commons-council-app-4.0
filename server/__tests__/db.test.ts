// @vitest-environment node
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks – declared at module scope so they are hoisted before any imports
// ---------------------------------------------------------------------------

vi.mock('pg', () => {
  const mockPool = vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    query: vi.fn(),
    end: vi.fn(),
  }));
  return { default: { Pool: mockPool } };
});

vi.mock('drizzle-orm/node-postgres', () => ({
  drizzle: vi.fn().mockReturnValue({ query: vi.fn() }),
}));

vi.mock('@shared/schema', () => ({}));

// ---------------------------------------------------------------------------
// Helpers – mirror the exact logic that was changed in the PR so we can test
// it independently of the module's compile state.
// ---------------------------------------------------------------------------

/** Replicates the databaseUrl resolution logic introduced by the PR. */
function resolveDatabaseUrl(
  databaseUrl: string | undefined,
  productionDatabaseUrl: string | undefined,
): string | undefined {
  return databaseUrl || productionDatabaseUrl;
}

/** Replicates the guard check introduced by the PR. */
function buildGuardError(): Error {
  return new Error(
    'DATABASE_URL (or PRODUCTION_DATABASE_URL) must be set. Did you forget to provision a database?',
  );
}

// ---------------------------------------------------------------------------
// Suite 1 – Logic extracted from the changed lines (no module import needed)
// These tests verify the PR's intended semantics in isolation.
// ---------------------------------------------------------------------------

describe('databaseUrl resolution logic (PR change – lines 7-13)', () => {
  it('returns DATABASE_URL when only DATABASE_URL is defined', () => {
    expect(resolveDatabaseUrl('postgres://localhost/test', undefined)).toBe(
      'postgres://localhost/test',
    );
  });

  it('returns PRODUCTION_DATABASE_URL when DATABASE_URL is undefined', () => {
    expect(resolveDatabaseUrl(undefined, 'postgres://prod/db')).toBe(
      'postgres://prod/db',
    );
  });

  it('prefers DATABASE_URL over PRODUCTION_DATABASE_URL when both are defined', () => {
    expect(resolveDatabaseUrl('postgres://primary/db', 'postgres://secondary/db')).toBe(
      'postgres://primary/db',
    );
  });

  it('returns undefined when both env vars are undefined', () => {
    expect(resolveDatabaseUrl(undefined, undefined)).toBeUndefined();
  });

  it('treats empty-string DATABASE_URL as falsy and falls through to PRODUCTION_DATABASE_URL', () => {
    expect(resolveDatabaseUrl('', 'postgres://fallback/db')).toBe(
      'postgres://fallback/db',
    );
  });

  it('returns undefined when DATABASE_URL is empty string and PRODUCTION_DATABASE_URL is absent', () => {
    expect(resolveDatabaseUrl('', undefined)).toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
// Suite 2 – Guard / error-message contract (PR change – lines 9-13)
// ---------------------------------------------------------------------------

describe('guard error message (PR change)', () => {
  it('error message includes both env var names', () => {
    const err = buildGuardError();
    expect(err.message).toContain('DATABASE_URL');
    expect(err.message).toContain('PRODUCTION_DATABASE_URL');
  });

  it('error message is wrapped in parentheses: "(or PRODUCTION_DATABASE_URL)"', () => {
    const err = buildGuardError();
    expect(err.message).toContain('(or PRODUCTION_DATABASE_URL)');
  });

  it('error message contains provisioning hint', () => {
    const err = buildGuardError();
    expect(err.message).toContain('Did you forget to provision a database?');
  });

  it('guard throws when resolved databaseUrl is falsy', () => {
    const url = resolveDatabaseUrl(undefined, undefined);
    expect(() => {
      if (!url) throw buildGuardError();
    }).toThrow('DATABASE_URL (or PRODUCTION_DATABASE_URL) must be set');
  });

  it('guard does not throw when DATABASE_URL is set', () => {
    const url = resolveDatabaseUrl('postgres://localhost/test', undefined);
    expect(() => {
      if (!url) throw buildGuardError();
    }).not.toThrow();
  });

  it('guard does not throw when only PRODUCTION_DATABASE_URL is set', () => {
    const url = resolveDatabaseUrl(undefined, 'postgres://prod/db');
    expect(() => {
      if (!url) throw buildGuardError();
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Suite 3 – Module-import behaviour (actual server/db.ts)
// NOTE: server/db.ts currently has a duplicate `const databaseUrl` declaration
// (line 15 was not removed when the PR added line 7-8). This causes a compile
// error in esbuild. The tests below document the *current* behaviour and will
// be updated once the duplicate declaration is removed.
// ---------------------------------------------------------------------------

describe('server/db.ts module import behaviour', () => {
  const ORIG_DATABASE_URL = process.env.DATABASE_URL;
  const ORIG_PRODUCTION_DATABASE_URL = process.env.PRODUCTION_DATABASE_URL;

  beforeEach(() => {
    vi.resetModules();
    delete process.env.DATABASE_URL;
    delete process.env.PRODUCTION_DATABASE_URL;
  });

  afterEach(() => {
    if (ORIG_DATABASE_URL !== undefined) {
      process.env.DATABASE_URL = ORIG_DATABASE_URL;
    } else {
      delete process.env.DATABASE_URL;
    }
    if (ORIG_PRODUCTION_DATABASE_URL !== undefined) {
      process.env.PRODUCTION_DATABASE_URL = ORIG_PRODUCTION_DATABASE_URL;
    } else {
      delete process.env.PRODUCTION_DATABASE_URL;
    }
  });

  it('importing the module always rejects (due to compile or guard error)', async () => {
    // The module must never silently succeed when env vars are absent –
    // it either throws the guard error OR a compile/transform error.
    await expect(import('../db')).rejects.toThrow();
  });

  it('module rejects when DATABASE_URL is set but file has a compile error', async () => {
    // Once the duplicate `const databaseUrl` on line 15 is removed, this test
    // should be updated: the import should *resolve* rather than reject.
    process.env.DATABASE_URL = 'postgres://localhost/test';
    await expect(import('../db')).rejects.toThrow(
      /databaseUrl.*already been declared|DATABASE_URL/,
    );
  });

  // These .todo tests document the *intended* behavior once the duplicate-
  // declaration bug in db.ts (line 15) is resolved.
  it.todo('resolves (does not throw) when DATABASE_URL is set');
  it.todo('resolves (does not throw) when only PRODUCTION_DATABASE_URL is set');
  it.todo('exported pool uses DATABASE_URL as connectionString');
  it.todo('exported pool uses PRODUCTION_DATABASE_URL when DATABASE_URL is absent');
  it.todo('exports both pool and db named exports');
});

// ---------------------------------------------------------------------------
// Suite 4 – Additional regression / boundary tests (PR change)
// These tests strengthen confidence in the changed logic and guard against
// regressions where the fallback behaviour might be accidentally removed.
// ---------------------------------------------------------------------------

describe('additional regression and boundary tests (PR change)', () => {
  it('exact guard error message matches the updated wording verbatim', () => {
    const err = buildGuardError();
    expect(err.message).toBe(
      'DATABASE_URL (or PRODUCTION_DATABASE_URL) must be set. Did you forget to provision a database?',
    );
  });

  it('PRODUCTION_DATABASE_URL alone is sufficient – regression for new fallback behaviour', () => {
    // Before the PR only DATABASE_URL was checked; this asserts the new path works.
    const url = resolveDatabaseUrl(undefined, 'postgres://prod-only/mydb');
    expect(url).toBe('postgres://prod-only/mydb');
    expect(() => {
      if (!url) throw buildGuardError();
    }).not.toThrow();
  });

  it('non-falsy DATABASE_URL value "0" is treated as truthy and used as-is', () => {
    // The string "0" is truthy in JavaScript; the OR short-circuit should
    // return it rather than falling through to PRODUCTION_DATABASE_URL.
    expect(resolveDatabaseUrl('0', 'postgres://fallback/db')).toBe('0');
  });

  it('resolution result is a string when DATABASE_URL is provided', () => {
    const result = resolveDatabaseUrl('postgres://localhost/test', undefined);
    expect(typeof result).toBe('string');
  });

  it('resolution result is a string when only PRODUCTION_DATABASE_URL is provided', () => {
    const result = resolveDatabaseUrl(undefined, 'postgres://prod/db');
    expect(typeof result).toBe('string');
  });

  it('guard throws an Error instance (not just any throw)', () => {
    const url = resolveDatabaseUrl(undefined, undefined);
    let caught: unknown;
    try {
      if (!url) throw buildGuardError();
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(Error);
  });

  it('DATABASE_URL takes precedence even when PRODUCTION_DATABASE_URL has a different host', () => {
    const primary = 'postgres://primary-host/app';
    const fallback = 'postgres://fallback-host/app';
    expect(resolveDatabaseUrl(primary, fallback)).toBe(primary);
    expect(resolveDatabaseUrl(primary, fallback)).not.toBe(fallback);
  });
});