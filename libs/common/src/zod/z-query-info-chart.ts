import { z } from 'zod';
import { zQueryInfoQuery } from '#common/zod/z-query-info-query';

export let zQueryInfoChart = z.object({
  title: z.string(),
  chartId: z.string(),
  url: z.string(),
  query: zQueryInfoQuery
});
