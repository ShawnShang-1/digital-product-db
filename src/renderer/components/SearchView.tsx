/**
 * 全局搜索结果页 — 跨分类模糊搜索，结果按类别分组，关键词高亮
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { CategorySchema, ProductRecord } from '../../shared/schema';
import { Icon, ICONS } from './Icon';

interface Props {
  schemas: CategorySchema[];
  keyword: string;
  onOpenDetail: (categoryId: string, id: number) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export const SearchView: React.FC<Props> = ({ schemas, keyword, onOpenDetail, searchInputRef }) => {
  const [results, setResults] = useState<Record<string, ProductRecord[]>>({});
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [localKeyword, setLocalKeyword] = useState(keyword);

  useEffect(() => {
    setLocalKeyword(keyword);
  }, [keyword]);

  const doSearch = useCallback(async (kw: string) => {
    if (!kw.trim()) {
      setResults({});
      return;
    }
    setLoading(true);
    const r = await window.db.search(kw.trim());
    setResults(r);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(localKeyword), 200);
    return () => clearTimeout(t);
  }, [localKeyword, doSearch]);

  const totalCount = useMemo(
    () => Object.values(results).reduce((sum, arr) => sum + arr.length, 0),
    [results]
  );

  const visibleCategories = useMemo(() => {
    return schemas.filter((s) => (activeCategory === 'all' ? results[s.id]?.length : s.id === activeCategory));
  }, [schemas, results, activeCategory]);

  const highlight = (text: string) => {
    if (!localKeyword.trim()) return text;
    const kw = localKeyword.trim();
    const idx = text.toLowerCase().indexOf(kw.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="hl">{text.slice(idx, idx + kw.length)}</span>
        {text.slice(idx + kw.length)}
      </>
    );
  };

  const formatSpecs = (schema: CategorySchema, r: ProductRecord) => {
    const fields = schema.summaryFields || [];
    return fields
      .map((k) => {
        const f = schema.fields.find((x) => x.key === k);
        const v = r[k];
        if (!v || !f) return null;
        return `${f.label}: ${v}`;
      })
      .filter(Boolean)
      .join(' · ');
  };

  return (
    <>
      <div className="search-header">
        <div className="search-field-large">
          <Icon size={16} paths={ICONS.search} color="var(--apple-text-400)" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="搜索型号、品牌、关键参数…"
            value={localKeyword}
            onChange={(e) => setLocalKeyword(e.target.value)}
            autoFocus
          />
          {localKeyword && (
            <button className="search-clear" onClick={() => setLocalKeyword('')}>
              <Icon size={12} paths={ICONS.close} />
            </button>
          )}
        </div>
        <div className="search-meta">
          <div className="search-stats">
            {loading ? (
              '搜索中…'
            ) : localKeyword.trim() ? (
              <>共找到 <strong>{totalCount}</strong> 条匹配「{localKeyword}」的结果</>
            ) : (
              '输入关键词进行全局搜索'
            )}
          </div>
          <div className="filter-chips">
            <button
              className={`chip ${activeCategory === 'all' ? 'chip-active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              全部
            </button>
            {schemas.filter((s) => results[s.id]?.length).map((s) => (
              <button
                key={s.id}
                className={`chip ${activeCategory === s.id ? 'chip-active' : ''}`}
                onClick={() => setActiveCategory(s.id)}
              >
                {s.name} ({results[s.id].length})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="results-scroll">
        {!localKeyword.trim() ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Icon size={28} paths={ICONS.search} /></div>
            <div className="empty-state-title">输入关键词开始搜索</div>
            <div className="empty-state-desc">搜索将跨越所有分类，匹配型号名称、品牌及关键参数</div>
          </div>
        ) : totalCount === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Icon size={28} paths={ICONS.search} /></div>
            <div className="empty-state-title">没有找到匹配的结果</div>
            <div className="empty-state-desc">尝试更换关键词或简化搜索条件</div>
          </div>
        ) : (
          visibleCategories.map((schema) => {
            const list = results[schema.id] || [];
            if (!list.length) return null;
            return (
              <div className="result-group" key={schema.id}>
                <div className="group-header">
                  <Icon size={16} paths={schema.icon} color="var(--apple-primary)" />
                  <span className="group-title">{schema.name}</span>
                  <span className="group-count">{list.length} 条</span>
                </div>
                <div className="result-list">
                  {list.map((r) => (
                    <div
                      key={r.id}
                      className="result-row"
                      onClick={() => onOpenDetail(schema.id, r.id)}
                    >
                      <div className="result-category-icon">
                        <Icon size={18} paths={schema.icon} />
                      </div>
                      <div className="result-info">
                        <div className="result-name">
                          {highlight(String(r[schema.nameField] || ''))}
                        </div>
                        <div className="result-brand">
                          {schema.brandField && r[schema.brandField] && (
                            <span className="brand-tag" style={{ fontSize: 11 }}>
                              <span
                                className="brand-dot"
                                style={{
                                  background:
                                    schema.brandColors?.[String(r[schema.brandField])] ||
                                    'var(--apple-text-400)'
                                }}
                              />
                              {String(r[schema.brandField])}
                            </span>
                          )}
                        </div>
                        <div className="result-specs">{formatSpecs(schema, r)}</div>
                      </div>
                      <div className="result-action">
                        查看
                        <Icon size={12} paths={ICONS.chevronRight} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};
