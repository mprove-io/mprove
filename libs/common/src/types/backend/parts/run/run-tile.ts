import { z } from 'zod';
import { zRunQuery } from '#common/types/backend/parts/run/run-query';

export let zRunTile = z
  .object({
    title: z.string(),
    query: zRunQuery
  })
  .meta({ id: 'RunTile' });

export type RunTile = z.infer<typeof zRunTile>;
