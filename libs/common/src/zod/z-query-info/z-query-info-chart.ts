import { z } from 'zod';
import { zQueryInfoQuery } from '#common/zod/z-query-info/z-query-info-query';

export let zQueryInfoChart = z.object({
  title: z.string().nullish(),
  chartId: z.string().nullish(),
  url: z.string().nullish(),
  query: zQueryInfoQuery.nullish()
});
