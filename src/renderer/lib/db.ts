/**
 * 渲染进程数据库客户端 — 通过 preload 暴露的 window.db 调用主进程
 */
import type { CategorySchema, ListQuery, ProductRecord } from '../../shared/schema';

declare global {
  interface Window {
    db: {
      list: (query: ListQuery) => Promise<ProductRecord[]>;
      get: (categoryId: string, id: number) => Promise<ProductRecord | null>;
      create: (categoryId: string, data: Record<string, any>) => Promise<ProductRecord>;
      update: (categoryId: string, id: number, data: Record<string, any>) => Promise<ProductRecord>;
      delete: (categoryId: string, id: number) => Promise<boolean>;
      count: (categoryId: string) => Promise<number>;
      countAll: () => Promise<Record<string, number>>;
      filters: (categoryId: string) => Promise<Record<string, string[]>>;
      search: (keyword: string) => Promise<Record<string, ProductRecord[]>>;
      seed: () => Promise<Record<string, number>>;
      schemas: () => Promise<CategorySchema[]>;
      win: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
        setTheme: (theme: 'system' | 'light' | 'dark') => void;
      };
    };
  }
}

export const db = window.db;
