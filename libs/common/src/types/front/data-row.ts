import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Row, zRow } from '#common/types/blockml/parts/row';
import type { Extend } from '#common/types/extend';

export type DataRow = Extend<
  Row,
  { showMetricsParameters: boolean; finalRowHeight: number }
>;

export let zDataRow = zRow
  .extend({
    showMetricsParameters: z.boolean(),
    finalRowHeight: z.number()
  })
  .meta({ id: 'DataRow' });

assertTypesEqual<DataRow, z.infer<typeof zDataRow>>({ value: true });
