/**
 * 静态 seed 注册表
 * 新增分类时：在 schemas/index.ts 注册 schema + 在此 import seed 并加入 registry
 */
import cpuSeed from './cpu.json';
import socSeed from './soc.json';
import gpuSeed from './gpu.json';
import aircraftSeed from './aircraft.json';
import carSeed from './car.json';
import cameraBodySeed from './camera-body.json';
import cameraLensSeed from './camera-lens.json';

type SeedRow = Record<string, any>;

export const seedRegistry: Record<string, SeedRow[]> = {
  cpu: cpuSeed as SeedRow[],
  soc: socSeed as SeedRow[],
  gpu: gpuSeed as SeedRow[],
  aircraft: aircraftSeed as SeedRow[],
  car: carSeed as SeedRow[],
  'camera-body': cameraBodySeed as SeedRow[],
  'camera-lens': cameraLensSeed as SeedRow[]
};
