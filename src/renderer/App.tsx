/**
 * 应用根组件 — 负责全局状态、视图路由、主题切换、键盘快捷键
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { CategorySchema } from '../shared/schema';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { ListView } from './components/ListView';
import { DetailView } from './components/DetailView';
import { EditView } from './components/EditView';
import { CompareView } from './components/CompareView';
import { SearchView } from './components/SearchView';

export type ViewMode = 'list' | 'detail' | 'edit' | 'compare' | 'search';
export type Theme = 'system' | 'light' | 'dark';

/** 对比队列项 */
export interface CompareItem {
  categoryId: string;
  id: number;
}

const LAST_CATEGORY_KEY = 'pdb:lastCategory';
const LAST_THEME_KEY = 'pdb:theme';
const COMPARE_KEY = 'pdb:compareQueue';

export default function App() {
  const [schemas, setSchemas] = useState<CategorySchema[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [currentCategoryId, setCurrentCategoryId] = useState<string>('cpu');
  const [view, setView] = useState<ViewMode>('list');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null); // null = 新建
  const [compareQueue, setCompareQueue] = useState<CompareItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [theme, setTheme] = useState<Theme>('system');
  const [refreshKey, setRefreshKey] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 初始化：加载 schema / 计数 / 持久化状态
  useEffect(() => {
    (async () => {
      const s = await window.db.schemas();
      setSchemas(s);
      const c = await window.db.countAll();
      setCounts(c);

      // seed（仅空表时填充）
      const seedCounts = await window.db.seed();
      if (JSON.stringify(seedCounts) !== JSON.stringify(c)) {
        setCounts(seedCounts);
      }

      const last = localStorage.getItem(LAST_CATEGORY_KEY);
      if (last && s.find((x) => x.id === last)) {
        setCurrentCategoryId(last);
      }

      const savedTheme = (localStorage.getItem(LAST_THEME_KEY) as Theme) || 'system';
      setTheme(savedTheme);
      applyTheme(savedTheme);

      try {
        const q = JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]');
        if (Array.isArray(q)) setCompareQueue(q);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  // 主题切换
  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    const isDark =
      t === 'dark' ||
      (t === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
    window.db.win.setTheme(t);
  };

  const handleThemeChange = (t: Theme) => {
    setTheme(t);
    localStorage.setItem(LAST_THEME_KEY, t);
    applyTheme(t);
  };

  // 监听系统主题变化（仅 system 模式下生效）
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') applyTheme('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // Cmd+F 聚焦搜索框
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const refreshCounts = useCallback(async () => {
    const c = await window.db.countAll();
    setCounts(c);
  }, []);

  const selectCategory = useCallback((id: string) => {
    setCurrentCategoryId(id);
    setView('list');
    setSelectedId(null);
    localStorage.setItem(LAST_CATEGORY_KEY, id);
  }, []);

  const openDetail = useCallback((id: number) => {
    setSelectedId(id);
    setView('detail');
  }, []);

  const openEdit = useCallback((id: number | null) => {
    setEditingId(id);
    setView('edit');
  }, []);

  const backToList = useCallback(() => {
    setView('list');
    setSelectedId(null);
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    refreshCounts();
  }, [refreshCounts]);

  // 对比队列操作
  const toggleCompare = useCallback(
    (item: CompareItem) => {
      setCompareQueue((prev) => {
        const exists = prev.find(
          (x) => x.categoryId === item.categoryId && x.id === item.id
        );
        let next: CompareItem[];
        if (exists) {
          next = prev.filter(
            (x) => !(x.categoryId === item.categoryId && x.id === item.id)
          );
        } else {
          if (prev.length >= 4) return prev;
          next = [...prev, item];
        }
        localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const removeFromCompare = useCallback((item: CompareItem) => {
    setCompareQueue((prev) => {
      const next = prev.filter(
        (x) => !(x.categoryId === item.categoryId && x.id === item.id)
      );
      localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const reorderCompare = useCallback((from: number, to: number) => {
    setCompareQueue((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareQueue([]);
    localStorage.removeItem(COMPARE_KEY);
  }, []);

  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    if (keyword.trim()) setView('search');
    else if (view === 'search') setView('list');
  }, [view]);

  const currentSchema = schemas.find((s) => s.id === currentCategoryId);

  return (
    <div className="app-shell">
      <TitleBar
        schema={currentSchema}
        view={view}
        theme={theme}
        onThemeChange={handleThemeChange}
      />
      <div className="app-body">
        <Sidebar
          schemas={schemas}
          counts={counts}
          currentCategoryId={currentCategoryId}
          onSelectCategory={selectCategory}
          searchKeyword={searchKeyword}
          onSearch={handleSearch}
          searchInputRef={searchInputRef}
          compareCount={compareQueue.length}
          onOpenCompare={() => setView('compare')}
        />
        <main className="content">
          {view === 'list' && currentSchema && (
            <ListView
              key={`${currentCategoryId}-${refreshKey}`}
              schema={currentSchema}
              onOpenDetail={openDetail}
              onEdit={openEdit}
              compareQueue={compareQueue}
              onToggleCompare={toggleCompare}
              onRefresh={refresh}
            />
          )}
          {view === 'detail' && currentSchema && selectedId !== null && (
            <DetailView
              key={`detail-${selectedId}-${refreshKey}`}
              schema={currentSchema}
              id={selectedId}
              onBack={backToList}
              onEdit={() => openEdit(selectedId)}
              onDelete={async () => {
                await window.db.delete(currentSchema.id, selectedId);
                refresh();
                backToList();
              }}
              onAddToCompare={() =>
                toggleCompare({ categoryId: currentSchema.id, id: selectedId })
              }
              isInCompare={compareQueue.some(
                (x) => x.categoryId === currentSchema.id && x.id === selectedId
              )}
            />
          )}
          {view === 'edit' && currentSchema && (
            <EditView
              key={`edit-${editingId}-${refreshKey}`}
              schema={currentSchema}
              id={editingId}
              onCancel={backToList}
              onSaved={() => {
                refresh();
                if (editingId !== null) {
                  setSelectedId(editingId);
                  setView('detail');
                } else {
                  backToList();
                }
              }}
            />
          )}
          {view === 'compare' && (
            <CompareView
              key={`compare-${refreshKey}`}
              schemas={schemas}
              queue={compareQueue}
              onRemove={removeFromCompare}
              onReorder={reorderCompare}
              onClear={clearCompare}
              onBack={backToList}
            />
          )}
          {view === 'search' && (
            <SearchView
              schemas={schemas}
              keyword={searchKeyword}
              onOpenDetail={(categoryId, id) => {
                setCurrentCategoryId(categoryId);
                localStorage.setItem(LAST_CATEGORY_KEY, categoryId);
                openDetail(id);
              }}
              searchInputRef={searchInputRef}
            />
          )}
        </main>
      </div>
    </div>
  );
}
