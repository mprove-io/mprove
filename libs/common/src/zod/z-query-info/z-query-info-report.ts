import { z } from 'zod';
import { zQueryInfoRow } from '#common/zod/z-query-info/z-query-info-row';

export let zQueryInfoReport = z.object({
  title: z.string().nullish(),
  reportId: z.string().nullish(),
  url: z.string().nullish(),
  rows: z.array(zQueryInfoRow).nullish()
});
