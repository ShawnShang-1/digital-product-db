/**
 * 可扩展 Schema 系统
 * 新增分类只需在 schemas/ 下新增一个文件并在 index.ts 注册
 */

export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'year'
  | 'price';

/** 对比模式下的差异判定方式 */
export type CompareMode = 'higher-better' | 'lower-better' | 'text' | 'none';

export interface FieldDef {
  /** 数据库列名 (snake_case) */
  key: string;
  /** 详情页标签 */
  label: string;
  /** 列表表头（短文案，缺省时用 label） */
  listLabel?: string;
  /** 表单输入类型 */
  type: FieldType;
  /** 所属分组 id */
  group: string;
  /** 单位 (GHz / W / mm 等) */
  unit?: string;
  /** 列表是否可按此字段排序 */
  sortable?: boolean;
  /** 列表是否可作为筛选维度 */
  filterable?: boolean;
  /** select 类型的可选项 */
  options?: string[];
  /** 表单占位文案 */
  placeholder?: string;
  /** 详情页是否高亮 */
  highlight?: boolean;
  /** 详情页是否使用等宽字体 */
  mono?: boolean;
  /** 是否作为列表列显示 */
  listColumn?: boolean;
  /** 列表列宽 (px) */
  listWidth?: number;
  /** 对比模式差异判定 */
  compare?: CompareMode;
}

export interface GroupDef {
  id: string;
  label: string;
  /** 24x24 viewBox SVG 内部内容 */
  icon: string;
}

export interface CategorySchema {
  /** 唯一标识，用于路由与 IPC */
  id: string;
  /** 侧边栏显示名 */
  name: string;
  /** SQLite 表名 */
  tableName: string;
  /** 侧边栏图标，24x24 viewBox SVG 内部内容 */
  icon: string;
  /** 品牌字段 key（用于品牌色点） */
  brandField: string;
  /** 型号名字段 key */
  nameField: string;
  /** 详情头部副标题字段（按顺序拼接） */
  subtitleFields?: string[];
  /** 参数分组 */
  groups: GroupDef[];
  /** 字段定义 */
  fields: FieldDef[];
  /** 列表筛选维度字段 key 数组 */
  filters: string[];
  /** 默认排序 */
  defaultSort?: { field: string; direction: 'asc' | 'desc' };
  /** 品牌色映射 */
  brandColors?: Record<string, string>;
  /** 列表行规格摘要字段（搜索结果用） */
  summaryFields?: string[];
}

/** 数据库记录（动态字段） */
export type ProductRecord = Record<string, any> & {
  id: number;
  created_at?: string;
  updated_at?: string;
};

/** 列表查询参数 */
export interface ListQuery {
  categoryId: string;
  sort?: { field: string; direction: 'asc' | 'desc' };
  filters?: Record<string, string>;
  search?: string;
}

/** IPC 通道名 */
export const IPC = {
  LIST: 'db:list',
  GET: 'db:get',
  CREATE: 'db:create',
  UPDATE: 'db:update',
  DELETE: 'db:delete',
  SEARCH: 'db:search',
  COUNT: 'db:count',
  FILTERS: 'db:filters',
  SEED: 'db:seed',
  COUNT_ALL: 'db:countAll',
  GET_SCHEMA: 'db:getSchema',
  GET_SCHEMAS: 'db:getSchemas'
} as const;
