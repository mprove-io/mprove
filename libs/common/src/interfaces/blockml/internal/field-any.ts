import { FieldCalculation } from './field-calculation';
import { FieldDimension } from './field-dimension';
import { FieldFilter } from './field-filter';
import { FieldMeasure } from './field-measure';
import { FieldTime } from './field-time';

export interface FieldAny
  extends FieldDimension,
    FieldTime,
    FieldMeasure,
    FieldCalculation,
    FieldFilter {}
