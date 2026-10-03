import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type QueryInfoQuery,
  zQueryInfoQuery
} from '#common/types/backend/parts/query-info/query-info-query';

export type QueryInfoChart = {
  title: string;
  chartId: string;
  url: string;
  query: QueryInfoQuery;
};

export let zQueryInfoChart = z
  .object({
    title: z.string(),
    chartId: z.string(),
    url: z.string(),
    query: zQueryInfoQuery
  })
  .meta({ id: 'QueryInfoChart' });

assertTypesEqual<QueryInfoChart, z.infer<typeof zQueryInfoChart>>({
  value: true
});
