import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type QueryInfoRow,
  zQueryInfoRow
} from '#common/types/backend/parts/query-info/query-info-row';

export type QueryInfoReport = {
  title: string;
  reportId: string;
  url: string;
  rows: QueryInfoRow[];
};

export let zQueryInfoReport = z
  .object({
    title: z.string(),
    reportId: z.string(),
    url: z.string(),
    rows: z.array(zQueryInfoRow)
  })
  .meta({ id: 'QueryInfoReport' });

assertTypesEqual<QueryInfoReport, z.infer<typeof zQueryInfoReport>>({
  value: true
});
