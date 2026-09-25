import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { ExtraSchema } from '#common/zod/backend/connection-schemas/extra-schema';
import { zExtraSchema } from '#common/zod/backend/connection-schemas/extra-schema';
import type { MproveConfig } from '#common/zod/backend/mprove-config';
import { zMproveConfig } from '#common/zod/backend/mprove-config';
import type { BmlError } from '#common/zod/blockml/bml-error';
import { zBmlError } from '#common/zod/blockml/bml-error';
import type { Chart } from '#common/zod/blockml/chart';
import { zChart } from '#common/zod/blockml/chart';
import type { Dashboard } from '#common/zod/blockml/dashboard';
import { zDashboard } from '#common/zod/blockml/dashboard';
import type { Mconfig } from '#common/zod/blockml/mconfig';
import { zMconfig } from '#common/zod/blockml/mconfig';
import type { Model } from '#common/zod/blockml/model';
import { zModel } from '#common/zod/blockml/model';
import type { ModelMetric } from '#common/zod/blockml/model-metric';
import { zModelMetric } from '#common/zod/blockml/model-metric';
import type { Preset } from '#common/zod/blockml/preset';
import { zPreset } from '#common/zod/blockml/preset';
import type { Query } from '#common/zod/blockml/query';
import { zQuery } from '#common/zod/blockml/query';
import type { Report } from '#common/zod/blockml/report';
import { zReport } from '#common/zod/blockml/report';
import {
  makeToBlockmlResponseSchema,
  type ToBlockmlResponse
} from '#common/zod/blockml/response/to-blockml-response';
import type { Space } from '#common/zod/blockml/space';
import { zSpace } from '#common/zod/blockml/space';
import {
  type ToBlockmlRebuildStructError,
  zToBlockmlRebuildStructError
} from './rebuild-struct-error';

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

export type ToBlockmlRebuildStructResponse = ToBlockmlResponse<
  'rebuildStruct',
  ToBlockmlRebuildStructOutput,
  ToBlockmlRebuildStructError
>;

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

export let zToBlockmlRebuildStructResponse = makeToBlockmlResponseSchema({
  operation: 'rebuildStruct',
  success: zToBlockmlRebuildStructOutput,
  error: zToBlockmlRebuildStructError
});

assertTypesEqual<
  ToBlockmlRebuildStructOutput,
  z.infer<typeof zToBlockmlRebuildStructOutput>
>({ value: true });

assertTypesEqual<
  ToBlockmlRebuildStructResponse,
  z.infer<typeof zToBlockmlRebuildStructResponse>
>({ value: true });
