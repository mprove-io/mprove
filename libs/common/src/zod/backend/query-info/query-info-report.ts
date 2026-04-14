import { z } from 'zod';
import { zQueryInfoRow } from '#common/zod/backend/query-info/query-info-row';

export let zQueryInfoReport = z
  .object({
    title: z.string(),
    reportId: z.string(),
    url: z.string(),
    rows: z.array(zQueryInfoRow)
  })
  .meta({ id: 'QueryInfoReport' });

export type ZQueryInfoReport = z.infer<typeof zQueryInfoReport>;
