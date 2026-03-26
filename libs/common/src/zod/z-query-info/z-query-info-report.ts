import { z } from 'zod';
import { zQueryInfoRow } from '#common/zod/z-query-info/z-query-info-row';

export let zQueryInfoReport = z.object({
  title: z.string(),
  reportId: z.string(),
  url: z.string(),
  rows: z.array(zQueryInfoRow)
});
