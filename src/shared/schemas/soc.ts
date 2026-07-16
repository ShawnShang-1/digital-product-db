import type { CategorySchema } from '../schema';

export const socSchema: CategorySchema = {
  id: 'soc',
  name: '手机SoC',
  tableName: 'soc',
  brandField: 'brand',
  nameField: 'model',
  subtitleFields: ['positioning', 'process', 'release_year'],
  icon: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/>',
  brandColors: {
    Apple: '#555555',
    Qualcomm: '#3253dc',
    MediaTek: '#ff6f00',
    Samsung: '#1428a0',
    Google: '#4285f4',
    Huawei: '#cf0a2c'
  },
  summaryFields: ['process', 'gpu_model', 'npu_tops', 'positioning'],
  defaultSort: { field: 'release_year', direction: 'desc' },
  groups: [
    { id: 'basic', label: '基础信息', icon: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>' },
    { id: 'cpu', label: 'CPU 配置', icon: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2"/>' },
    { id: 'gpu', label: 'GPU 图形', icon: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>' },
    { id: 'ai', label: 'AI 算力', icon: '<path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2v10h10A10 10 0 0 0 12 2z"/>' },
    { id: 'comm', label: '通信与内存', icon: '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/>' },
    { id: 'perf_power', label: '性能与功耗比 (用户自填)', icon: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>' },
    { id: 'device', label: '搭载机型与定位', icon: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>' }
  ],
  fields: [
    // 基础
    { key: 'brand', label: '品牌', type: 'select', group: 'basic', options: ['Apple', 'Qualcomm', 'MediaTek', 'Samsung', 'Google', '华为', '其他'], filterable: true, listColumn: true, listWidth: 100, compare: 'text' },
    { key: 'model', label: '型号', type: 'text', group: 'basic', sortable: true, listColumn: true, listWidth: 180, highlight: true, mono: true, compare: 'text' },
    { key: 'process', label: '制程工艺', type: 'text', group: 'basic', mono: true, filterable: true, listColumn: true, listWidth: 100, placeholder: '如 TSMC 3nm', compare: 'text' },
    { key: 'release_year', label: '发布年份', type: 'year', group: 'basic', sortable: true, listColumn: true, listWidth: 80, mono: true, compare: 'higher-better' },
    // CPU
    { key: 'cpu_arch', label: 'CPU 架构', type: 'text', group: 'cpu', placeholder: '如 ARMv9 / 自研架构' },
    { key: 'prime_core', label: '大核型号与频率', type: 'text', group: 'cpu', mono: true, highlight: true, placeholder: '如 Cortex-X4 @ 3.4GHz' },
    { key: 'mid_core', label: '中核型号与频率', type: 'text', group: 'cpu', mono: true, placeholder: '如 Cortex-A720 @ 3.0GHz' },
    { key: 'eff_core', label: '小核型号与频率', type: 'text', group: 'cpu', mono: true, placeholder: '如 Cortex-A520 @ 2.3GHz' },
    // GPU
    { key: 'gpu_model', label: 'GPU 型号', type: 'text', group: 'gpu', highlight: true, listColumn: true, listWidth: 140, compare: 'text' },
    { key: 'gpu_clock', label: 'GPU 频率', type: 'text', group: 'gpu', unit: 'MHz', mono: true },
    // AI
    { key: 'npu_tops', label: 'NPU / AI 算力', type: 'text', group: 'ai', unit: 'TOPS', mono: true, highlight: true, sortable: true, listColumn: true, listWidth: 100, compare: 'higher-better' },
    // 通信与内存
    { key: 'modem', label: '集成基带', type: 'text', group: 'comm', placeholder: '如 Snapdragon X70 / 外挂 X75' },
    { key: 'memory_spec', label: '支持内存规格', type: 'text', group: 'comm', mono: true, placeholder: '如 LPDDR5X-8533' },
    // 性能功耗比（用户自填）
    { key: 'perf_3w', label: '3W 性能', type: 'text', group: 'perf_power', mono: true, placeholder: '3W 功耗下的性能跑分' },
    { key: 'perf_6w', label: '6W 性能', type: 'text', group: 'perf_power', mono: true, placeholder: '6W 功耗下的性能跑分' },
    { key: 'perf_9w', label: '9W 性能', type: 'text', group: 'perf_power', mono: true, placeholder: '9W 功耗下的性能跑分' },
    { key: 'perf_ratio_note', label: '功耗比备注', type: 'textarea', group: 'perf_power', placeholder: '能效曲线、对比说明等' },
    // 搭载与定位
    { key: 'representative_device', label: '代表机型', type: 'text', group: 'device', placeholder: '如 iPhone 16 Pro / 小米 15' },
    { key: 'positioning', label: '参考定位', type: 'select', group: 'device', options: ['旗舰', '次旗舰', '中端', '入门'], filterable: true, listColumn: true, listWidth: 90, compare: 'text' }
  ],
  filters: ['brand', 'process', 'positioning']
};
