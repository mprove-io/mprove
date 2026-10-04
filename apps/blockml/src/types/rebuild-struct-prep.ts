import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { ExtraSchema } from '#common/types/backend/parts/connection-schemas/extra-schemas/extra-schema';
import type { MproveConfig } from '#common/types/backend/parts/mprove-config';
import type { FileChart } from '#common/types/blockml/parts/internal/file-chart';
import type { FileDashboard } from '#common/types/blockml/parts/internal/file-dashboard';
import type { FileReport } from '#common/types/blockml/parts/internal/file-report';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import type { Preset } from '#common/types/blockml/parts/preset';
import type { Space } from '#common/types/blockml/parts/space';

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
