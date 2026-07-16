import type { CategorySchema } from '../schema';

export const cpuSchema: CategorySchema = {
  id: 'cpu',
  name: '电脑CPU',
  tableName: 'cpu',
  brandField: 'brand',
  nameField: 'model',
  subtitleFields: ['platform', 'generation', 'release_year'],
  icon: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2"/>',
  brandColors: {
    Intel: '#0071c5',
    AMD: '#ed1c24',
    Apple: '#555555',
    Qualcomm: '#3253dc'
  },
  summaryFields: ['core_thread', 'boost_clock', 'tdp', 'socket'],
  defaultSort: { field: 'r23_multi', direction: 'desc' },
  groups: [
    { id: 'basic', label: '基础信息', icon: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>' },
    { id: 'arch', label: '架构与制程', icon: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>' },
    { id: 'core', label: '核心配置', icon: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>' },
    { id: 'freq', label: '频率参数', icon: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>' },
    { id: 'power', label: '功耗', icon: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" x2="12" y1="2" y2="12"/>' },
    { id: 'perf', label: '性能跑分', icon: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>' },
    { id: 'igpu', label: '核显', icon: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>' },
    { id: 'platform', label: '平台接口', icon: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>' }
  ],
  fields: [
    // 基础
    { key: 'brand', label: '品牌', type: 'select', group: 'basic', options: ['Intel', 'AMD', 'Apple', 'Qualcomm', '其他'], filterable: true, listColumn: true, listWidth: 90, compare: 'text' },
    { key: 'model', label: '型号', type: 'text', group: 'basic', sortable: true, listColumn: true, listWidth: 200, highlight: true, mono: true, compare: 'text' },
    { key: 'generation', label: '代际', type: 'text', group: 'basic', filterable: true, listColumn: true, listWidth: 110, placeholder: '如 14代 / 7000系 / M3系列', compare: 'text' },
    { key: 'platform', label: '平台类型', type: 'select', group: 'basic', options: ['桌面端', '移动端', '服务器', '工作站'], filterable: true, listColumn: true, listWidth: 90, compare: 'text' },
    { key: 'release_year', label: '发布年份', type: 'year', group: 'basic', sortable: true, listColumn: true, listWidth: 80, mono: true, compare: 'higher-better' },
    { key: 'price', label: '参考价格', type: 'price', group: 'basic', sortable: true, mono: true, highlight: true, compare: 'lower-better' },
    // 架构
    { key: 'arch_code', label: '架构代号', type: 'text', group: 'arch', placeholder: '如 Raptor Lake Refresh / Zen 4' },
    { key: 'process', label: '制程工艺', type: 'text', group: 'arch', mono: true, placeholder: '如 Intel 7 (10nm) / TSMC 3nm', compare: 'text' },
    // 核心
    { key: 'p_cores', label: '大核数量', type: 'number', group: 'core', mono: true, highlight: true, compare: 'higher-better' },
    { key: 'e_cores', label: '小核数量', type: 'number', group: 'core', mono: true, highlight: true, compare: 'higher-better' },
    { key: 'threads', label: '总线程数', type: 'number', group: 'core', sortable: true, mono: true, listColumn: true, listWidth: 100, listLabel: '核心/线程', compare: 'higher-better' },
    { key: 'core_thread', label: '核心/线程', type: 'text', group: 'core', mono: true, listColumn: false, compare: 'text' },
    // 频率
    { key: 'base_clock', label: '基础频率', type: 'text', group: 'freq', unit: 'GHz', sortable: true, mono: true, listColumn: true, listWidth: 90, compare: 'higher-better' },
    { key: 'boost_clock', label: '最大睿频', type: 'text', group: 'freq', unit: 'GHz', sortable: true, mono: true, highlight: true, listColumn: true, listWidth: 90, compare: 'higher-better' },
    // 功耗
    { key: 'tdp', label: 'TDP 功耗', type: 'text', group: 'power', unit: 'W', sortable: true, mono: true, listColumn: true, listWidth: 80, compare: 'lower-better' },
    { key: 'pl1', label: 'PL1', type: 'text', group: 'power', unit: 'W', mono: true },
    { key: 'pl2', label: 'PL2', type: 'text', group: 'power', unit: 'W', mono: true },
    { key: 'mtl_power', label: '最大睿频功耗', type: 'text', group: 'power', unit: 'W', mono: true, highlight: true },
    // 性能
    { key: 'r23_single', label: 'Cinebench R23 单核', type: 'number', group: 'perf', sortable: true, mono: true, highlight: true, listColumn: true, listWidth: 110, listLabel: 'R23 单核', compare: 'higher-better' },
    { key: 'r23_multi', label: 'Cinebench R23 多核', type: 'number', group: 'perf', sortable: true, mono: true, highlight: true, listColumn: true, listWidth: 110, listLabel: 'R23 多核', compare: 'higher-better' },
    // 核显
    { key: 'igpu_model', label: '核显型号', type: 'text', group: 'igpu' },
    { key: 'igpu_clock', label: '核显频率', type: 'text', group: 'igpu', unit: 'MHz', mono: true },
    // 平台
    { key: 'socket', label: '接口类型', type: 'text', group: 'platform', mono: true, placeholder: '如 LGA 1700 / AM5', compare: 'text' },
    { key: 'chipset', label: '适配芯片组', type: 'text', group: 'platform', placeholder: '如 Z790 / B760' }
  ],
  filters: ['brand', 'generation', 'platform']
};
