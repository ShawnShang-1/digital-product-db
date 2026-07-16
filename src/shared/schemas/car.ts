import type { CategorySchema } from '../schema';

export const carSchema: CategorySchema = {
  id: 'car',
  name: '汽车',
  tableName: 'car',
  brandField: 'brand',
  nameField: 'model',
  subtitleFields: ['year', 'power_type'],
  icon: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  brandColors: {
    Tesla: '#e82127',
    BMW: '#0066b1',
    Mercedes: '#00a19b',
    BYD: '#e60012',
    NIO: '#00d2c9',
    Li: '#1e90ff',
    Porsche: '#d5001f',
    Audi: '#bb0a30'
  },
  summaryFields: ['power_type', 'max_horsepower', 'battery_capacity', 'consumption'],
  defaultSort: { field: 'year', direction: 'desc' },
  groups: [
    { id: 'basic', label: '基础信息', icon: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>' },
    { id: 'body', label: '车身尺寸', icon: '<path d="M21 3H3v18h18z"/>' },
    { id: 'powertrain', label: '动力系统', icon: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>' },
    { id: 'battery', label: '电池与能耗', icon: '<rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="16" y1="11" y2="11"/><line x1="22" x2="16" y1="13" y2="13"/>' },
    { id: 'tire', label: '轮胎', icon: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>' },
    { id: 'review', label: '个人评价', icon: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>' }
  ],
  fields: [
    { key: 'brand', label: '品牌', type: 'text', group: 'basic', filterable: true, listColumn: true, listWidth: 100, compare: 'text' },
    { key: 'model', label: '型号', type: 'text', group: 'basic', sortable: true, listColumn: true, listWidth: 180, highlight: true, compare: 'text' },
    { key: 'year', label: '年款', type: 'year', group: 'basic', sortable: true, listColumn: true, listWidth: 80, mono: true, compare: 'higher-better' },
    { key: 'power_type', label: '动力类型', type: 'select', group: 'basic', options: ['纯电', '插混', '增程', '燃油', '混动', '氢能源'], filterable: true, listColumn: true, listWidth: 90, compare: 'text' },
    // 车身
    { key: 'length', label: '车身长度', type: 'number', group: 'body', unit: 'mm', mono: true },
    { key: 'width', label: '车身宽度', type: 'number', group: 'body', unit: 'mm', mono: true },
    { key: 'height', label: '车身高度', type: 'number', group: 'body', unit: 'mm', mono: true },
    { key: 'wheelbase', label: '轴距', type: 'number', group: 'body', unit: 'mm', mono: true, compare: 'higher-better' },
    { key: 'curb_weight', label: '整备质量', type: 'number', group: 'body', unit: 'kg', mono: true },
    // 动力
    { key: 'max_horsepower', label: '最大马力', type: 'number', group: 'powertrain', unit: 'Ps', sortable: true, mono: true, highlight: true, listColumn: true, listWidth: 100, compare: 'higher-better' },
    { key: 'max_torque', label: '峰值扭矩', type: 'number', group: 'powertrain', unit: 'N·m', mono: true, highlight: true, listColumn: true, listWidth: 100, compare: 'higher-better' },
    { key: 'acceleration', label: '0-100加速', type: 'text', group: 'powertrain', unit: 's', mono: true, compare: 'lower-better' },
    // 电池与能耗
    { key: 'battery_capacity', label: '电池容量', type: 'text', group: 'battery', unit: 'kWh', sortable: true, mono: true, highlight: true, listColumn: true, listWidth: 100, compare: 'higher-better' },
    { key: 'battery_supplier', label: '电池供应商', type: 'text', group: 'battery' },
    { key: 'consumption', label: '百公里能耗', type: 'text', group: 'battery', unit: 'kWh / L', mono: true, sortable: true, listColumn: true, listWidth: 110, listLabel: '能耗', compare: 'lower-better' },
    { key: 'range', label: '续航里程', type: 'text', group: 'battery', unit: 'km', mono: true, compare: 'higher-better' },
    // 轮胎
    { key: 'tire_spec', label: '轮胎规格', type: 'text', group: 'tire', mono: true, placeholder: '如 245/45 R19' },
    { key: 'tire_brand', label: '轮胎品牌', type: 'text', group: 'tire' },
    // 评价
    { key: 'personal_review', label: '个人主观评价', type: 'textarea', group: 'review', placeholder: '对这台车的驾驶感受、优点缺点等' }
  ],
  filters: ['brand', 'power_type', 'year']
};
