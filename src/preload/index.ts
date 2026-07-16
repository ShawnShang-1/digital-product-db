import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/schema';
import type { CategorySchema, ListQuery, ProductRecord } from '../shared/schema';

const api = {
  list: (query: ListQuery): Promise<ProductRecord[]> => ipcRenderer.invoke(IPC.LIST, query),
  get: (categoryId: string, id: number): Promise<ProductRecord | null> =>
    ipcRenderer.invoke(IPC.GET, categoryId, id),
  create: (categoryId: string, data: Record<string, any>): Promise<ProductRecord> =>
    ipcRenderer.invoke(IPC.CREATE, categoryId, data),
  update: (categoryId: string, id: number, data: Record<string, any>): Promise<ProductRecord> =>
    ipcRenderer.invoke(IPC.UPDATE, categoryId, id, data),
  delete: (categoryId: string, id: number): Promise<boolean> =>
    ipcRenderer.invoke(IPC.DELETE, categoryId, id),
  count: (categoryId: string): Promise<number> => ipcRenderer.invoke(IPC.COUNT, categoryId),
  countAll: (): Promise<Record<string, number>> => ipcRenderer.invoke(IPC.COUNT_ALL),
  filters: (categoryId: string): Promise<Record<string, string[]>> =>
    ipcRenderer.invoke(IPC.FILTERS, categoryId),
  search: (keyword: string): Promise<Record<string, ProductRecord[]>> =>
    ipcRenderer.invoke(IPC.SEARCH, keyword),
  seed: (): Promise<Record<string, number>> => ipcRenderer.invoke(IPC.SEED),
  schemas: (): Promise<CategorySchema[]> => ipcRenderer.invoke(IPC.GET_SCHEMAS),
  win: {
    minimize: () => ipcRenderer.send('win:minimize'),
    maximize: () => ipcRenderer.send('win:maximize'),
    close: () => ipcRenderer.send('win:close'),
    setTheme: (theme: 'system' | 'light' | 'dark') => ipcRenderer.send('win:set-theme', theme)
  }
};

contextBridge.exposeInMainWorld('db', api);

export type DbAPI = typeof api;
