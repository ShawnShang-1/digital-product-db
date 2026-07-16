/**
 * 新增/编辑表单 — 按 schema 字段自动渲染，支持 Tab 切换
 */
import React, { useEffect, useState, useRef } from 'react';
import type { CategorySchema } from '../../shared/schema';
import { Icon, ICONS } from './Icon';

interface Props {
  schema: CategorySchema;
  id: number | null; // null = 新建
  onCancel: () => void;
  onSaved: () => void;
}

export const EditView: React.FC<Props> = ({ schema, id, onCancel, onSaved }) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (id !== null) {
      window.db.get(schema.id, id).then((r) => {
        if (r) setValues(r);
      });
    } else {
      // 新建时预填 select 字段为空字符串避免受控告警
      const init: Record<string, any> = {};
      schema.fields.forEach((f) => {
        if (f.type === 'select') init[f.key] = '';
      });
      setValues(init);
    }
  }, [schema.id, id]);

  const handleChange = (key: string, v: any) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 清理空字符串 → null（数字/价格/年份类型）
      const cleaned: Record<string, any> = {};
      for (const f of schema.fields) {
        const v = values[f.key];
        if (v === '' || v === undefined) {
          cleaned[f.key] = null;
        } else if ((f.type === 'number' || f.type === 'price' || f.type === 'year') && v !== null) {
          const n = Number(v);
          cleaned[f.key] = isNaN(n) ? null : n;
        } else {
          cleaned[f.key] = v;
        }
      }
      if (id !== null) {
        await window.db.update(schema.id, id, cleaned);
      } else {
        await window.db.create(schema.id, cleaned);
      }
      onSaved();
    } catch (e) {
      console.error(e);
      alert('保存失败：' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Cmd+S 保存
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [values]);

  const title = id !== null ? `编辑 ${values[schema.nameField] || ''}` : `新增${schema.name}`;

  return (
    <>
      <div className="detail-topbar">
        <button className="back-btn" onClick={onCancel}>
          <Icon size={14} paths={ICONS.back} />
          取消
        </button>
        <h1 className="detail-title">{title}</h1>
        <div className="detail-actions">
          <button className="btn-action btn-secondary" onClick={onCancel} disabled={saving}>
            取消
          </button>
          <button className="btn-action btn-primary-blue" onClick={handleSave} disabled={saving}>
            <Icon size={14} paths={ICONS.check} />
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>

      <div className="form-body">
        <div className="form-sections">
          {schema.groups.map((group) => {
            const fields = schema.fields.filter((f) => f.group === group.id);
            if (!fields.length) return null;
            return (
              <div className="form-card" key={group.id}>
                <div className="form-card-header">
                  <div className="spec-card-icon">
                    <Icon size={14} paths={group.icon} />
                  </div>
                  <h3 className="form-card-title">{group.label}</h3>
                </div>
                <div className="form-grid">
                  {fields.map((f) => {
                    const isTextarea = f.type === 'textarea';
                    const common = {
                      value: values[f.key] ?? '',
                      onChange: (e: any) => handleChange(f.key, e.target.value),
                      placeholder: f.placeholder || `请输入${f.label}`,
                      className: `${isTextarea ? 'form-textarea' : f.type === 'select' ? 'form-select' : 'form-input'} ${f.mono ? 'mono' : ''}`,
                      ref: firstInputRef
                    };
                    return (
                      <div className={`form-item ${isTextarea ? 'full' : ''}`} key={f.key}>
                        <label className="form-label">
                          {f.label}
                          {f.unit && <span className="unit">({f.unit})</span>}
                        </label>
                        {f.type === 'select' ? (
                          <select {...common as any}>
                            <option value="">未选择</option>
                            {f.options?.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        ) : isTextarea ? (
                          <textarea {...common as any} rows={3} />
                        ) : (
                          <input
                            {...common as any}
                            type={f.type === 'number' || f.type === 'price' || f.type === 'year' ? 'number' : 'text'}
                          />
                        )}
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
