import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ModelField,
  zModelField
} from '#common/types/blockml/parts/model-field';
import { type Row, zRow } from '#common/types/blockml/parts/row';
import type { Extend } from '#common/types/extend';

export type RowX2 = Extend<
  Row,
  {
    modelFields?: Record<string, ModelField[]>;
    mconfigListenSwap?: Record<string, string[]>;
  }
>;

export let zRowX2 = zRow
  .extend({
    modelFields: z.record(z.string(), z.array(zModelField)).nullish(),
    mconfigListenSwap: z.record(z.string(), z.array(z.string())).nullish()
  })
  .meta({ id: 'RowX2' });

assertTypesEqual<RowX2, z.infer<typeof zRowX2>>({ value: true });
