import { z } from 'zod';
import { zQueryInfoQuery } from '#common/zod/z-query-info/z-query-info-query';

export let zQueryInfoTile = z.object({
  title: z.string(),
  query: zQueryInfoQuery
});
