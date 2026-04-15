import { z } from 'zod';
import { zQueryInfoQuery } from '#common/zod/backend/query-info/query-info-query';

export let zQueryInfoChart = z
  .object({
    title: z.string(),
    chartId: z.string(),
    url: z.string(),
    query: zQueryInfoQuery
  })
  .meta({ id: 'QueryInfoChart' });

export type QueryInfoChart = z.infer<typeof zQueryInfoChart>;
