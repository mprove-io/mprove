import { FieldDimension } from './field-dimension';
import { FieldFilter } from './field-filter';
import { FieldMeasure } from './field-measure';
import { FieldStoreDimension } from './field-store-dimension';
import { FieldStoreFilter } from './field-store-filter';
import { FieldStoreMeasure } from './field-store-measure';
import { FieldTime } from './field-time';

// TODO: FieldAny types

export interface FieldAny
  extends FieldDimension,
    FieldStoreDimension,
    FieldTime,
    FieldMeasure,
    FieldStoreMeasure,
    FieldFilter,
    FieldStoreFilter {}
