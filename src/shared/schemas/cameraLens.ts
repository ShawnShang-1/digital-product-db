import type { CategorySchema } from '../schema';

export const cameraLensSchema: CategorySchema = {
  id: 'camera-lens',
  name: '相机镜头',
  tableName: 'camera_lens',
  brandField: 'brand',
  nameField: 'model',
  subtitleFields: ['lens_type', 'focal_range', 'max_aperture'],
  icon: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>',
  brandColors: {
    Canon: '#d10010',
    Sony: '#000000',
    Nikon: '#ffe600',
    Sigma: '#d5001f',
    Tamron: '#005bac',
    Leica: '#d80000',
    Fujifilm: '#fb0028'
  },
  summaryFields: ['lens_type', 'focal_range', 'max_aperture', 'weight'],
  defaultSort: { field: 'focal_range', direction: 'asc' },
  groups: [
    { id: 'basic', label: '基础信息', icon: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>' },
    { id: 'optics', label: '光学参数', icon: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>' },
    { id: 'structure', label: '光学结构', icon: '<circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/>' },
    { id: 'physical', label: '物理规格', icon: '<rect width="18" height="18" x="3" y="3" rx="2"/>' }
  ],
  fields: [
    { key: 'brand', label: '品牌', type: 'select', group: 'basic', options: ['Canon', 'Sony', 'Nikon', 'Sigma', 'Tamron', 'Leica', 'Fujifilm', '其他'], filterable: true, listColumn: true, listWidth: 90, compare: 'text' },
    { key: 'model', label: '型号', type: 'text', group: 'basic', sortable: true, listColumn: true, listWidth: 200, highlight: true, mono: true, compare: 'text' },
    { key: 'mount', label: '卡口类型', type: 'text', group: 'basic', filterable: true, listColumn: true, listWidth: 100, mono: true, placeholder: '如 EF / RF / E / Z / L', compare: 'text' },
    { key: 'lens_type', label: '镜头类型', type: 'select', group: 'basic', options: ['定焦', '变焦', '微距', '鱼眼', '移轴', '增距镜'], filterable: true, listColumn: true, listWidth: 90, compare: 'text' },
    { key: 'price', label: '参考价格', type: 'price', group: 'basic', sortable: true, mono: true, highlight: true, compare: 'lower-better' },
    // 光学
    { key: 'focal_range', label: '焦距范围', type: 'text', group: 'optics', unit: 'mm', sortable: true, mono: true, highlight: true, listColumn: true, listWidth: 120, placeholder: '如 24-70 / 50', compare: 'text' },
    { key: 'max_aperture', label: '最大光圈', type: 'text', group: 'optics', sortable: true, mono: true, highlight: true, listColumn: true, listWidth: 90, placeholder: '如 f/1.4 / f/2.8-4', compare: 'lower-better' },
    { key: 'min_aperture', label: '最小光圈', type: 'text', group: 'optics', mono: true, placeholder: '如 f/22' },
    { key: 'stabilization', label: '光学防抖', type: 'select', group: 'optics', options: ['有', '无'] },
    // 结构
    { key: 'elements', label: '镜片数', type: 'number', group: 'structure', mono: true },
    { key: 'groups', label: '镜组数', type: 'number', group: 'structure', mono: true },
    { key: 'elements_groups', label: '镜片/镜组', type: 'text', group: 'structure', mono: true, placeholder: '如 16片11组' },
    { key: 'min_focus', label: '最近对焦距离', type: 'text', group: 'structure', unit: 'm', mono: true, compare: 'lower-better' },
    { key: 'magnification', label: '最大放大倍率', type: 'text', group: 'structure', mono: true, placeholder: '如 0.21x / 1.0x' },
    { key: 'af_motor', label: '对焦马达', type: 'text', group: 'structure', placeholder: '如 STM / USM / 线性马达' },
    // 物理
    { key: 'weight', label: '重量', type: 'text', group: 'physical', unit: 'g', sortable: true, mono: true, listColumn: true, listWidth: 90, compare: 'lower-better' },
    { key: 'filter_size', label: '滤镜口径', type: 'text', group: 'physical', unit: 'mm', sortable: true, mono: true, listColumn: true, listWidth: 90, compare: 'text' },
    { key: 'diameter', label: '最大直径', type: 'text', group: 'physical', unit: 'mm', mono: true },
    { key: 'length', label: '长度', type: 'text', group: 'physical', unit: 'mm', mono: true, compare: 'lower-better' },
    { key: 'hood', label: '遮光罩', type: 'text', group: 'physical' },
    { key: 'weather_seal', label: '防尘防滴', type: 'select', group: 'physical', options: ['有', '无'] },
    { key: 'release_year', label: '发布年份', type: 'year', group: 'physical', sortable: true, mono: true, compare: 'higher-better' }
  ],
  filters: ['brand', 'mount', 'lens_type']
};
