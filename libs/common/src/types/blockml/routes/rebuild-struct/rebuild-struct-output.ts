import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ExtraSchema,
  zExtraSchema
} from '#common/types/backend/parts/connection-schemas/extra-schemas/extra-schema';
import {
  type MproveConfig,
  zMproveConfig
} from '#common/types/backend/parts/mprove-config';
import {
  type BmlError,
  zBmlError
} from '#common/types/blockml/parts/bml-error';
import { type Chart, zChart } from '#common/types/blockml/parts/chart';
import {
  type Dashboard,
  zDashboard
} from '#common/types/blockml/parts/dashboard';
import { type Mconfig, zMconfig } from '#common/types/blockml/parts/mconfig';
import { type Model, zModel } from '#common/types/blockml/parts/model';
import {
  type ModelMetric,
  zModelMetric
} from '#common/types/blockml/parts/model-metric';
import { type Preset, zPreset } from '#common/types/blockml/parts/preset';
import { type Query, zQuery } from '#common/types/blockml/parts/query';
import { type Report, zReport } from '#common/types/blockml/parts/report';
import { type Space, zSpace } from '#common/types/blockml/parts/space';

export type ToBlockmlRebuildStructOutput = {
  extraSchemas: ExtraSchema[];
  mproveConfig: MproveConfig;
  errors: BmlError[];
  models: Model[];
  dashboards: Dashboard[];
  reports: Report[];
  charts: Chart[];
  metrics: ModelMetric[];
  presets: Preset[];
  spaces: Space[];
  mproveExplorer?: string;
  mconfigs: Mconfig[];
  queries: Query[];
};

export let zToBlockmlRebuildStructOutput = z
  .object({
    extraSchemas: z.array(zExtraSchema),
    mproveConfig: zMproveConfig,
    errors: z.array(zBmlError),
    models: z.array(zModel),
    dashboards: z.array(zDashboard),
    reports: z.array(zReport),
    charts: z.array(zChart),
    metrics: z.array(zModelMetric),
    presets: z.array(zPreset),
    spaces: z.array(zSpace),
    mproveExplorer: z.string().nullish(),
    mconfigs: z.array(zMconfig),
    queries: z.array(zQuery)
  })
  .meta({ id: 'ToBlockmlRebuildStructOutput' });

assertTypesEqual<
  ToBlockmlRebuildStructOutput,
  z.infer<typeof zToBlockmlRebuildStructOutput>
>({ value: true });
