/**
 * 列表视图 — 表格展示 + 排序 + 多选筛选 + 多选对比
 */
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import type { CategorySchema, ProductRecord, ListQuery } from '../../shared/schema';
import { Icon, ICONS } from './Icon';
import type { CompareItem } from '../App';

interface Props {
  schema: CategorySchema;
  onOpenDetail: (id: number) => void;
  onEdit: (id: number | null) => void;
  compareQueue: CompareItem[];
  onToggleCompare: (item: CompareItem) => void;
  onRefresh: () => void;
  /** 当前筛选状态（由 App 控制） */
  filters: Record<string, string[]>;
  /** 当前排序状态（由 App 控制） */
  sort?: { field: string; direction: 'asc' | 'desc' };
  onFiltersChange: (filters: Record<string, string[]>) => void;
  onSortChange: (sort: { field: string; direction: 'asc' | 'desc' } | undefined) => void;
}

export const ListView: React.FC<Props> = ({
  schema,
  onOpenDetail,
  onEdit,
  compareQueue,
  onToggleCompare,
  onRefresh,
  filters,
  sort,
  onFiltersChange,
  onSortChange
}) => {
  const [records, setRecords] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 列表列定义：listColumn 为 true 的字段
  const listColumns = useMemo(
    () => schema.fields.filter((f) => f.listColumn),
    [schema]
  );

  const effectiveSort = sort || schema.defaultSort;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: ListQuery = {
        categoryId: schema.id,
        sort: effectiveSort,
        filters
      };
      const rows = await window.db.list(query);
      setRecords(rows);
    } catch (e) {
      setError('加载失败，请重试');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [schema.id, effectiveSort, filters]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    window.db.filters(schema.id).then(setFilterOptions);
  }, [schema.id, records.length]);

  // 切换分类时重置选中
  useEffect(() => {
    setSelected(new Set());
  }, [schema.id]);

  // 点击外部关闭下拉
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSort = (field: string) => {
    if (effectiveSort?.field === field) {
      const newDir = effectiveSort.direction === 'asc' ? 'desc' : 'asc';
      onSortChange({ field, direction: newDir });
    } else {
      onSortChange({ field, direction: 'desc' });
    }
  };

  const handleFilterToggle = (key: string, value: string) => {
    const current = filters[key] || [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: next });
  };

  const handleFilterClear = (key: string) => {
    const next = { ...filters };
    delete next[key];
    onFiltersChange(next);
  };

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (next.size >= 4) return next;
        next.add(id);
      }
      return next;
    });
  };

  const addSelectedToCompare = () => {
    selected.forEach((id) => {
      onToggleCompare({ categoryId: schema.id, id });
    });
    setSelected(new Set());
  };

  const isInCompare = (id: number) =>
    compareQueue.some((x) => x.categoryId === schema.id && x.id === id);

  const brandColor = (brand: string) =>
    schema.brandColors?.[brand] || 'var(--apple-text-400)';

  const formatCell = (record: ProductRecord, key: string) => {
    const field = schema.fields.find((f) => f.key === key);
    const v = record[key];
    if (v === null || v === undefined || v === '') return <span style={{ color: 'var(--apple-text-300)' }}>—</span>;
    if (field?.type === 'price') return `¥${Number(v).toLocaleString()}`;
    if (field?.type === 'year') return String(Math.round(Number(v)));
    if (field?.unit) return `${v} ${field.unit}`;
    return String(v);
  };

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-left">
          {schema.filters.map((fk) => {
            const field = schema.fields.find((f) => f.key === fk);
            if (!field) return null;
            const opts = filterOptions[fk] || field.options || [];
            const selectedValues = filters[fk] || [];
            const isOpen = openDropdown === fk;
            return (
              <div className="filter-dropdown-wrapper" key={fk} ref={isOpen ? dropdownRef : undefined}>
                <button
                  className={`filter-dropdown-btn ${selectedValues.length > 0 ? 'active' : ''}`}
                  onClick={() => setOpenDropdown(isOpen ? null : fk)}
                >
                  {selectedValues.length > 0
                    ? `${field.label} (${selectedValues.length})`
                    : field.label}
                  <Icon size={10} paths={ICONS.arrowDown} style={{ marginLeft: 4, opacity: 0.5 }} />
                </button>
                {isOpen && (
                  <div className="filter-dropdown-panel">
                    <div className="filter-dropdown-header">
                      <span>{field.label}</span>
                      {selectedValues.length > 0 && (
                        <button className="filter-dropdown-clear" onClick={() => handleFilterClear(fk)}>
                          清除
                        </button>
                      )}
                    </div>
                    <div className="filter-dropdown-list">
                      {opts.map((o) => (
                        <label key={o} className="filter-dropdown-item">
                          <input
                            type="checkbox"
                            checked={selectedValues.includes(o)}
                            onChange={() => handleFilterToggle(fk, o)}
                          />
                          <span className="filter-dropdown-label">{o}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="toolbar-right">
          {selected.size > 0 && (
            <>
              <span style={{ fontSize: 12, color: 'var(--apple-muted-foreground)', marginRight: 4 }}>
                已选 {selected.size}/4
              </span>
              <button className="btn btn-secondary" onClick={addSelectedToCompare}>
                <Icon size={14} paths={ICONS.compare} />
                加入对比
              </button>
            </>
          )}
          <button className="btn btn-primary" onClick={() => onEdit(null)}>
            <Icon size={14} paths={ICONS.plus} />
            新增
          </button>
        </div>
      </div>

      <div className="table-area">
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Icon size={28} paths={ICONS.database} /></div>
            <div className="empty-state-title">加载中…</div>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Icon size={28} paths={ICONS.database} /></div>
            <div className="empty-state-title" style={{ color: 'var(--apple-danger)' }}>{error}</div>
            <button className="btn btn-secondary" onClick={load} style={{ marginTop: 8 }}>重试</button>
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Icon size={28} paths={schema.icon} /></div>
            <div className="empty-state-title">暂无{schema.name}数据</div>
            <div className="empty-state-desc">点击右上角"新增"开始录入你的第一份数据</div>
            <button className="btn btn-primary" onClick={() => onEdit(null)} style={{ marginTop: 8 }}>
              <Icon size={14} paths={ICONS.plus} />
              新增第一条
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="cell-check"></th>
                {listColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`${col.sortable ? 'sortable' : ''} ${
                      effectiveSort?.field === col.key ? 'sorted' : ''
                    } ${effectiveSort?.field === col.key && effectiveSort.direction === 'desc' ? 'sort-desc' : ''}`}
                    style={col.listWidth ? { width: col.listWidth } : undefined}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="th-content">
                      {col.listLabel || col.label}
                      {col.sortable && (
                        <Icon size={12} paths={ICONS.arrowUp} className="sort-arrow" />
                      )}
                    </span>
                  </th>
                ))}
                <th style={{ width: 80, textAlign: 'right' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const sel = selected.has(r.id);
                const cmp = isInCompare(r.id);
                return (
                  <tr
                    key={r.id}
                    className={sel ? 'selected' : ''}
                    tabIndex={0}
                    role="button"
                    aria-label={`查看 ${String(r[schema.nameField] || '')}`}
                    onClick={() => onOpenDetail(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpenDetail(r.id);
                      }
                    }}
                  >
                    <td className="cell-check" onClick={(e) => toggleSelect(r.id, e)}>
                      <div className={`checkbox ${sel || cmp ? 'checked' : ''}`}>
                        <Icon size={12} paths={ICONS.check} />
                      </div>
                    </td>
                    {listColumns.map((col) => {
                      const isName = col.key === schema.nameField;
                      const isBrand = col.key === schema.brandField;
                      if (isName) {
                        return (
                          <td key={col.key} className="cell-name cell-mono">
                            <span onClick={(e) => { e.stopPropagation(); onOpenDetail(r.id); }}>
                              {r[col.key]}
                            </span>
                          </td>
                        );
                      }
                      if (isBrand) {
                        return (
                          <td key={col.key}>
                            <span className="brand-tag">
                              <span className="brand-dot" style={{ background: brandColor(String(r[col.key])) }} />
                              {r[col.key]}
                            </span>
                          </td>
                        );
                      }
                      return (
                        <td key={col.key} className={col.mono ? 'cell-mono' : ''}>
                          {formatCell(r, col.key)}
                        </td>
                      );
                    })}
                    <td className="cell-actions" style={{ textAlign: 'right' }}>
                      <button
                        className={`action-btn ${cmp ? 'active' : ''}`}
                        title={cmp ? '已在对比队列' : '加入对比'}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCompare({ categoryId: schema.id, id: r.id });
                        }}
                        style={cmp ? { color: 'var(--apple-primary)' } : undefined}
                      >
                        <Icon size={14} paths={ICONS.compare} />
                      </button>
                      <button
                        className="action-btn"
                        title="编辑"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(r.id);
                        }}
                      >
                        <Icon size={14} paths={ICONS.edit} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && records.length > 0 && (
        <div className="status-bar">
          <span className="status-dot" />
          <span>共 <strong style={{ color: 'var(--apple-foreground)' }}>{records.length}</strong> 条数据</span>
          {selected.size > 0 && <span>· 已选 {selected.size}</span>}
          {compareQueue.length > 0 && (
            <span style={{ marginLeft: 'auto' }}>对比队列 {compareQueue.length}/4</span>
          )}
        </div>
      )}
    </>
  );
};