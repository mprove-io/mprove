import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Query, zQuery } from '#common/types/blockml/parts/query';

export type ToBackendGetQueryOutput = {
  query: Query;
};

export let zToBackendGetQueryOutput = z
  .object({
    query: zQuery
  })
  .meta({ id: 'ToBackendGetQueryOutput' });

assertTypesEqual<
  ToBackendGetQueryOutput,
  z.infer<typeof zToBackendGetQueryOutput>
>({ value: true });
