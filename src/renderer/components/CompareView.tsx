/**
 * 对比视图 — 参数并排展示、自动高亮差异、拖拽排序
 */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import type { CategorySchema, ProductRecord, FieldDef, CompareMode } from '../../shared/schema';
import { Icon, ICONS } from './Icon';
import type { CompareItem } from '../App';

interface Props {
  schemas: CategorySchema[];
  queue: CompareItem[];
  onRemove: (item: CompareItem) => void;
  onReorder: (from: number, to: number) => void;
  onClear: () => void;
  onBack: () => void;
}

export const CompareView: React.FC<Props> = ({
  schemas,
  queue,
  onRemove,
  onReorder,
  onClear,
  onBack
}) => {
  const [records, setRecords] = useState<(ProductRecord | null)[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const rs = await Promise.all(
        queue.map(async (q) => {
          const schema = schemas.find((s) => s.id === q.categoryId);
          if (!schema) return null;
          return window.db.get(q.categoryId, q.id);
        })
      );
      setRecords(rs);
    })();
  }, [queue, schemas]);

  // 按 schema 分组队列（同品类才能横向对比）
  const grouped = useMemo(() => {
    const map = new Map<string, { items: CompareItem[]; records: (ProductRecord | null)[] }>();
    queue.forEach((q, i) => {
      if (!map.has(q.categoryId)) {
        map.set(q.categoryId, { items: [], records: [] });
      }
      map.get(q.categoryId)!.items.push(q);
      map.get(q.categoryId)!.records.push(records[i] ?? null);
    });
    return map;
  }, [queue, records]);

  const handleDragStart = (i: number) => setDragIndex(i);
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setOverIndex(i);
  };
  const handleDrop = (i: number) => {
    if (dragIndex !== null && dragIndex !== i) {
      onReorder(dragIndex, i);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  if (queue.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><Icon size={28} paths={ICONS.compare} /></div>
        <div className="empty-state-title">对比队列为空</div>
        <div className="empty-state-desc">在列表页选中产品后点击"加入对比"，最多可同时对比 4 款产品</div>
        <button className="btn btn-primary" onClick={onBack} style={{ marginTop: 8 }}>
          浏览产品列表
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="compare-toolbar">
        <button className="back-btn" onClick={onBack}>
          <Icon size={14} paths={ICONS.back} />
          返回
        </button>
        <span className="compare-mode-label">COMPARE MODE</span>
        <span className="count-badge">{queue.length}</span>
        <span style={{ fontSize: 13, color: 'var(--apple-muted-foreground)' }}>
          拖拽列头调整顺序 · 同品类参数并排展示 · 自动高亮差异
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-secondary" onClick={onClear}>
            <Icon size={14} paths={ICONS.trash} />
            清空队列
          </button>
        </div>
      </div>

      <div className="compare-scroll-wrap">
        {Array.from(grouped.entries()).map(([catId, group]) => {
          const schema = schemas.find((s) => s.id === catId)!;
          return (
            <CompareTable
              key={catId}
              schema={schema}
              items={group.items}
              records={group.records}
              onRemove={onRemove}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              dragIndex={dragIndex}
              overIndex={overIndex}
              globalQueue={queue}
              globalRecords={records}
            />
          );
        })}
      </div>
    </>
  );
};

interface TableProps {
  schema: CategorySchema;
  items: CompareItem[];
  records: (ProductRecord | null)[];
  onRemove: (item: CompareItem) => void;
  onDragStart: (i: number) => void;
  onDragOver: (e: React.DragEvent, i: number) => void;
  onDrop: (i: number) => void;
  dragIndex: number | null;
  overIndex: number | null;
  globalQueue: CompareItem[];
  globalRecords: (ProductRecord | null)[];
}

const CompareTable: React.FC<TableProps> = ({
  schema,
  items,
  records,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  dragIndex,
  overIndex,
  globalQueue,
  globalRecords
}) => {
  const cols = items.length + 1; // 1 label column + items
  const headerRow = `'auto repeat(${items.length}, minmax(200px, 1fr))`;

  // 字段按 group 顺序展开
  const allFields = useMemo(() => {
    return schema.groups.flatMap((g) =>
      schema.fields.filter((f) => f.group === g.id)
    );
  }, [schema]);

  // 计算每个数值字段的"最佳值"
  const computeBest = (field: FieldDef): Set<number> => {
    const best = new Set<number>();
    if (field.compare === 'none' || field.compare === 'text' || items.length < 2) return best;
    const nums: { idx: number; val: number }[] = [];
    items.forEach((_, i) => {
      const r = records[i];
      if (!r) return;
      const v = r[field.key];
      if (v === null || v === undefined || v === '') return;
      const n = field.type === 'number' || field.type === 'price' || field.type === 'year' ? Number(v) : parseFloat(String(v));
      if (!isNaN(n)) nums.push({ idx: i, val: n });
    });
    if (nums.length < 2) return best;
    if (field.compare === 'higher-better') {
      const max = Math.max(...nums.map((n) => n.val));
      nums.forEach((n) => { if (n.val === max) best.add(n.idx); });
    } else if (field.compare === 'lower-better') {
      const min = Math.min(...nums.map((n) => n.val));
      nums.forEach((n) => { if (n.val === min) best.add(n.idx); });
    }
    return best;
  };

  // 字段是否所有值都相同
  const isAllSame = (field: FieldDef): boolean => {
    const vals = items.map((_, i) => {
      const r = records[i];
      return r ? String(r[field.key] ?? '') : '';
    });
    return vals.length > 1 && vals.every((v) => v === vals[0]);
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div className="group-header" style={{ marginBottom: 12 }}>
        <span className="group-title">{schema.name}</span>
        <span className="group-count">{items.length} 款产品</span>
      </div>

      <div className="compare-table" style={{ gridTemplateColumns: headerRow }}>
        {/* 表头行 */}
        <div className="ct-label" style={{ borderBottom: '1px solid var(--apple-border)' }}>
          参数项
        </div>
        {items.map((item, i) => {
          const r = records[i];
          const isGlobalIdx = globalQueue.findIndex(
            (q) => q.categoryId === item.categoryId && q.id === item.id
          );
          return (
            <div
              key={`${item.categoryId}-${item.id}`}
              className="ct-header"
              draggable
              onDragStart={() => onDragStart(isGlobalIdx)}
              onDragOver={(e) => onDragOver(e, isGlobalIdx)}
              onDrop={() => onDrop(isGlobalIdx)}
              style={{
                opacity: dragIndex === isGlobalIdx ? 0.5 : 1,
                background: overIndex === isGlobalIdx && dragIndex !== null ? 'var(--apple-brand-50)' : undefined,
                borderLeft: overIndex === isGlobalIdx && dragIndex !== null ? '2px solid var(--apple-primary)' : undefined
              }}
            >
              <div className="ct-header-top">
                <span className="ct-grip">
                  <Icon size={14} paths={ICONS.grip} />
                </span>
                <span className="ct-header-title">{r ? String(r[schema.nameField]) : '加载中…'}</span>
                <button className="ct-close" onClick={() => onRemove(item)}>
                  <Icon size={12} paths={ICONS.close} />
                </button>
              </div>
              {r && (
                <>
                  <span className="ct-subtitle">
                    {r[schema.brandField] && (
                      <span className="brand-tag" style={{ fontSize: 11 }}>
                        <span className="brand-dot" style={{ background: schema.brandColors?.[String(r[schema.brandField])] || 'var(--apple-text-400)' }} />
                        {String(r[schema.brandField])}
                      </span>
                    )}
                  </span>
                  {(schema.subtitleFields || []).map((k) => {
                    const v = r[k];
                    if (!v) return null;
                    return <span key={k} className="ct-tag blue">{String(v)}</span>;
                  })}
                </>
              )}
            </div>
          );
        })}

        {/* 字段行 */}
        {allFields.map((field) => {
          const bestSet = computeBest(field);
          const allSame = isAllSame(field);
          const hasDiff = !allSame && items.length > 1;
          return (
            <React.Fragment key={field.key}>
              <div className="ct-label">
                {field.label}
                {field.unit && (
                  <span style={{ marginLeft: 4, opacity: 0.6 }}>({field.unit})</span>
                )}
              </div>
              {items.map((_, i) => {
                const r = records[i];
                const v = r ? r[field.key] : null;
                const formatted =
                  v === null || v === undefined || v === ''
                    ? '—'
                    : field.type === 'price'
                    ? `¥${Number(v).toLocaleString()}`
                    : field.type === 'year'
                    ? String(Math.round(Number(v)))
                    : String(v);
                const isBest = bestSet.has(i);
                const isDiff = hasDiff && formatted !== '—';
                return (
                  <div
                    key={i}
                    className={`ct-cell ${field.mono ? 'mono' : ''} ${isBest ? 'best' : ''} ${isDiff ? 'diff-row' : ''}`}
                  >
                    {formatted}
                    {isBest && (
                      <span className="ct-tag green" style={{ marginLeft: 8, fontSize: 9 }}>
                        BEST
                      </span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
