import Database from 'better-sqlite3';

export const db = new Database('./cache.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS cache (
    key TEXT PRIMARY KEY,
    value TEXT,
    expire INTEGER
  );
`).run();

export function cacheResponse(key: string, data: any, ttl: number): void {
  const expiresAt = Date.now() + (ttl * 1000 * 60 * 60);
  db.prepare(`
    INSERT OR REPLACE INTO cache (key, value, expire)
    VALUES (?, ?, ?);
  `).run(key, JSON.stringify(data), expiresAt);
}

export function getCachedResponse(key: string): any {
  // @ts-ignore
  const stmt = db.prepare(`
    SELECT value FROM cache
    WHERE key = ? AND expire > ?;
  `);
  // @ts-ignore
  const row: Row | undefined = stmt.get(key, Date.now());
  return row ? JSON.parse(row.value) : null;
}

export interface Row {
  value: string;
}

process.on('exit', () => {
  db.close();
});
