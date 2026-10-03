import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FieldDimension,
  zFieldDimension
} from '#common/types/blockml/parts/internal/field-dimension';
import {
  type FieldFilter,
  zFieldFilter
} from '#common/types/blockml/parts/internal/field-filter';
import {
  type FieldMeasure,
  zFieldMeasure
} from '#common/types/blockml/parts/internal/field-measure';
import {
  type FieldStoreDimension,
  zFieldStoreDimension
} from '#common/types/blockml/parts/internal/field-store-dimension';
import {
  type FieldStoreFilter,
  zFieldStoreFilter
} from '#common/types/blockml/parts/internal/field-store-filter';
import {
  type FieldStoreMeasure,
  zFieldStoreMeasure
} from '#common/types/blockml/parts/internal/field-store-measure';
import {
  type FieldTime,
  zFieldTime
} from '#common/types/blockml/parts/internal/field-time';
import type { Extend } from '#common/types/extend';

export type FieldAny = Extend<
  Extend<
    Extend<
      Extend<
        Extend<Extend<FieldDimension, FieldStoreDimension>, FieldTime>,
        FieldMeasure
      >,
      FieldStoreMeasure
    >,
    FieldFilter
  >,
  FieldStoreFilter
>;

export let zFieldAny = z
  .object({
    ...zFieldDimension.shape,
    ...zFieldStoreDimension.shape,
    ...zFieldTime.shape,
    ...zFieldMeasure.shape,
    ...zFieldStoreMeasure.shape,
    ...zFieldFilter.shape,
    ...zFieldStoreFilter.shape
  })
  .meta({ id: 'FieldAny' });

assertTypesEqual<FieldAny, z.infer<typeof zFieldAny>>({ value: true });
