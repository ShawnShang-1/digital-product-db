import type { CategorySchema } from '../schema';
import { cpuSchema } from './cpu';
import { socSchema } from './soc';
import { gpuSchema } from './gpu';
import { aircraftSchema } from './aircraft';
import { carSchema } from './car';
import { cameraBodySchema } from './cameraBody';
import { cameraLensSchema } from './cameraLens';

/**
 * 全部分类注册表
 * 新增分类：在此数组追加一个 schema 对象即可，应用会自动建表、生成列表/详情/表单/对比视图
 */
export const schemas: CategorySchema[] = [
  cpuSchema,
  socSchema,
  gpuSchema,
  aircraftSchema,
  carSchema,
  cameraBodySchema,
  cameraLensSchema
];

export const schemaMap: Record<string, CategorySchema> = schemas.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<string, CategorySchema>
);

export function getSchema(id: string): CategorySchema | undefined {
  return schemaMap[id];
}
