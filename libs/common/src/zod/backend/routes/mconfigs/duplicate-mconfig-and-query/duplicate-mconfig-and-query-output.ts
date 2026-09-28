import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type MconfigX, zMconfigX } from '#common/zod/backend/mconfig-x';
import { type Query, zQuery } from '#common/zod/blockml/query';

export type ToBackendDuplicateMconfigAndQueryOutput = {
  mconfig: MconfigX;
  query: Query;
};

export let zToBackendDuplicateMconfigAndQueryOutput = z
  .object({
    mconfig: zMconfigX,
    query: zQuery
  })
  .meta({ id: 'ToBackendDuplicateMconfigAndQueryOutput' });

assertTypesEqual<
  ToBackendDuplicateMconfigAndQueryOutput,
  z.infer<typeof zToBackendDuplicateMconfigAndQueryOutput>
>({ value: true });
