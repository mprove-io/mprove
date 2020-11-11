import { Calculation } from '../field-types/calculation';
import { Dimension } from '../field-types/dimension';
import { Filter } from '../field-types/filter';
import { Measure } from '../field-types/measure';
import { Time } from '../field-types/time';

export interface FieldAny
  extends Dimension,
    Time,
    Measure,
    Calculation,
    Filter {}
