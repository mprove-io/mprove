import { z } from 'zod';
import { zQueryInfoQuery } from '#common/zod/backend/query-info/query-info-query';

export let zQueryInfoTile = z
  .object({
    title: z.string(),
    query: zQueryInfoQuery
  })
  .meta({ id: 'QueryInfoTile' });

export type ZQueryInfoTile = z.infer<typeof zQueryInfoTile>;
