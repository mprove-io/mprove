import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type Tile = {
  modelId: string;
  modelLabel: string;
  modelFilePath: string;
  mconfigId: string;
  queryId: string;
  trackChangeId: string;
  listen: Record<string, string>;
  deletedFilterFieldIds?: string[];
  title: string;
  plateWidth: number;
  plateHeight: number;
  plateX: number;
  plateY: number;
};

export let zTile = z
  .object({
    modelId: z.string(),
    modelLabel: z.string(),
    modelFilePath: z.string(),
    mconfigId: z.string(),
    queryId: z.string(),
    trackChangeId: z.string(),
    listen: z.record(z.string(), z.string()),
    deletedFilterFieldIds: z.array(z.string()).nullish(),
    title: z.string(),
    plateWidth: z.number(),
    plateHeight: z.number(),
    plateX: z.number(),
    plateY: z.number()
  })
  .meta({ id: 'Tile' });

assertTypesEqual<Tile, z.infer<typeof zTile>>({ value: true });
