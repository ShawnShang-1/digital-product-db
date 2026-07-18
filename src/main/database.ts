import Database from 'better-sqlite3';
import { app } from 'electron';
import { existsSync, mkdirSync, rmSync, writeFileSync, unlinkSync, statSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { schemas } from '../shared/schemas';
import { seedRegistry } from '../shared/seed';
import type { CategorySchema, FieldDef, ListQuery, ProductRecord } from '../shared/schema';

let db: Database.Database;

/** 字段类型 → SQLite 列类型 */
function columnType(field: FieldDef): string {
  switch (field.type) {
    case 'number':
    case 'price':
    case 'year':
      return 'REAL';
    case 'text':
    case 'textarea':
    case 'select':
    default:
      return 'TEXT';
  }
}

/** 根据建表 schema */
function createTable(schema: CategorySchema): void {
  const cols = [
    'id INTEGER PRIMARY KEY AUTOINCREMENT',
    'created_at TEXT DEFAULT CURRENT_TIMESTAMP',
    'updated_at TEXT DEFAULT CURRENT_TIMESTAMP'
  ];
  for (const f of schema.fields) {
    cols.push(`"${f.key}" ${columnType(f)}`);
  }
  const sql = `CREATE TABLE IF NOT EXISTS "${schema.tableName}" (${cols.join(', ')})`;
  db.exec(sql);

  // 迁移：补充新字段（兼容 schema 升级）
  const existing = db.prepare(`PRAGMA table_info("${schema.tableName}")`).all() as { name: string }[];
  const existingKeys = new Set(existing.map((r) => r.name));
  for (const f of schema.fields) {
    if (!existingKeys.has(f.key)) {
      db.exec(`ALTER TABLE "${schema.tableName}" ADD COLUMN "${f.key}" ${columnType(f)}`);
    }
  }
}

/** 初始化数据库 */
export function initDatabase(): void {
  console.log('[db] home:', homedir(), 'cwd:', process.cwd());
  // 候选数据目录（按优先级）
  const candidates = [
    app.getPath('userData'),
    join(homedir(), '.digital-product-db'),
    join(process.cwd(), '.data', 'sqlite')
  ];
  let dataDir = '';
  let lastErr: any;
  for (const c of candidates) {
    try {
      console.log('[db] trying dir:', c);
      if (!existsSync(c)) mkdirSync(c, { recursive: true });
      // 探测可写：清理历史 .probe 残留（可能是目录或文件），再写入测试文件
      const probe = join(c, '.probe');
      if (existsSync(probe)) {
        try {
          const st = statSync(probe);
          if (st.isDirectory()) rmSync(probe, { recursive: true, force: true });
          else unlinkSync(probe);
        } catch { /* ignore */ }
      }
      writeFileSync(probe, 'ok');
      try { unlinkSync(probe); } catch { /* ignore */ }
      dataDir = c;
      console.log('[db] using dir:', dataDir);
      break;
    } catch (e) {
      console.warn('[db] dir not writable:', c, (e as Error).message);
      lastErr = e;
    }
  }
  if (!dataDir) {
    throw new Error(`No writable data directory available. Last error: ${lastErr?.message}`);
  }

  const dbPath = join(dataDir, 'product-db.sqlite');
  console.log('[db] database file path:', dbPath);
  try {
    db = new Database(dbPath);
  } catch (e) {
    console.error('[db] failed to open database:', e);
    throw e;
  }
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  for (const schema of schemas) {
    createTable(schema);
  }
  console.log('[db] initialized successfully');
}

export function getDB(): Database.Database {
  return db;
}

function getSchemaById(categoryId: string): CategorySchema {
  const s = schemas.find((x) => x.id === categoryId);
  if (!s) throw new Error(`Unknown category: ${categoryId}`);
  return s;
}

/** 列表查询 */
export function listRecords(query: ListQuery): ProductRecord[] {
  const schema = getSchemaById(query.categoryId);
  const where: string[] = [];
  const params: any[] = [];

  if (query.search) {
    const like = `%${query.search}%`;
    const ors = schema.fields
      .filter((f) => f.type === 'text' || f.type === 'select')
      .map((f) => `"${f.key}" LIKE ?`);
    where.push(`(${ors.join(' OR ')})`);
    schema.fields
      .filter((f) => f.type === 'text' || f.type === 'select')
      .forEach(() => params.push(like));
  }

  if (query.filters) {
    for (const [k, values] of Object.entries(query.filters)) {
      if (!values || values.length === 0) continue;
      // 白名单校验：只允许 schema 已定义的字段参与筛选
      const fieldDef = schema.fields.find((f) => f.key === k);
      if (!fieldDef) continue;
      const placeholders = values.map(() => '?').join(', ');
      where.push(`"${k}" IN (${placeholders})`);
      params.push(...values);
    }
  }

  let sql = `SELECT * FROM "${schema.tableName}"`;
  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;

  const applySort = (field: string, direction: 'asc' | 'desc') => {
    const dir = direction === 'desc' ? 'DESC' : 'ASC';
    // 数值类字段排序时显式 CAST，避免字符串排序
    const fieldDef = schema.fields.find((f) => f.key === field);
    if (fieldDef && (fieldDef.type === 'number' || fieldDef.type === 'price' || fieldDef.type === 'year')) {
      sql += ` ORDER BY CAST("${field}" AS REAL) ${dir} NULLS LAST`;
    } else {
      sql += ` ORDER BY "${field}" ${dir} NULLS LAST`;
    }
  };

  if (query.sort) {
    // 白名单校验：只允许 schema 已定义的 sortable 字段
    const sortField = schema.fields.find((f) => f.key === query.sort!.field);
    if (sortField) {
      applySort(query.sort.field, query.sort.direction);
    }
  } else if (schema.defaultSort) {
    applySort(schema.defaultSort.field, schema.defaultSort.direction);
  }

  return db.prepare(sql).all(...params) as ProductRecord[];
}

/** 单条查询 */
export function getRecord(categoryId: string, id: number): ProductRecord | null {
  const schema = getSchemaById(categoryId);
  return (db.prepare(`SELECT * FROM "${schema.tableName}" WHERE id = ?`).get(id) as ProductRecord) || null;
}

/** 新建 */
export function createRecord(categoryId: string, data: Record<string, any>): ProductRecord {
  const schema = getSchemaById(categoryId);
  const keys = schema.fields.map((f) => f.key);
  const cols: string[] = [];
  const ph: string[] = [];
  const vals: any[] = [];
  for (const k of keys) {
    if (data[k] !== undefined) {
      cols.push(`"${k}"`);
      ph.push('?');
      vals.push(data[k] ?? null);
    }
  }
  const sql = `INSERT INTO "${schema.tableName}" (${cols.join(', ')}) VALUES (${ph.join(', ')})`;
  const info = db.prepare(sql).run(...vals);
  return getRecord(categoryId, Number(info.lastInsertRowid))!;
}

/** 更新 */
export function updateRecord(categoryId: string, id: number, data: Record<string, any>): ProductRecord {
  const schema = getSchemaById(categoryId);
  const keys = schema.fields.map((f) => f.key);
  const sets: string[] = [];
  const vals: any[] = [];
  for (const k of keys) {
    if (data[k] !== undefined) {
      sets.push(`"${k}" = ?`);
      vals.push(data[k] ?? null);
    }
  }
  sets.push(`updated_at = CURRENT_TIMESTAMP`);
  vals.push(id);
  db.prepare(`UPDATE "${schema.tableName}" SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getRecord(categoryId, id)!;
}

/** 删除 */
export function deleteRecord(categoryId: string, id: number): void {
  const schema = getSchemaById(categoryId);
  db.prepare(`DELETE FROM "${schema.tableName}" WHERE id = ?`).run(id);
}

/** 计数 */
export function countRecords(categoryId: string): number {
  const schema = getSchemaById(categoryId);
  const r = db.prepare(`SELECT COUNT(*) as c FROM "${schema.tableName}"`).get() as { c: number };
  return r.c;
}

/** 全部分类计数 */
export function countAll(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of schemas) {
    const r = db.prepare(`SELECT COUNT(*) as c FROM "${s.tableName}"`).get() as { c: number };
    out[s.id] = r.c;
  }
  return out;
}

/** 获取筛选选项 */
export function getFilterOptions(categoryId: string): Record<string, string[]> {
  const schema = getSchemaById(categoryId);
  const out: Record<string, string[]> = {};
  for (const fk of schema.filters) {
    const field = schema.fields.find((f) => f.key === fk);
    if (!field) continue;
    if (field.options) {
      out[fk] = field.options;
    } else {
      const rows = db.prepare(
        `SELECT DISTINCT "${fk}" as v FROM "${schema.tableName}" WHERE "${fk}" IS NOT NULL ORDER BY "${fk}"`
      ).all() as { v: string }[];
      out[fk] = rows.map((r) => r.v);
    }
  }
  return out;
}

/** 全局搜索：跨所有分类 */
export function searchAll(keyword: string): Record<string, ProductRecord[]> {
  const out: Record<string, ProductRecord[]> = {};
  const like = `%${keyword}%`;
  for (const s of schemas) {
    const textFields = s.fields.filter((f) => f.type === 'text' || f.type === 'select');
    const ors = textFields.map((f) => `"${f.key}" LIKE ?`).join(' OR ');
    const sql = `SELECT * FROM "${s.tableName}" ${ors ? `WHERE ${ors}` : ''} LIMIT 50`;
    const params = ors ? textFields.map(() => like) : [];
    const rows = db.prepare(sql).all(...params) as ProductRecord[];
    if (rows.length) out[s.id] = rows;
  }
  return out;
}

/** 插入示例数据（仅当表为空，或版本更新时幂等追加新条目） */
export function seedIfEmpty(): void {
  // 确保 meta 表存在
  db.exec('CREATE TABLE IF NOT EXISTS _meta (key TEXT PRIMARY KEY, value TEXT)');
  const row = db.prepare("SELECT value FROM _meta WHERE key = 'data_version'").get() as { value: string } | undefined;
  const currentVersion = '4'; // 每次更新 seed 数据后递增此版本号
  const versionChanged = !row || row.value !== currentVersion;

  for (const s of schemas) {
    const seed = seedRegistry[s.id];
    if (!seed || !seed.length) continue;
    const c = countRecords(s.id);

    if (c === 0) {
      // 表为空：全量插入
      const insert = db.prepare(
        `INSERT INTO "${s.tableName}" (${s.fields.map((f) => `"${f.key}"`).join(', ')}) VALUES (${s.fields.map(() => '?').join(', ')})`
      );
      const tx = db.transaction((rows: Record<string, any>[]) => {
        for (const r of rows) {
          insert.run(...s.fields.map((f) => r[f.key] ?? null));
        }
      });
      tx(seed);
      console.log(`[db] seeded ${s.id}: ${seed.length} rows`);
    } else if (versionChanged) {
      // 版本变化但表已有数据：仅追加不存在的条目（按 model 字段去重）
      const existing = db.prepare(`SELECT "${s.nameField}" FROM "${s.tableName}"`).all() as Record<string, any>[];
      const existingNames = new Set(existing.map((r) => r[s.nameField]));
      const newRows = seed.filter((r) => !existingNames.has(r[s.nameField]));
      if (newRows.length > 0) {
        const insert = db.prepare(
          `INSERT INTO "${s.tableName}" (${s.fields.map((f) => `"${f.key}"`).join(', ')}) VALUES (${s.fields.map(() => '?').join(', ')})`
        );
        const tx = db.transaction((rows: Record<string, any>[]) => {
          for (const r of rows) {
            insert.run(...s.fields.map((f) => r[f.key] ?? null));
          }
        });
        tx(newRows);
        console.log(`[db] upserted ${s.id}: ${newRows.length} new rows`);
      }
    }
  }

  // 写入版本号
  db.prepare("INSERT OR REPLACE INTO _meta (key, value) VALUES ('data_version', ?)").run(currentVersion);
  console.log('[db] seed version:', currentVersion);
}
