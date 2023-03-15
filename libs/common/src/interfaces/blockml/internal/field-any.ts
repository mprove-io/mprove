import { Calculation } from './field-calculation';
import { Dimension } from './field-dimension';
import { FieldFilter } from './field-filter';
import { Measure } from './field-measure';
import { Time } from './field-time';

export interface FieldAny
  extends Dimension,
    Time,
    Measure,
    Calculation,
    FieldFilter {}
