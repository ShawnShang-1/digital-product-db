import type { CategorySchema } from '../schema';

export const cameraBodySchema: CategorySchema = {
  id: 'camera-body',
  name: '相机机身',
  tableName: 'camera_body',
  brandField: 'brand',
  nameField: 'model',
  subtitleFields: ['sensor_size', 'release_year'],
  icon: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  brandColors: {
    Canon: '#d10010',
    Sony: '#000000',
    Nikon: '#ffe600',
    Fujifilm: '#fb0028',
    Panasonic: '#0050a0',
    Leica: '#d80000'
  },
  summaryFields: ['sensor_size', 'pixels', 'video_spec', 'mount'],
  defaultSort: { field: 'release_year', direction: 'desc' },
  groups: [
    { id: 'basic', label: '基础信息', icon: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>' },
    { id: 'sensor', label: '传感器', icon: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="3"/>' },
    { id: 'processor', label: '影像处理器', icon: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/>' },
    { id: 'af', label: '对焦系统', icon: '<circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6"/>' },
    { id: 'video', label: '视频规格', icon: '<rect width="20" height="14" x="2" y="3" rx="2"/><polygon points="10 8 16 12 10 16 10 8"/>' },
    { id: 'body', label: '机身规格', icon: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>' }
  ],
  fields: [
    { key: 'brand', label: '品牌', type: 'select', group: 'basic', options: ['Canon', 'Sony', 'Nikon', 'Fujifilm', 'Panasonic', 'Leica', 'Hasselblad', 'Pentax', '其他'], filterable: true, listColumn: true, listWidth: 90, compare: 'text' },
    { key: 'model', label: '型号', type: 'text', group: 'basic', sortable: true, listColumn: true, listWidth: 180, highlight: true, mono: true, compare: 'text' },
    { key: 'release_year', label: '发布年份', type: 'year', group: 'basic', sortable: true, listColumn: true, listWidth: 90, mono: true, compare: 'higher-better' },
    { key: 'price', label: '参考价格', type: 'price', group: 'basic', sortable: true, mono: true, highlight: true, compare: 'lower-better' },
    // 传感器
    { key: 'sensor_model', label: '传感器型号', type: 'text', group: 'sensor' },
    { key: 'sensor_size', label: '传感器尺寸', type: 'select', group: 'sensor', options: ['全画幅', 'APS-C', 'M4/3', '中画幅', '1英寸', '1/1.7英寸', '其他'], filterable: true, listColumn: true, listWidth: 100, compare: 'text' },
    { key: 'pixels', label: '有效像素', type: 'text', group: 'sensor', unit: '万', sortable: true, mono: true, highlight: true, listColumn: true, listWidth: 100, compare: 'higher-better' },
    { key: 'pixel_pitch', label: '像素间距', type: 'text', group: 'sensor', unit: 'μm', mono: true },
    { key: 'iso_range', label: 'ISO 范围', type: 'text', group: 'sensor', mono: true },
    { key: 'dynamic_range', label: '动态范围', type: 'text', group: 'sensor', unit: '档', mono: true },
    // 处理器
    { key: 'processor', label: '影像处理器', type: 'text', group: 'processor' },
    // 对焦
    { key: 'af_points', label: '对焦点数量', type: 'text', group: 'af', mono: true, compare: 'higher-better' },
    { key: 'af_type', label: '对焦类型', type: 'text', group: 'af', placeholder: '如 相位检测 / 反差检测 / 混合' },
    { key: 'af_low_light', label: '最低对焦亮度', type: 'text', group: 'af', unit: 'EV', mono: true },
    // 视频
    { key: 'video_spec', label: '最高视频规格', type: 'text', group: 'video', highlight: true, listColumn: true, listWidth: 140, placeholder: '如 8K60p RAW / 4K120p 10bit', compare: 'text' },
    { key: 'oversample', label: '超采倍率', type: 'text', group: 'video', mono: true },
    { key: 'log_curve', label: '支持 Log 曲线', type: 'text', group: 'video', placeholder: '如 S-Log3 / N-Log / C-Log3' },
    { key: 'color_depth', label: '色深采样', type: 'text', group: 'video', mono: true, placeholder: '如 10bit 4:2:2' },
    { key: 'raw_internal', label: '机内 RAW', type: 'select', group: 'video', options: ['支持', '不支持'] },
    // 机身
    { key: 'weight', label: '机身重量', type: 'text', group: 'body', unit: 'g', mono: true, sortable: true, listColumn: true, listWidth: 90, compare: 'lower-better' },
    { key: 'mount', label: '镜头卡口', type: 'text', group: 'body', filterable: true, listColumn: true, listWidth: 100, mono: true, compare: 'text' },
    { key: 'stabilization', label: '机身防抖', type: 'text', group: 'body', mono: true, placeholder: '如 5轴 8档' },
    { key: 'shutter', label: '快门类型', type: 'text', group: 'body', placeholder: '如 机械+电子 / 纯电子' },
    { key: 'storage', label: '存储卡', type: 'text', group: 'body', placeholder: '如 CFexpress + SD' }
  ],
  filters: ['brand', 'sensor_size', 'mount']
};
