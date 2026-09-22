import type { BmError } from '#blockml/classes/bm-error';
import type { ExtraSchema } from '#common/zod/backend/connection-schemas/extra-schema';
import type { MproveConfig } from '#common/zod/backend/mprove-config';
import type { FileChart } from '#common/zod/blockml/internal/file-chart';
import type { FileDashboard } from '#common/zod/blockml/internal/file-dashboard';
import type { FileReport } from '#common/zod/blockml/internal/file-report';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import type { Model } from '#common/zod/blockml/model';
import type { ModelMetric } from '#common/zod/blockml/model-metric';
import type { Preset } from '#common/zod/blockml/preset';
import type { Space } from '#common/zod/blockml/space';

export type RebuildStructPrep = {
  errors: BmError[];
  stores: FileStore[];
  dashboards: FileDashboard[];
  metrics: ModelMetric[];
  presets: Preset[];
  apiModels: Model[];
  reports: FileReport[];
  charts: FileChart[];
  spaces: Space[];
  extraSchemas: ExtraSchema[];
  mproveExplorer: string;
  mproveConfig: MproveConfig;
};
