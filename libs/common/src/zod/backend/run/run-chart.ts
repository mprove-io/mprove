import { z } from 'zod';
import { zRunQuery } from '#common/zod/backend/run/run-query';

export let zRunChart = z
  .object({
    title: z.string(),
    chartId: z.string(),
    url: z.string(),
    query: zRunQuery
  })
  .meta({ id: 'RunChart' });

export type RunChart = z.infer<typeof zRunChart>;
