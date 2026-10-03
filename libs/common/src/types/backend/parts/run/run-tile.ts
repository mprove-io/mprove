import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RunQuery,
  zRunQuery
} from '#common/types/backend/parts/run/run-query';

export type RunTile = {
  title: string;
  query: RunQuery;
};

export let zRunTile = z
  .object({
    title: z.string(),
    query: zRunQuery
  })
  .meta({ id: 'RunTile' });

assertTypesEqual<RunTile, z.infer<typeof zRunTile>>({ value: true });
