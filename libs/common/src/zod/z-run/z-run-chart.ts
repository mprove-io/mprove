import { z } from 'zod';
import { zRunQuery } from '#common/zod/z-run/z-run-query';

export let zRunChart = z.object({
  title: z.string().nullish(),
  chartId: z.string().nullish(),
  url: z.string().nullish(),
  query: zRunQuery.nullish()
});
