/**
 * macOS 风格标题栏 — 含交通灯按钮、应用名、主题切换
 */
import React from 'react';
import type { CategorySchema } from '../../shared/schema';
import type { ViewMode, Theme } from '../App';
import { Icon, ICONS } from './Icon';

interface Props {
  schema?: CategorySchema;
  view: ViewMode;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}

export const TitleBar: React.FC<Props> = ({ schema, view, theme, onThemeChange }) => {
  const viewLabel: Record<ViewMode, string> = {
    list: schema?.name ?? '',
    detail: '详情',
    edit: '编辑',
    compare: '对比',
    search: '搜索'
  };

  const cycleTheme = () => {
    const order: Theme[] = ['system', 'light', 'dark'];
    const idx = order.indexOf(theme);
    onThemeChange(order[(idx + 1) % order.length]);
  };

  const themeIcon =
    theme === 'light' ? ICONS.sun : theme === 'dark' ? ICONS.moon : ICONS.sun;

  return (
    <div className="title-bar">
      <div className="title-bar-traffic-placeholder" />
      <div className="title-bar-center">
        <span className="title-app-name">产品数据库</span>
        <span className="title-divider">/</span>
        <span className="title-category">{viewLabel[view]}</span>
      </div>
      <div className="title-bar-right">
        <button
          className="theme-btn"
          onClick={cycleTheme}
          title={`主题：${theme === 'system' ? '跟随系统' : theme === 'light' ? '浅色' : '深色'}`}
        >
          <Icon size={14} paths={themeIcon} />
        </button>
      </div>
    </div>
  );
};
