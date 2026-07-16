import type { CategorySchema } from '../schema';

export const gpuSchema: CategorySchema = {
  id: 'gpu',
  name: '显卡GPU',
  tableName: 'gpu',
  brandField: 'brand',
  nameField: 'model',
  subtitleFields: ['generation', 'arch_code', 'release_year'],
  icon: '<rect width="18" height="11" x="3" y="8" rx="2"/><path d="M7 8V4M11 8V4M15 8V4M19 8V4"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  brandColors: {
    NVIDIA: '#76b900',
    AMD: '#ed1c24',
    Intel: '#0071c5'
  },
  summaryFields: ['vram', 'tdp', 'fp32', 'release_year'],
  defaultSort: { field: 'timespy', direction: 'desc' },
  groups: [
    { id: 'basic', label: '基础信息', icon: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>' },
    { id: 'core', label: '核心参数', icon: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/>' },
    { id: 'vram', label: '显存', icon: '<rect width="18" height="11" x="3" y="8" rx="2"/><path d="M7 8V4M11 8V4M15 8V4M19 8V4"/>' },
    { id: 'compute', label: '算力', icon: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>' },
    { id: 'power', label: '功耗与接口', icon: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" x2="12" y1="2" y2="12"/>' },
    { id: 'perf', label: '理论性能', icon: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>' },
    { id: 'rt', label: '光追性能', icon: '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/><circle cx="12" cy="12" r="4"/>' },
    { id: 'ai', label: 'AI 推理', icon: '<path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2v10h10A10 10 0 0 0 12 2z"/>' }
  ],
  fields: [
    { key: 'brand', label: '品牌', type: 'select', group: 'basic', options: ['NVIDIA', 'AMD', 'Intel', '其他'], filterable: true, listColumn: true, listWidth: 90, compare: 'text' },
    { key: 'model', label: '型号', type: 'text', group: 'basic', sortable: true, listColumn: true, listWidth: 200, highlight: true, mono: true, compare: 'text' },
    { key: 'generation', label: '产品代际', type: 'text', group: 'basic', filterable: true, listColumn: true, listWidth: 110, placeholder: '如 RTX 50系 / RX 9000系', compare: 'text' },
    { key: 'arch_code', label: '架构代号', type: 'text', group: 'basic', placeholder: '如 Blackwell / RDNA 4' },
    { key: 'release_year', label: '发布年份', type: 'year', group: 'basic', sortable: true, listColumn: true, listWidth: 80, mono: true, compare: 'higher-better' },
    { key: 'launch_price', label: '首发价格', type: 'price', group: 'basic', sortable: true, mono: true, highlight: true, compare: 'lower-better' },
    { key: 'cuda_cores', label: 'CUDA 核心 / 流处理器', type: 'text', group: 'core', mono: true, highlight: true, sortable: true, listColumn: true, listWidth: 120, listLabel: '核心数', compare: 'higher-better' },
    { key: 'process', label: '制程工艺', type: 'text', group: 'core', mono: true, compare: 'text' },
    { key: 'base_clock', label: '基础频率', type: 'text', group: 'core', unit: 'MHz', mono: true },
    { key: 'boost_clock', label: 'Boost 频率', type: 'text', group: 'core', unit: 'MHz', sortable: true, mono: true, highlight: true, listColumn: true, listWidth: 100, compare: 'higher-better' },
    { key: 'vram', label: '显存容量', type: 'text', group: 'vram', unit: 'GB', sortable: true, mono: true, highlight: true, listColumn: true, listWidth: 90, compare: 'higher-better' },
    { key: 'vram_type', label: '显存类型', type: 'select', group: 'vram', options: ['GDDR6', 'GDDR6X', 'GDDR7', 'HBM3', 'HBM3e', 'LPDDR6X'], mono: true, compare: 'text' },
    { key: 'vram_width', label: '显存位宽', type: 'text', group: 'vram', unit: 'bit', mono: true, compare: 'higher-better' },
    { key: 'vram_clock', label: '显存频率', type: 'text', group: 'vram', unit: 'Mbps', mono: true },
    { key: 'fp32', label: 'FP32 理论算力', type: 'text', group: 'compute', unit: 'TFLOPS', sortable: true, mono: true, highlight: true, listColumn: true, listWidth: 100, compare: 'higher-better' },
    { key: 'tdp', label: 'TDP / 板卡功耗', type: 'text', group: 'power', unit: 'W', sortable: true, mono: true, listColumn: true, listWidth: 80, compare: 'lower-better' },
    { key: 'bus_interface', label: '总线接口', type: 'text', group: 'power', mono: true, placeholder: '如 PCIe 5.0 x16' },
    { key: 'power_connector', label: '供电接口', type: 'text', group: 'power', mono: true, placeholder: '如 1x 16-pin / 3x 8-pin' },
    { key: 'timespy', label: '3DMark Time Spy', type: 'number', group: 'perf', sortable: true, mono: true, highlight: true, listColumn: true, listWidth: 120, listLabel: 'Time Spy', compare: 'higher-better' },
    { key: 'timespy_extreme', label: 'Time Spy Extreme', type: 'number', group: 'perf', sortable: true, mono: true, listColumn: true, listWidth: 130, listLabel: 'TS Extreme', compare: 'higher-better' },
    { key: 'snl_graphics', label: 'Speed Way 跑分', type: 'number', group: 'perf', sortable: true, mono: true, listLabel: 'Speed Way', compare: 'higher-better' },
    { key: 'port_royal', label: 'Port Royal (光追)', type: 'number', group: 'rt', sortable: true, mono: true, highlight: true, listColumn: true, listWidth: 130, listLabel: 'Port Royal', compare: 'higher-better' },
    { key: 'rt_notes', label: '光追技术', type: 'text', group: 'rt', placeholder: '如 RT Core 数量、DXR 特性等' },
    { key: 'ai_tops', label: 'AI 算力 (INT8)', type: 'text', group: 'ai', unit: 'TOPS', sortable: true, mono: true, highlight: true, listColumn: true, listWidth: 120, listLabel: 'AI TOPS', compare: 'higher-better' },
    { key: 'ai_notes', label: 'AI 技术', type: 'text', group: 'ai', placeholder: '如 Tensor Core 数量、DLSS 版本等' }
  ],
  filters: ['brand', 'generation', 'vram_type']
};
