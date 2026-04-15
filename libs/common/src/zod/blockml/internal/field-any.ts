import { z } from 'zod';
import { zFieldDimension } from '#common/zod/blockml/internal/field-dimension';
import { zFieldFilter } from '#common/zod/blockml/internal/field-filter';
import { zFieldMeasure } from '#common/zod/blockml/internal/field-measure';
import { zFieldStoreDimension } from '#common/zod/blockml/internal/field-store-dimension';
import { zFieldStoreFilter } from '#common/zod/blockml/internal/field-store-filter';
import { zFieldStoreMeasure } from '#common/zod/blockml/internal/field-store-measure';
import { zFieldTime } from '#common/zod/blockml/internal/field-time';

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
