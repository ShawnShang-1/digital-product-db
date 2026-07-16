/**
 * 侧边栏 — 全局搜索框 + 分类导航 + 对比入口
 */
import React from 'react';
import type { CategorySchema } from '../../shared/schema';
import { Icon, ICONS } from './Icon';

interface Props {
  schemas: CategorySchema[];
  counts: Record<string, number>;
  currentCategoryId: string;
  onSelectCategory: (id: string) => void;
  searchKeyword: string;
  onSearch: (kw: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  compareCount: number;
  onOpenCompare: () => void;
}

export const Sidebar: React.FC<Props> = ({
  schemas,
  counts,
  currentCategoryId,
  onSelectCategory,
  searchKeyword,
  onSearch,
  searchInputRef,
  compareCount,
  onOpenCompare
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-search">
        <div className="search-field">
          <span className="search-icon">
            <Icon size={14} paths={ICONS.search} />
          </span>
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="搜索全部产品…"
            value={searchKeyword}
            onChange={(e) => onSearch(e.target.value)}
          />
          <span className="search-shortcut">⌘F</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">产品分类</div>
        {schemas.map((s) => (
          <button
            key={s.id}
            className={`sidebar-item ${s.id === currentCategoryId ? 'active' : ''}`}
            onClick={() => onSelectCategory(s.id)}
          >
            <span className="sidebar-item-icon">
              <Icon size={16} paths={s.icon} />
            </span>
            <span className="sidebar-item-label">{s.name}</span>
            <span className="sidebar-badge">{counts[s.id] ?? 0}</span>
          </button>
        ))}

        <div className="sidebar-divider" />

        <button
          className={`sidebar-item ${compareCount > 0 ? '' : ''}`}
          onClick={onOpenCompare}
          style={{ opacity: compareCount > 0 ? 1 : 0.6 }}
        >
          <span className="sidebar-item-icon">
            <Icon size={16} paths={ICONS.compare} />
          </span>
          <span className="sidebar-item-label">对比队列</span>
          <span className="sidebar-badge">{compareCount}</span>
        </button>
      </nav>
    </aside>
  );
};
