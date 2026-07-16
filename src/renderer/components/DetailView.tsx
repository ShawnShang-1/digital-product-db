/**
 * 详情卡片视图 — 分组展示完整参数
 */
import React, { useEffect, useState } from 'react';
import type { CategorySchema, ProductRecord } from '../../shared/schema';
import { Icon, ICONS } from './Icon';

interface Props {
  schema: CategorySchema;
  id: number;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCompare: () => void;
  isInCompare: boolean;
}

export const DetailView: React.FC<Props> = ({
  schema,
  id,
  onBack,
  onEdit,
  onDelete,
  onAddToCompare,
  isInCompare
}) => {
  const [record, setRecord] = useState<ProductRecord | null>(null);

  useEffect(() => {
    window.db.get(schema.id, id).then(setRecord);
  }, [schema.id, id]);

  if (!record) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><Icon size={28} paths={ICONS.database} /></div>
        <div className="empty-state-title">加载中…</div>
      </div>
    );
  }

  const name = String(record[schema.nameField] || '');
  const brand = String(record[schema.brandField] || '');
  const brandColor = schema.brandColors?.[brand] || 'var(--apple-text-400)';

  // 价格字段
  const priceField = schema.fields.find((f) => f.type === 'price');
  const price = priceField ? record[priceField.key] : null;

  // 副标题
  const subtitles = (schema.subtitleFields || [])
    .map((k) => record[k])
    .filter((v) => v !== null && v !== undefined && v !== '')
    .map(String);

  const formatValue = (value: any, type: string, unit?: string) => {
    if (value === null || value === undefined || value === '') return null;
    if (type === 'price') return `¥${Number(value).toLocaleString()}`;
    if (type === 'year') return String(Math.round(Number(value)));
    if (unit) return `${value} ${unit}`;
    return String(value);
  };

  return (
    <>
      <div className="detail-topbar">
        <button className="back-btn" onClick={onBack}>
          <Icon size={14} paths={ICONS.back} />
          返回
        </button>
        <h1 className="detail-title">{name}</h1>
        <div className="detail-actions">
          <button
            className={`btn-action ${isInCompare ? 'btn-secondary' : 'btn-primary-blue'}`}
            onClick={onAddToCompare}
          >
            <Icon size={14} paths={ICONS.compare} />
            {isInCompare ? '已加入对比' : '加入对比'}
          </button>
          <button className="btn-action btn-primary-blue" onClick={onEdit}>
            <Icon size={14} paths={ICONS.edit} />
            编辑
          </button>
          <button className="btn-action btn-text-danger" onClick={onDelete}>
            <Icon size={14} paths={ICONS.trash} />
            删除
          </button>
        </div>
      </div>

      <div className="detail-body">
        {/* 产品徽章栏 */}
        <div className="product-badge-bar">
          <div className="product-icon">
            <Icon size={28} paths={schema.icon} />
          </div>
          <div className="product-badge-info">
            <div className="product-badge-name">{name}</div>
            <div className="product-badge-meta">
              <span className="brand-tag">
                <span className="brand-dot" style={{ background: brandColor }} />
                {brand}
              </span>
              {subtitles.map((s, i) => (
                <span key={i} className="product-badge-tag">{s}</span>
              ))}
            </div>
          </div>
          {price !== null && price !== undefined && price !== '' && (
            <div className="product-badge-price">¥{Number(price).toLocaleString()}</div>
          )}
        </div>

        {/* 参数分组卡片 */}
        <div className="spec-sections">
          {schema.groups.map((group) => {
            const fields = schema.fields.filter((f) => f.group === group.id);
            if (!fields.length) return null;
            return (
              <div className="spec-card" key={group.id}>
                <div className="spec-card-header">
                  <div className="spec-card-icon">
                    <Icon size={14} paths={group.icon} />
                  </div>
                  <h3 className="spec-card-title">{group.label}</h3>
                </div>
                <div className="spec-grid">
                  {fields.map((f) => {
                    const raw = record[f.key];
                    const formatted = formatValue(raw, f.type, f.unit);
                    return (
                      <div className="spec-item" key={f.key}>
                        <span className="spec-item-key">{f.label}</span>
                        <span
                          className={`spec-item-value ${f.mono ? 'mono' : ''} ${
                            f.highlight && formatted ? 'highlight' : ''
                          } ${!formatted ? 'empty' : ''}`}
                        >
                          {formatted ?? '未填写'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
