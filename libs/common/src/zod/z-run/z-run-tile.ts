import { z } from 'zod';
import { zRunQuery } from '#common/zod/z-run/z-run-query';

export let zRunTile = z.object({
  title: z.string(),
  query: zRunQuery
});
