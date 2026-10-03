import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RunQuery,
  zRunQuery
} from '#common/types/backend/parts/run/run-query';

export type RunChart = {
  title: string;
  chartId: string;
  url: string;
  query: RunQuery;
};

export let zRunChart = z
  .object({
    title: z.string(),
    chartId: z.string(),
    url: z.string(),
    query: zRunQuery
  })
  .meta({ id: 'RunChart' });

assertTypesEqual<RunChart, z.infer<typeof zRunChart>>({ value: true });
