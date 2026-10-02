import { z } from 'zod';
import { zQueryInfoQuery } from '#common/types/backend/query-info/query-info-query';

export let zQueryInfoTile = z
  .object({
    title: z.string(),
    query: zQueryInfoQuery
  })
  .meta({ id: 'QueryInfoTile' });

export type QueryInfoTile = z.infer<typeof zQueryInfoTile>;
