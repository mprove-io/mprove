import type { FieldDimension } from '#common/types/blockml/parts/internal/field-dimension';
import type { FieldFilter } from '#common/types/blockml/parts/internal/field-filter';
import type { FieldMeasure } from '#common/types/blockml/parts/internal/field-measure';
import type { FieldStoreDimension } from '#common/types/blockml/parts/internal/field-store-dimension';
import type { FieldStoreFilter } from '#common/types/blockml/parts/internal/field-store-filter';
import type { FieldStoreMeasure } from '#common/types/blockml/parts/internal/field-store-measure';
import type { FieldTime } from '#common/types/blockml/parts/internal/field-time';
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
