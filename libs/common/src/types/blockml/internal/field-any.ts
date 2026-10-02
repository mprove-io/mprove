import { z } from 'zod';
import { zFieldDimension } from '#common/types/blockml/internal/field-dimension';
import { zFieldFilter } from '#common/types/blockml/internal/field-filter';
import { zFieldMeasure } from '#common/types/blockml/internal/field-measure';
import { zFieldStoreDimension } from '#common/types/blockml/internal/field-store-dimension';
import { zFieldStoreFilter } from '#common/types/blockml/internal/field-store-filter';
import { zFieldStoreMeasure } from '#common/types/blockml/internal/field-store-measure';
import { zFieldTime } from '#common/types/blockml/internal/field-time';

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

export type FieldAny = z.infer<typeof zFieldAny>;
