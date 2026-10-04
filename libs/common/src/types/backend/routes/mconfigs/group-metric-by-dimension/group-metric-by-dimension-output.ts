import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigX,
  zMconfigX
} from '#common/types/backend/parts/mconfig/mconfig-x';
import { type Query, zQuery } from '#common/types/blockml/parts/query/query';

export type ToBackendGroupMetricByDimensionOutput = {
  mconfig: MconfigX;
  query: Query;
};

export let zToBackendGroupMetricByDimensionOutput = z
  .object({
    mconfig: zMconfigX,
    query: zQuery
  })
  .meta({ id: 'ToBackendGroupMetricByDimensionOutput' });

assertTypesEqual<
  ToBackendGroupMetricByDimensionOutput,
  z.infer<typeof zToBackendGroupMetricByDimensionOutput>
>({ value: true });
