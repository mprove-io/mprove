import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type QueryInfoQuery,
  zQueryInfoQuery
} from '#common/types/backend/parts/query-info/query-info-query';

export type QueryInfoTile = { title: string; query: QueryInfoQuery };

export let zQueryInfoTile = z
  .object({
    title: z.string(),
    query: zQueryInfoQuery
  })
  .meta({ id: 'QueryInfoTile' });

assertTypesEqual<QueryInfoTile, z.infer<typeof zQueryInfoTile>>({
  value: true
});
