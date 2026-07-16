import type { CategorySchema } from '../schema';

export const aircraftSchema: CategorySchema = {
  id: 'aircraft',
  name: '飞机',
  tableName: 'aircraft',
  brandField: 'manufacturer',
  nameField: 'model',
  subtitleFields: ['category', 'first_flight_year', 'service_status'],
  icon: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  brandColors: {
    Boeing: '#0033a1',
    Airbus: '#00205b',
    Lockheed: '#000000',
    Sukhoi: '#cf0a2c',
    'COMAC': '#c8102e',
    'Chengdu': '#cf0a2c'
  },
  summaryFields: ['category', 'max_speed', 'range', 'service_status'],
  defaultSort: { field: 'first_flight_year', direction: 'desc' },
  groups: [
    { id: 'basic', label: '基础信息', icon: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>' },
    { id: 'size', label: '外形尺寸', icon: '<path d="M21 3H3v18h18z"/><path d="M9 3v18M15 3v18"/>' },
    { id: 'weight', label: '重量', icon: '<path d="M6 7h12l-1 13H7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>' },
    { id: 'engine', label: '动力系统', icon: '<circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>' },
    { id: 'civil_perf', label: '民航性能', icon: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>' },
    { id: 'military_perf', label: '战机性能', icon: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>' },
    { id: 'military', label: '战机专属', icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' }
  ],
  fields: [
    { key: 'manufacturer', label: '制造商', type: 'text', group: 'basic', filterable: true, listColumn: true, listWidth: 110, compare: 'text' },
    { key: 'model', label: '型号名称', type: 'text', group: 'basic', sortable: true, listColumn: true, listWidth: 180, highlight: true, mono: true, compare: 'text' },
    { key: 'category', label: '机型类别', type: 'select', group: 'basic', options: ['民航客机', '战斗机', '轰炸机', '运输机', '直升机', '预警机', '加油机', '教练机', '通用航空'], filterable: true, listColumn: true, listWidth: 100, compare: 'text' },
    { key: 'first_flight_year', label: '首飞年份', type: 'year', group: 'basic', sortable: true, listColumn: true, listWidth: 90, mono: true, compare: 'higher-better' },
    { key: 'service_status', label: '服役状态', type: 'select', group: 'basic', options: ['在役', '退役', '在研', '原型机', '已下马'], filterable: true, listColumn: true, listWidth: 90, compare: 'text' },
    // 尺寸
    { key: 'length', label: '机长', type: 'text', group: 'size', unit: 'm', mono: true, compare: 'text' },
    { key: 'wingspan', label: '翼展', type: 'text', group: 'size', unit: 'm', mono: true, compare: 'text' },
    { key: 'height', label: '机高', type: 'text', group: 'size', unit: 'm', mono: true },
    // 重量
    { key: 'empty_weight', label: '空重', type: 'text', group: 'weight', unit: 'kg/t', mono: true },
    { key: 'mtow', label: '最大起飞重量', type: 'text', group: 'weight', unit: 'kg/t', mono: true, highlight: true, compare: 'higher-better' },
    // 动力
    { key: 'engine_model', label: '发动机型号', type: 'text', group: 'engine' },
    { key: 'engine_count', label: '发动机数量', type: 'number', group: 'engine', mono: true, compare: 'higher-better' },
    { key: 'engine_thrust', label: '单台推力', type: 'text', group: 'engine', mono: true, placeholder: '如 35,000 lbf / 150 kN' },
    // 民航性能
    { key: 'cruise_speed', label: '巡航速度', type: 'text', group: 'civil_perf', unit: 'km/h', mono: true, compare: 'higher-better' },
    { key: 'max_speed', label: '最大速度', type: 'text', group: 'civil_perf', unit: 'km/h', mono: true, highlight: true, sortable: true, listColumn: true, listWidth: 110, compare: 'higher-better' },
    { key: 'range', label: '航程', type: 'text', group: 'civil_perf', unit: 'km', mono: true, highlight: true, sortable: true, listColumn: true, listWidth: 110, compare: 'higher-better' },
    { key: 'cruise_altitude', label: '巡航高度', type: 'text', group: 'civil_perf', unit: 'm', mono: true },
    { key: 'passengers', label: '载客量', type: 'number', group: 'civil_perf', mono: true, compare: 'higher-better' },
    // 战机性能
    { key: 'max_mach', label: '最大速度', type: 'text', group: 'military_perf', unit: 'Ma', mono: true, highlight: true, sortable: true, compare: 'higher-better' },
    { key: 'combat_radius', label: '作战半径', type: 'text', group: 'military_perf', unit: 'km', mono: true, compare: 'higher-better' },
    { key: 'climb_rate', label: '爬升率', type: 'text', group: 'military_perf', unit: 'm/s', mono: true, compare: 'higher-better' },
    { key: 'service_ceiling', label: '实用升限', type: 'text', group: 'military_perf', unit: 'm', mono: true, compare: 'higher-better' },
    { key: 'max_g', label: '最大过载', type: 'text', group: 'military_perf', unit: 'G', mono: true, compare: 'higher-better' },
    // 战机专属
    { key: 'generation', label: '代际划分', type: 'select', group: 'military', options: ['四代', '四代半', '五代', '六代'], filterable: true, compare: 'text' },
    { key: 'stealth', label: '隐身能力', type: 'select', group: 'military', options: ['是', '否', '部分'], compare: 'text' },
    { key: 'weapons', label: '武器挂载能力', type: 'textarea', group: 'military', placeholder: '挂点数量、典型挂载方案等' },
    { key: 'notes', label: '备注', type: 'textarea', group: 'military', placeholder: '其他补充信息' }
  ],
  filters: ['manufacturer', 'category', 'service_status', 'generation']
};
